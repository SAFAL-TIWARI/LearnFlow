#!/usr/bin/env node

/**
 * Build script for static hosting platforms (GitHub Pages, Netlify)
 * This script ensures all necessary files are properly copied and configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Building for static hosting platforms...');

// Ensure dist directory exists
const distDir = path.join(projectRoot, 'dist');
if (!fs.existsSync(distDir)) {
  console.log('📁 Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy 404.html for GitHub Pages
const source404 = path.join(projectRoot, 'public', '404.html');
const dest404 = path.join(distDir, '404.html');

if (fs.existsSync(source404)) {
  console.log('📄 Copying 404.html for GitHub Pages SPA support...');
  fs.copyFileSync(source404, dest404);
  console.log('✅ 404.html copied successfully');
} else {
  console.warn('⚠️  404.html not found in public directory');
}

// Ensure _redirects file exists for Netlify
const sourceRedirects = path.join(projectRoot, 'public', '_redirects');
const destRedirects = path.join(distDir, '_redirects');

if (fs.existsSync(sourceRedirects)) {
  console.log('📄 Copying _redirects for Netlify SPA support...');
  fs.copyFileSync(sourceRedirects, destRedirects);
  console.log('✅ _redirects copied successfully');
} else {
  console.warn('⚠️  _redirects not found in public directory');
}

// Copy robots.txt
const sourceRobots = path.join(projectRoot, 'public', 'robots.txt');
const destRobots = path.join(distDir, 'robots.txt');

if (fs.existsSync(sourceRobots)) {
  console.log('📄 Copying robots.txt...');
  fs.copyFileSync(sourceRobots, destRobots);
  console.log('✅ robots.txt copied successfully');
}

// Copy ads.txt
const sourceAds = path.join(projectRoot, 'public', 'ads.txt');
const destAds = path.join(distDir, 'ads.txt');

if (fs.existsSync(sourceAds)) {
  console.log('📄 Copying ads.txt...');
  fs.copyFileSync(sourceAds, destAds);
  console.log('✅ ads.txt copied successfully');
}

// Copy favicon.ico
const sourceFavicon = path.join(projectRoot, 'public', 'favicon.ico');
const destFavicon = path.join(distDir, 'favicon.ico');

if (fs.existsSync(sourceFavicon)) {
  console.log('📄 Copying favicon.ico...');
  fs.copyFileSync(sourceFavicon, destFavicon);
  console.log('✅ favicon.ico copied successfully');
} else {
  console.warn('⚠️  favicon.ico not found in public directory');
}

// Copy sitemap.xml if it exists
const sourceSitemap = path.join(projectRoot, 'public', 'sitemap.xml');
const destSitemap = path.join(distDir, 'sitemap.xml');

if (fs.existsSync(sourceSitemap)) {
  console.log('📄 Copying sitemap.xml...');
  fs.copyFileSync(sourceSitemap, destSitemap);
  console.log('✅ sitemap.xml copied successfully');
}

// Copy _headers file for Netlify
const sourceHeaders = path.join(projectRoot, 'public', '_headers');
const destHeaders = path.join(distDir, '_headers');

if (fs.existsSync(sourceHeaders)) {
  console.log('📄 Copying _headers for Netlify MIME types...');
  fs.copyFileSync(sourceHeaders, destHeaders);
  console.log('✅ _headers copied successfully');
} else {
  console.warn('⚠️  _headers not found in public directory');
}

// Verify essential files
console.log('\n🔍 Verifying build output...');
const essentialFiles = [
  'index.html',
  '404.html',
  '_redirects',
  '_headers',
  'favicon.ico'
];

let allFilesPresent = true;
essentialFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Present`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesPresent = false;
  }
});

if (allFilesPresent) {
  console.log('\n🎉 Build completed successfully!');
  console.log('📦 Your app is ready for deployment to:');
  console.log('   • GitHub Pages');
  console.log('   • Netlify');
  console.log('   • Any static hosting service');
} else {
  console.log('\n⚠️  Some essential files are missing. Please check the build process.');
  process.exit(1);
}

// Display deployment instructions
console.log('\n📋 Deployment Instructions:');
console.log('');
console.log('For GitHub Pages:');
console.log('1. Push your code to GitHub');
console.log('2. Enable GitHub Pages in repository settings');
console.log('3. Set source to "GitHub Actions" or deploy the dist/ folder');
console.log('');
console.log('For Netlify:');
console.log('1. Connect your repository to Netlify');
console.log('2. Set build command to: npm run build');
console.log('3. Set publish directory to: dist');
console.log('4. Deploy!');
console.log('');
console.log('The 404.html and _redirects files will handle SPA routing automatically.');
