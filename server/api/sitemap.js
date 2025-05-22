import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * API handler for serving the sitemap.xml file
 * This ensures the sitemap is served with the correct content type
 */
export default function handleSitemapRequest(req, res) {
  try {
    // Define paths to possible sitemap locations
    const distSitemapPath = path.join(__dirname, '../../dist/sitemap.xml');
    const publicSitemapPath = path.join(__dirname, '../../public/sitemap.xml');
    const rootSitemapPath = path.join(__dirname, '../../sitemap.xml');
    
    // Check which sitemap file exists and use that one
    let sitemapPath;
    if (fs.existsSync(distSitemapPath)) {
      sitemapPath = distSitemapPath;
    } else if (fs.existsSync(publicSitemapPath)) {
      sitemapPath = publicSitemapPath;
    } else if (fs.existsSync(rootSitemapPath)) {
      sitemapPath = rootSitemapPath;
    } else {
      // If no sitemap file exists, generate a basic one
      const sitemapContent = generateBasicSitemap();
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      
      // Send the generated sitemap
      return res.send(sitemapContent);
    }
    
    // Read the sitemap file
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Send the sitemap
    res.send(sitemapContent);
  } catch (error) {
    console.error('Error serving sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

/**
 * Generate a basic sitemap if none exists
 */
function generateBasicSitemap() {
  const domain = 'https://learn-flow-seven.vercel.app';
  const today = new Date().toISOString().split('T')[0];
  
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
</urlset>`;
}
