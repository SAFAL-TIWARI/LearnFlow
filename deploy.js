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

// Ensure .env file exists with Gemini API key
const envPath = path.join(__dirname, 'server', '.env');
const envContent = `GEMINI_API_KEY=AIzaSyCOj3Extd63rPuOIHmhbSZNz2lqJwamAwk
PORT=3001
NODE_ENV=production
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=017576662512468239146:omuauf_lfve
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
VITE_NEXTAUTH_SECRET=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
VITE_NEXTAUTH_URL=https://learnflow.vercel.app
`;

console.log('Creating/updating .env file...');
fs.writeFileSync(envPath, envContent);

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