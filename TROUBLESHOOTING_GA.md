# Google Analytics Troubleshooting Guide

## Current Issue: "Could not load the default credentials"

Based on your server logs, the Google Analytics service is failing to initialize because it can't find the credentials file.

## Step-by-Step Troubleshooting

### 1. Check if the credentials file exists

First, let's verify the file is in the right location:

```bash
# Check if the file exists in your server directory
ls -la server/google-analytics-key.json

# Or check the root directory
ls -la google-analytics-key.json
```

### 2. Verify Environment Variables

Check your `.env` file in the root directory:

```bash
# Check if .env file exists
cat .env

# Look for these lines:
GOOGLE_APPLICATION_CREDENTIALS=./google-analytics-key.json
GA_PROPERTY_ID_NUMERIC=your_actual_numeric_id
```

### 3. Check File Permissions

Make sure the credentials file is readable:

```bash
# Check file permissions
ls -la google-analytics-key.json

# If needed, fix permissions
chmod 644 google-analytics-key.json
```

### 4. Verify JSON File Format

The credentials file should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 5. Common Issues and Solutions

#### Issue A: File Path Problem
If the file is in a different location, update the path in `.env`:

```env
# If file is in server directory
GOOGLE_APPLICATION_CREDENTIALS=./server/google-analytics-key.json

# If file is in root directory
GOOGLE_APPLICATION_CREDENTIALS=./google-analytics-key.json

# Absolute path (if needed)
GOOGLE_APPLICATION_CREDENTIALS=/full/path/to/google-analytics-key.json
```

#### Issue B: Missing Numeric Property ID
Get your numeric property ID:

1. Go to Google Analytics
2. Admin → Property Settings
3. Copy the Property ID (numeric, like 461385804)
4. Add to `.env`:

```env
GA_PROPERTY_ID_NUMERIC=461385804
```

#### Issue C: Service Account Permissions
Make sure your service account has access:

1. Go to Google Analytics
2. Admin → Property Access Management
3. Add your service account email with "Viewer" permissions

#### Issue D: API Not Enabled
Enable the Google Analytics Data API:

1. Go to Google Cloud Console
2. APIs & Services → Library
3. Search "Google Analytics Data API"
4. Click Enable

### 6. Test the Setup

After fixing the issues, restart your server and test:

```bash
# Restart server
cd server
node server.js

# Test the endpoint
curl http://localhost:3001/api/analytics/google-analytics
```

### 7. Quick Fix Script

Create a test script to verify your setup:

```javascript
// test-ga.js
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function testGA() {
  try {
    console.log('Testing Google Analytics setup...');
    console.log('Credentials file:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('Property ID:', process.env.GA_PROPERTY_ID_NUMERIC);
    
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const authClient = await auth.getClient();
    console.log('✅ Authentication successful!');
    
    const analyticsData = google.analyticsdata('v1beta');
    google.options({ auth: authClient });
    
    const response = await analyticsData.properties.runRealtimeReport({
      property: `properties/${process.env.GA_PROPERTY_ID_NUMERIC}`,
      requestBody: {
        metrics: [{ name: 'activeUsers' }],
        dimensions: []
      }
    });
    
    console.log('✅ Real-time data fetched successfully!');
    console.log('Active users:', response.data.rows?.[0]?.metricValues?.[0]?.value || '0');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGA();
```

Run this test:

```bash
node test-ga.js
```

### 8. Alternative: Environment Variable Method

If file path issues persist, you can set the credentials as an environment variable:

```bash
# Set the credentials as an environment variable
export GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
```

Then update the service to read from the environment variable instead of a file.

### 9. Debug Mode

Add debug logging to see what's happening:

```javascript
// Add to your server startup
console.log('Environment variables:');
console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log('GA_PROPERTY_ID_NUMERIC:', process.env.GA_PROPERTY_ID_NUMERIC);

// Check if file exists
import fs from 'fs';
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (fs.existsSync(credentialsPath)) {
  console.log('✅ Credentials file exists');
} else {
  console.log('❌ Credentials file not found at:', credentialsPath);
}
```

### 10. Expected Success Output

When everything is working, you should see:

```
Google Analytics service initialized successfully
Fetching real-time data from Google Analytics...
```

And the API should return real data:

```json
{
  "success": true,
  "data": {
    "activeUsers": 1,
    "totalUsers": 390,
    "pageViews": 500,
    "sessions": 200,
    "bounceRate": 45.2,
    "avgSessionDuration": 180
  }
}
```

## Next Steps

1. Check the file location and permissions
2. Verify your `.env` file has the correct paths
3. Restart your server
4. Test the API endpoint
5. Check the Analytics Status component on your website

If you're still having issues, please share:
- The exact error message from server logs
- Your file structure (where the credentials file is located)
- Your `.env` file content (without sensitive data)
