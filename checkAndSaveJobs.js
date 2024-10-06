const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Correct the API endpoint to include the task_id dynamically
const API_STATUS_ENDPOINT = 'http://127.0.0.1:7860/sd-queue';

async function checkAndSaveJobs(jobIds, updateProgress) {
    while (jobIds.length > 0) {
      for (const job of [...jobIds]) {
        try {
          const response = await axios.get(`${API_STATUS_ENDPOINT}/${job.taskId}/status`);
          if (response.status === 200) {
            const data = response.data;
            const status = data.status;

            if (status === 'completed') {
              const images = data.result.images;
              const infoString = data.result.info;
              let seed = null;

              // Parse the info string to extract the seed
              try {
                const info = JSON.parse(infoString);
                seed = info.seed;
              } catch (parseError) {
                console.error(`Error parsing info for job ${job.taskId}:`, parseError);
              }

              await saveImages(job.taskId, images, job.showType, job.payload.prompt, seed);

              updateProgress(job.taskId, 100);
              jobIds.splice(jobIds.indexOf(job), 1);
            } else if (status === 'in-progress') {
              const progress = data.progress;
              updateProgress(job.taskId, progress * 100);
            } else {
              console.log(`Job ${job.taskId} is queued.`);
            }
          }
        } catch (error) {
          console.error(`Error checking status for job ${job.taskId}:`, error);
        }
      }

      // Exit the loop if all jobs are completed
      if (jobIds.length === 0) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async function saveImages(taskId, images, showType, prompt, seed) {
    const imagesDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const metadataPath = path.join(__dirname, 'public', 'metadata.json');
    let metadata = [];

    // Load existing metadata if the file exists
    if (fs.existsSync(metadataPath)) {
      try {
        const fileContent = fs.readFileSync(metadataPath, 'utf-8');
        metadata = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error reading metadata.json:', error);
        metadata = [];
      }
    }

    images.forEach((imgData, idx) => {
      console.log(`Saving image and base64 data for task ${taskId}, index ${idx}`);

      // Convert base64 to buffer and save as image
      const imgBuffer = Buffer.from(imgData, 'base64');
      const imgFilename = `${taskId}_${idx}.png`;
      const imgPath = path.join(imagesDir, imgFilename);
      fs.writeFileSync(imgPath, imgBuffer);

      // Add metadata for this image
      metadata.push({
        showType: showType || 'Unknown', // Default to 'Unknown' if undefined
        prompt: prompt || 'No prompt available', // Default if undefined
        seed: seed || 'No seed available', // Default if undefined
        filename: imgFilename
      });
    });

    // Save updated metadata
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  async function savePrompt(taskId, prompt) {
    const promptsDir = path.join(__dirname, 'prompts');
    if (!fs.existsSync(promptsDir)) {
      fs.mkdirSync(promptsDir, { recursive: true });
    }

    const promptPath = path.join(promptsDir, `${taskId}.txt`);
    fs.writeFileSync(promptPath, prompt);
  }

  module.exports = checkAndSaveJobs;
