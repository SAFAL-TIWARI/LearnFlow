/**
 * Deployment script for Vercel
 * This script prepares the project for deployment to Vercel
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Checking environment setup...');

// For Vercel deployment, environment variables should be set in the Vercel dashboard
// For local development, you should create your own .env files based on .env.example

// Check if .env.example exists
const envExamplePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envExamplePath)) {
  console.log('Creating .env.example file...');
  const envExampleContent = `# API Keys (used by server)
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id_here

# Auth Configuration (used by frontend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_NEXTAUTH_SECRET=your_nextauth_secret_here
# For local development use:
# VITE_NEXTAUTH_URL=http://localhost:3000
# For production use:
VITE_NEXTAUTH_URL=https://your-deployment-url.vercel.app

# Server Configuration
NODE_ENV=production
PORT=3000

# Note: This is an example file. Create a .env file with your actual values.
# Do NOT commit your actual .env file to version control!
`;
  fs.writeFileSync(envExamplePath, envExampleContent);
  console.log('.env.example file created. Use this as a template for your own .env file.');
} else {
  console.log('.env.example file exists.');
}

console.log('Environment setup check complete.');
console.log('IMPORTANT: For Vercel deployment, set all environment variables in the Vercel dashboard.');

// Ensure resources directory exists
const resourcesDir = path.join(__dirname, 'resources');
if (!fs.existsSync(resourcesDir)) {
  console.log('Creating resources directory...');
  fs.mkdirSync(resourcesDir, { recursive: true });
  
  // Create subdirectories
  fs.mkdirSync(path.join(resourcesDir, 'assignments'), { recursive: true });
  fs.mkdirSync(path.join(resourcesDir, 'notes'), { recursive: true });
  fs.mkdirSync(path.join(resourcesDir, 'lab-manuals'), { recursive: true });
  
  // Create empty downloads.json file
  fs.writeFileSync(
    path.join(resourcesDir, 'downloads.json'), 
    JSON.stringify([], null, 2)
  );
}

// Build the frontend
console.log('Building frontend...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Frontend build successful!');
} catch (error) {
  console.error('Frontend build failed:', error);
  process.exit(1);
}

console.log('Project is ready for Vercel deployment!');
console.log('Run "vercel" command to deploy or push to your GitHub repository connected to Vercel.');