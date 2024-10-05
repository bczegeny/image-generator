const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const readJobs = require('./readJobs');
const processAllJobs = require('./processAllJobs');
const checkAndSaveJobs = require('./checkAndSaveJobs');

const app = express();
const PORT = 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Set up storage for file uploads
const upload = multer({ dest: 'uploads/' });

// Variables to store job info and statuses
let jobIds = [];
let jobStatuses = [];

// File upload endpoint (POST request)
app.post('/upload', upload.single('jobFile'), async (req, res) => {
  const filePath = path.join(__dirname, req.file.path);

  // Read and process the job file
  const prompts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  jobStatuses = prompts.map((prompt) => ({ prompt, status: 'not started', progress: 0 }));

  // Queue jobs and respond immediately
  jobIds = await processAllJobs(prompts, updateProgress); // Pass updateProgress here
  jobIds.forEach((job, idx) => {
    jobStatuses[idx].taskId = job.taskId; // Store taskId in jobStatuses
    jobStatuses[idx].status = 'queued';
  });

  // Respond immediately after queuing jobs
  res.json({ success: true, message: 'Jobs uploaded and processing started.' });

  // Continue processing jobs in the background
  checkAndSaveJobs(jobIds, updateProgress); // Pass updateProgress here
});

// Function to update progress
function updateProgress(taskId, progress) {
  const job = jobStatuses.find(j => j.taskId === taskId);
  if (job) {
    job.status = progress === 100 ? 'completed' : 'in progress';
    job.progress = progress;
  }
}

// Endpoint to get job statuses (polled by frontend)
app.get('/status', (req, res) => {
  res.json({ jobs: jobStatuses });
});

// Serve the frontend (progress view and file upload)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
