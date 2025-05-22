/**
 * Script to verify that ads.txt is accessible from the root of the website
 * Run this script after deploying your site to verify that ads.txt is accessible
 */

import fetch from 'node-fetch';

// Replace with your actual domain
const domain = 'learn-flow-seven.vercel.app';
const url = `https://${domain}/ads.txt`;

console.log(`Checking if ads.txt is accessible at: ${url}`);

async function checkAdsTxt() {
  try {
    // Use no-cache to ensure we're not getting a cached version
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (response.ok) {
      const text = await response.text();
      console.log('ads.txt is accessible!');
      console.log('Content:');
      console.log(text);

      // Check if content is correct
      const expectedContent = 'google.com, pub-1178405148130113, DIRECT, f08c47fec0942fa0';
      if (text.trim() === expectedContent.trim()) {
        console.log('✅ Content is correct!');
      } else {
        console.warn('⚠️ Content does not match expected value!');
        console.log('Expected:', expectedContent);
      }

      // Check response headers
      console.log('\nResponse Headers:');
      response.headers.forEach((value, name) => {
        console.log(`${name}: ${value}`);
      });

      return true;
    } else {
      console.error(`Failed to access ads.txt: HTTP ${response.status}`);

      // Try to get more information about the error
      console.log('Response Headers:');
      response.headers.forEach((value, name) => {
        console.log(`${name}: ${value}`);
      });

      return false;
    }
  } catch (error) {
    console.error('Error accessing ads.txt:', error.message);
    return false;
  }
}

// Also check with www subdomain to ensure it's accessible there too
async function checkWwwAdsTxt() {
  const wwwUrl = `https://www.${domain}/ads.txt`;
  console.log(`\nChecking if ads.txt is accessible with www subdomain: ${wwwUrl}`);

  try {
    const response = await fetch(wwwUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (response.ok) {
      const text = await response.text();
      console.log('ads.txt is accessible with www subdomain!');
      console.log('Content:');
      console.log(text);
      return true;
    } else {
      console.log(`Note: ads.txt not accessible with www subdomain (HTTP ${response.status})`);
      console.log('This is expected if your site doesn\'t use www subdomain.');
      return false;
    }
  } catch (error) {
    console.log('Note: Could not access ads.txt with www subdomain:', error.message);
    console.log('This is expected if your site doesn\'t use www subdomain.');
    return false;
  }
}

// Run the checks
async function runChecks() {
  const mainResult = await checkAdsTxt();
  const wwwResult = await checkWwwAdsTxt();

  console.log('\nSummary:');
  console.log(`Main domain check: ${mainResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`WWW subdomain check: ${wwwResult ? '✅ PASSED' : '⚠️ NOT AVAILABLE (may be normal)'}`);

  console.log('\nIf the main check passed but Google AdSense still shows "ads.txt not found":');
  console.log('1. Wait 24-48 hours for Google to recognize the file');
  console.log('2. Ensure there are no redirects on your domain');
  console.log('3. Check if your domain has both www and non-www versions and ensure ads.txt is on both');
  console.log('4. Verify in Google Search Console that your site is properly indexed');
}

runChecks();
