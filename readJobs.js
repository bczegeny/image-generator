const fs = require('fs');
const path = require('path');

function readJobs(filename) {
  const filePath = path.join(__dirname, filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

module.exports = readJobs;
