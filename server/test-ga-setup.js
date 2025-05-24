import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Google Analytics Setup Diagnostic\n');

// Check 1: Environment Variables
console.log('1. Environment Variables:');
console.log('   GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || '❌ Not set');
console.log('   GA_PROPERTY_ID:', process.env.GA_PROPERTY_ID || '❌ Not set');
console.log('   GA_PROPERTY_ID_NUMERIC:', process.env.GA_PROPERTY_ID_NUMERIC || '❌ Not set');
console.log('');

// Check 2: Credentials File
console.log('2. Credentials File:');
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  console.log('   ❌ GOOGLE_APPLICATION_CREDENTIALS not set in environment');
} else {
  console.log('   📁 Looking for file at:', credentialsPath);
  
  // Try different possible paths
  const possiblePaths = [
    credentialsPath,
    path.resolve(credentialsPath),
    path.resolve(__dirname, credentialsPath),
    path.resolve(__dirname, '..', credentialsPath),
    path.resolve(process.cwd(), credentialsPath)
  ];
  
  let fileFound = false;
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      console.log('   ✅ File found at:', testPath);
      fileFound = true;
      
      try {
        const fileContent = fs.readFileSync(testPath, 'utf8');
        const credentials = JSON.parse(fileContent);
        
        console.log('   📄 File is valid JSON');
        console.log('   📧 Service account email:', credentials.client_email || '❌ Missing');
        console.log('   🏗️  Project ID:', credentials.project_id || '❌ Missing');
        console.log('   🔑 Has private key:', credentials.private_key ? '✅ Yes' : '❌ No');
        
      } catch (error) {
        console.log('   ❌ Error reading/parsing file:', error.message);
      }
      break;
    }
  }
  
  if (!fileFound) {
    console.log('   ❌ File not found in any of these locations:');
    possiblePaths.forEach(p => console.log('      -', p));
  }
}

console.log('');

// Check 3: Directory Structure
console.log('3. Directory Structure:');
console.log('   Current working directory:', process.cwd());
console.log('   Script directory:', __dirname);

const commonFiles = [
  'google-analytics-key.json',
  'server/google-analytics-key.json',
  '../google-analytics-key.json',
  '.env'
];

commonFiles.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log('   ✅', file, 'exists at', fullPath);
  } else {
    console.log('   ❌', file, 'not found');
  }
});

console.log('');

// Check 4: Test Google APIs Package
console.log('4. Dependencies:');
try {
  const { google } = await import('googleapis');
  console.log('   ✅ googleapis package loaded successfully');
} catch (error) {
  console.log('   ❌ Error loading googleapis:', error.message);
}

console.log('');

// Check 5: Recommendations
console.log('5. Recommendations:');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('   📝 Add GOOGLE_APPLICATION_CREDENTIALS to your .env file');
}

if (!process.env.GA_PROPERTY_ID_NUMERIC) {
  console.log('   📝 Add GA_PROPERTY_ID_NUMERIC to your .env file');
  console.log('      Get this from: Google Analytics → Admin → Property Settings');
}

if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS || '')) {
  console.log('   📝 Download service account key from Google Cloud Console');
  console.log('   📝 Place it in your server directory as google-analytics-key.json');
  console.log('   📝 Update .env file with correct path');
}

console.log('');
console.log('🔧 Quick Fix Commands:');
console.log('');
console.log('# If you have the credentials file but wrong path:');
console.log('echo "GOOGLE_APPLICATION_CREDENTIALS=./google-analytics-key.json" >> .env');
console.log('');
console.log('# If you need to download the credentials:');
console.log('# 1. Go to https://console.cloud.google.com/');
console.log('# 2. APIs & Services → Credentials');
console.log('# 3. Create Service Account → Download JSON key');
console.log('# 4. Save as google-analytics-key.json in your project root');
console.log('');
console.log('# Test the setup:');
console.log('node server/test-ga-setup.js');
console.log('');

// Check 6: Test Authentication (if file exists)
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  console.log('6. Testing Authentication:');
  try {
    const { google } = await import('googleapis');
    
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const authClient = await auth.getClient();
    console.log('   ✅ Authentication successful!');
    
    // Test a simple API call
    if (process.env.GA_PROPERTY_ID_NUMERIC) {
      const analyticsData = google.analyticsdata('v1beta');
      google.options({ auth: authClient });
      
      const response = await analyticsData.properties.runRealtimeReport({
        property: `properties/${process.env.GA_PROPERTY_ID_NUMERIC}`,
        requestBody: {
          metrics: [{ name: 'activeUsers' }],
          dimensions: []
        }
      });
      
      const activeUsers = response.data.rows?.[0]?.metricValues?.[0]?.value || '0';
      console.log('   ✅ Real-time API call successful!');
      console.log('   👥 Current active users:', activeUsers);
    }
    
  } catch (error) {
    console.log('   ❌ Authentication failed:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('   💡 Make sure your service account has access to your GA property');
      console.log('      Go to: Google Analytics → Admin → Property Access Management');
    }
    
    if (error.message.includes('API')) {
      console.log('   💡 Make sure Google Analytics Data API is enabled');
      console.log('      Go to: Google Cloud Console → APIs & Services → Library');
    }
  }
}
