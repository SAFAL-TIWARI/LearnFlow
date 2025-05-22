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
const publicAdsTextSource = path.join(__dirname, 'public', 'ads.txt');
const adsTextDest = path.join(__dirname, 'dist', 'ads.txt');

// Check if ads.txt exists in root or public directory
if (fs.existsSync(adsTextSource) || fs.existsSync(publicAdsTextSource)) {
  console.log('Found ads.txt file, copying to dist directory...');
  try {
    // Create dist directory if it doesn't exist
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Determine which source file to use (prefer root directory)
    const sourceFile = fs.existsSync(adsTextSource) ? adsTextSource : publicAdsTextSource;

    // Copy the file
    fs.copyFileSync(sourceFile, adsTextDest);
    console.log(`ads.txt copied successfully from ${sourceFile}!`);

    // Verify the content
    const content = fs.readFileSync(adsTextDest, 'utf8');
    console.log('ads.txt content:');
    console.log(content);

    // Double-check by also copying to public directory if it doesn't exist there
    if (!fs.existsSync(publicAdsTextSource) && fs.existsSync(adsTextSource)) {
      const publicDir = path.join(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.copyFileSync(adsTextSource, publicAdsTextSource);
      console.log('Also copied ads.txt to public directory for redundancy');
    }
  } catch (error) {
    console.error('Error copying ads.txt:', error);
  }
} else {
  console.warn('ads.txt not found in root or public directory!');
  console.warn('Creating ads.txt file with Google AdSense information...');

  try {
    // Create the content for ads.txt
    const adsContent = 'google.com, pub-1178405148130113, DIRECT, f08c47fec0942fa0';

    // Create dist directory if it doesn't exist
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write the file to both locations
    fs.writeFileSync(adsTextDest, adsContent);
    fs.writeFileSync(path.join(__dirname, 'ads.txt'), adsContent);
    fs.writeFileSync(publicAdsTextSource, adsContent);

    console.log('Created ads.txt file in root, public, and dist directories');
  } catch (error) {
    console.error('Error creating ads.txt:', error);
  }
}

// Ensure robots.txt is copied to the dist directory
// This is important for SEO
const robotsTextSource = path.join(__dirname, 'public', 'robots.txt');
const robotsTextDest = path.join(__dirname, 'dist', 'robots.txt');

if (fs.existsSync(robotsTextSource)) {
  console.log('Copying robots.txt to dist directory...');
  try {
    // Create dist directory if it doesn't exist
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Copy the file
    fs.copyFileSync(robotsTextSource, robotsTextDest);
    console.log('robots.txt copied successfully!');
  } catch (error) {
    console.error('Error copying robots.txt:', error);
  }
} else {
  console.warn('robots.txt not found in public directory!');
}

// Generate sitemap.xml directly in the dist directory
// This is important for SEO
const sitemapDest = path.join(__dirname, 'dist', 'sitemap.xml');

console.log('Generating sitemap.xml in dist directory...');
try {
  // Create dist directory if it doesn't exist
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Generate sitemap content
  const domain = 'https://learn-flow-seven.vercel.app';
  const today = new Date().toISOString().split('T')[0];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/terms-of-service</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/tools/cgpa-calculator</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/tools/study-timer</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/tools/exam-scheduler</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/tools/note-organizer</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

  // Write the file
  fs.writeFileSync(sitemapDest, sitemapContent);
  console.log('sitemap.xml generated successfully!');

  // Verify the content
  console.log('Sitemap content:');
  console.log(sitemapContent.substring(0, 100) + '...');
} catch (error) {
  console.error('Error generating sitemap.xml:', error);
}

console.log('Vercel build preparation complete!');