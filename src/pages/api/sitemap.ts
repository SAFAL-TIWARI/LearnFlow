import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set the content type header
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    
    // Read the sitemap.xml file from the public directory
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    
    // Send the sitemap content
    res.status(200).send(sitemapContent);
  } catch (error) {
    console.error('Error serving sitemap:', error);
    res.status(500).send('Error serving sitemap');
  }
}