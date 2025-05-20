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
    const response = await fetch(url);
    
    if (response.ok) {
      const text = await response.text();
      console.log('ads.txt is accessible!');
      console.log('Content:');
      console.log(text);
      return true;
    } else {
      console.error(`Failed to access ads.txt: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error accessing ads.txt:', error.message);
    return false;
  }
}

checkAdsTxt();
