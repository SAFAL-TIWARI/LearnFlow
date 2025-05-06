import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set the content type header
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    
    // Generate the sitemap content directly
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://learn-flow-seven.vercel.app/</loc>
    <lastmod>2025-05-04T12:11:33+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://learn-flow-seven.vercel.app/privacy-policy</loc>
    <lastmod>2025-05-04T12:11:33+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://learn-flow-seven.vercel.app/terms-of-service</loc>
    <lastmod>2025-05-04T12:11:33+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://learn-flow-seven.vercel.app/tools/cgpa-calculator</loc>
    <lastmod>2025-05-04T12:11:33+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://learn-flow-seven.vercel.app/tools/study-timer</loc>
    <lastmod>2025-05-04T12:11:33+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://learn-flow-seven.vercel.app/tools/exam-scheduler</loc>
    <lastmod>2025-05-04T12:11:33+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://learn-flow-seven.vercel.app/tools/note-organizer</loc>
    <lastmod>2025-05-04T12:11:33+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    
    // Send the sitemap content
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error serving sitemap:', error);
    res.status(500).send('Error serving sitemap');
  }
}