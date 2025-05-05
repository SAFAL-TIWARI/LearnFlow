/**
 * Deployment script for Vercel
 * This script prepares the project for deployment to Vercel
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure .env file exists with Gemini API key
const envPath = path.join(__dirname, 'server', '.env');
const envContent = 'GEMINI_API_KEY=AIzaSyCOj3Extd63rPuOIHmhbSZNz2lqJwamAwk\nPORT=3001\n';

console.log('Creating/updating .env file...');
fs.writeFileSync(envPath, envContent);

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