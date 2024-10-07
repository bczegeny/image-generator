# Bulk Image Generation System

This project is a bulk image generation system designed to work with the [Stable Diffusion WebUI Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge) and the [sd-queue extension](https://github.com/nmygle/sd-queue). It allows users to upload a JSON file containing job details, processes these jobs by queuing them to an image generation API, tracks their progress, and saves the generated images and prompts.

## Features

- Upload JSON files containing job details.
- Queue jobs to an image generation API using the sd-queue extension.
- Track job progress and display it on the frontend.
- Save generated images and prompts to the server.
- **New**: View a gallery of completed jobs with metadata including prompts, seeds, and LoRA usage.

## Prerequisites

- Node.js (version 14 or later)
- npm (Node Package Manager)
- [Stable Diffusion WebUI Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge)
- [sd-queue extension](https://github.com/nmygle/sd-queue)

## Setup

1. **Install Node.js and npm (for macOS)**

   If you don't have Node.js installed, you can install it using Homebrew:

   ```bash
   # Install Homebrew if you don't have it
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   # Install Node.js
   brew install node
   ```

   Verify the installation:

   ```bash
   node --version
   npm --version
   ```

2. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/bulk-image-gen.git
   cd bulk-image-gen
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Configure API Endpoint**

   Create a `.env` file in the root directory of the project and add the following line, replacing `YOUR_API_URL` with the correct URL of your Stable Diffusion WebUI Forge instance:

   ```
   API_BASE_URL=YOUR_API_URL
   ```

   For example:
   ```
   API_BASE_URL=http://localhost:7860
   ```

5. **Run the Server**

   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000`, and your default browser should open automatically.

## Usage

1. **Upload Job File**

   - Use the file upload form on the homepage to upload a JSON file containing job details.

2. **Monitor Job Progress**

   - The frontend will display the progress of each job.
   - Once completed, images and prompts will be saved in the `public/images` and `prompts` directories, respectively.

3. **View Job Gallery**

   - Navigate to `http://localhost:3000/gallery.html` to view the gallery of completed jobs.
   - The gallery displays images grouped by `showType`, with metadata such as prompts, seeds, and LoRA usage.
   - Use the "Show Metadata" checkbox to toggle the visibility of image metadata.

## JSON File Format

The JSON file should contain an array of job objects. Each job object should have the following structure:

```json
[
  {
    "payload": {
      "prompt": "Your prompt here",
      "otherData": "Additional data if needed"
    },
    "showType": "Type of display"
  }
]
```

## Directory Structure

- `public/`: Contains static files and directories for images and prompts.
- `uploads/`: Temporary storage for uploaded files.
- `prompts/`: Directory where prompt text files are saved.
- `processAllJobs.js`: Handles job queuing and status checking.
- `checkAndSaveJobs.js`: Handles saving images and prompts.
- `index.js`: Main server file.

## Troubleshooting

- **Images are black**: Ensure the base64 data is complete and correctly saved.
- **Jobs not updating**: Check the API endpoints and ensure the server is running.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
