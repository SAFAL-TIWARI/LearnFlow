/**
 * Special build script for Vercel deployment
 * This script runs before the build command to prepare the environment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Running Vercel build preparation script...');

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

// Create server directory if it doesn't exist
const serverDir = path.join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  console.log('Creating server directory...');
  fs.mkdirSync(serverDir, { recursive: true });
}

// Check if we're running in Vercel
const isVercel = process.env.VERCEL === '1';
if (isVercel) {
  console.log('Running in Vercel environment...');

  // In Vercel, we don't need to create .env files as environment variables
  // are injected directly into the process
  console.log('Using environment variables from Vercel dashboard');
} else {
  console.log('Running in local environment...');
  console.log('Make sure you have proper .env files set up');
}

// Ensure ads.txt is copied to the dist directory
// This is important for Google AdSense verification
const adsTextSource = path.join(__dirname, 'ads.txt');
const adsTextDest = path.join(__dirname, 'dist', 'ads.txt');

if (fs.existsSync(adsTextSource)) {
  console.log('Copying ads.txt to dist directory...');
  try {
    // Create dist directory if it doesn't exist
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Copy the file
    fs.copyFileSync(adsTextSource, adsTextDest);
    console.log('ads.txt copied successfully!');
  } catch (error) {
    console.error('Error copying ads.txt:', error);
  }
} else {
  console.warn('ads.txt not found in root directory!');
}

console.log('Vercel build preparation complete!');