/**
 * Script to generate a sitemap.xml file during build
 * This ensures the sitemap is properly formatted and up-to-date
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the root directory
const rootDir = path.join(__dirname, '../../');

// Define the output paths
const distDir = path.join(rootDir, 'dist');
const sitemapPath = path.join(distDir, 'sitemap.xml');

// Create the dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Generate the sitemap content
function generateSitemap() {
  const domain = 'https://learn-flow-seven.vercel.app';
  // Use a fixed current date instead of system date which might be incorrect
  const today = '2023-10-30';
  
  // Create a properly formatted XML document
  return `<?xml version="1.0" encoding="UTF-8"?>
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
  <url>
    <loc>${domain}/tools</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/resources</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/help</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${domain}/tools/unit-converter</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/tools/quick</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
}

// Write the sitemap to the dist directory
try {
  const sitemap = generateSitemap();
  
  // Ensure the file is written with UTF-8 encoding without BOM
  fs.writeFileSync(sitemapPath, sitemap, { encoding: 'utf8' });
  
  // Also create a copy in the public directory to ensure it's available during development
  const publicSitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, sitemap, { encoding: 'utf8' });
  
  console.log(`Sitemap generated at ${sitemapPath} and ${publicSitemapPath}`);
} catch (error) {
  console.error('Error generating sitemap:', error);
}
