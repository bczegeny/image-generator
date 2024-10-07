const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Correct the API endpoint to include the task_id dynamically
const API_STATUS_ENDPOINT = 'http://127.0.0.1:7860/sd-queue';

async function checkAndSaveJobs(jobIds, updateProgress) {
  let activeJobs = jobIds.slice(0, 150); // Start with the first 30 jobs
  let completedJobsCount = 0;

  while (activeJobs.length > 0) {
    for (const job of [...activeJobs]) {
      try {
        const response = await axios.get(`${API_STATUS_ENDPOINT}/${job.taskId}/status`);
        if (response.status === 200) {
          const data = response.data;
          const status = data.status;

          if (status === 'completed') {
            const images = data.result.images;
            const infoString = data.result.info;
            let seed = null;
            let loraUsed = false;

            // Parse the info string to extract the seed and LoRA usage
            try {
              const info = JSON.parse(infoString);
              seed = info.seed;
              loraUsed = info.extra_generation_params && info.extra_generation_params['Lora hashes'] ? true : false;
            } catch (parseError) {
              console.error(`Error parsing info for job ${job.taskId}:`, parseError);
            }

            // Ensure saveImages is called only once per job
            await saveImages(job.taskId, images, job.showType, job.payload.prompt, seed, loraUsed);

            updateProgress(job.taskId, 100);
            activeJobs.splice(activeJobs.indexOf(job), 1);
            completedJobsCount++;

            // Check if we need to queue more jobs
            if (completedJobsCount % 5 === 0 && jobIds.length > 0) {
              const nextBatch = jobIds.splice(0, 5);
              activeJobs.push(...nextBatch);
            }
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
    if (activeJobs.length === 0 && jobIds.length === 0) {
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function saveImages(taskId, images, showType, prompt, seed, loraUsed) {
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

    // Check for duplicate entries before adding
    const isDuplicate = metadata.some(entry => entry.filename === imgFilename);
    if (!isDuplicate) {
      // Add metadata for this image
      metadata.push({
        showType: showType || 'Unknown', // Default to 'Unknown' if undefined
        prompt: prompt || 'No prompt available', // Default if undefined
        seed: seed || 'No seed available', // Default if undefined
        loraUsed: loraUsed, // Store whether LoRA was used
        filename: imgFilename
      });
    }
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
