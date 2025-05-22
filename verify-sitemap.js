/**
 * Script to verify that sitemap.xml is accessible and properly formatted
 * Run this script after deploying your site to verify that sitemap.xml is accessible
 */

import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';

// Replace with your actual domain
const domain = 'learn-flow-seven.vercel.app';
const url = `https://${domain}/sitemap.xml`;

console.log(`Checking if sitemap.xml is accessible at: ${url}`);

async function checkSitemap() {
  try {
    // Use no-cache to ensure we're not getting a cached version
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      if (!contentType || !contentType.includes('application/xml')) {
        console.warn('⚠️ Warning: Content-Type is not application/xml');
      }
      
      const text = await response.text();
      console.log('sitemap.xml is accessible!');
      
      // Try to parse the XML to verify it's valid
      try {
        const result = await parseStringPromise(text);
        console.log('✅ XML is valid!');
        
        // Check if it has the correct structure
        if (result.urlset && result.urlset.url) {
          console.log(`✅ Sitemap contains ${result.urlset.url.length} URLs`);
          
          // Print the first few URLs
          console.log('\nSample URLs from sitemap:');
          result.urlset.url.slice(0, 3).forEach((url, index) => {
            console.log(`${index + 1}. ${url.loc[0]}`);
          });
        } else {
          console.warn('⚠️ Warning: Sitemap does not have the expected structure');
        }
      } catch (parseError) {
        console.error('❌ Error parsing XML:', parseError.message);
        console.log('Raw content:');
        console.log(text.substring(0, 500) + '...');
      }
      
      // Check response headers
      console.log('\nResponse Headers:');
      response.headers.forEach((value, name) => {
        console.log(`${name}: ${value}`);
      });
      
      return true;
    } else {
      console.error(`Failed to access sitemap.xml: HTTP ${response.status}`);
      
      // Try to get more information about the error
      console.log('Response Headers:');
      response.headers.forEach((value, name) => {
        console.log(`${name}: ${value}`);
      });
      
      return false;
    }
  } catch (error) {
    console.error('Error accessing sitemap.xml:', error.message);
    return false;
  }
}

// Run the check
checkSitemap().then(result => {
  console.log('\nSummary:');
  console.log(`Sitemap check: ${result ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (result) {
    console.log('\nYour sitemap.xml is accessible and appears to be valid.');
  } else {
    console.log('\nIf the check failed, here are some things to try:');
    console.log('1. Make sure your sitemap.xml is properly formatted XML');
    console.log('2. Ensure it\'s being served with the correct Content-Type header');
    console.log('3. Check that the route in vercel.json is correctly configured');
    console.log('4. Verify that the sitemap API endpoint is working correctly');
  }
});
