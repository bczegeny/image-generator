const axios = require('axios');

const API_QUEUE_ENDPOINT = 'http://127.0.0.1:7860/sd-queue/txt2img';
const API_STATUS_ENDPOINT = 'http://127.0.0.1:7860/sd-queue';

async function queueJobs(jobs) {
    const jobIds = [];

    for (const job of jobs) {
      try {
        const response = await axios.post(API_QUEUE_ENDPOINT,
          job.payload
        );
        if (response.status === 200) {
          const taskId = response.data.task_id;
          jobIds.push({ taskId, payload: job.payload, showType: job.showType });
        }
      } catch (error) {
        console.error('Error queuing job:', error);
      }
    }

    return jobIds;
  }

  async function processAllJobs(jobs, updateProgress) {
    const allJobIds = await queueJobs(jobs);

    // Periodically check the status of all jobs
    const interval = setInterval(async () => {
      await checkJobStatus(allJobIds, updateProgress);

      // Stop checking if all jobs are completed
      if (allJobIds.every(job => job.status === 'completed')) {
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds

    return allJobIds;
  }

  async function checkJobStatus(jobIds, updateProgress) {
    for (const job of jobIds) {
      try {
        const response = await axios.get(`${API_STATUS_ENDPOINT}/${job.taskId}/status`);
        if (response.status === 200) {
          const { status, progress } = response.data;
          if (status === 'in-progress') {
            updateProgress(job.taskId, progress * 100);
          } else if (status === 'completed') {
            updateProgress(job.taskId, 100);
          }
          job.status = status;
        }
      } catch (error) {
        console.error('Error checking job status:', error);
      }
    }
  }

  module.exports = processAllJobs;
