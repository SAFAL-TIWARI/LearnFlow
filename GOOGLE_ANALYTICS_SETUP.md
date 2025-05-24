# Google Analytics API Setup Guide

This guide will help you connect your LearnFlow website to your actual Google Analytics data (like the 390 views and 1 active user you showed me).

## 🎯 What You'll Get

After setup, your website will display:
- **Real active users** from your GA dashboard (instead of simulated data)
- **Actual page views** (like your 390 views)
- **Real sessions and bounce rate**
- **Live visitor count** that matches your GA real-time data
- **Top pages** and user demographics

## 📋 Prerequisites

1. Google Analytics 4 (GA4) property set up ✅ (You already have `G-BYPTPHM5LY`)
2. Google Cloud Console account
3. Admin access to your GA property

## 🔧 Setup Steps

### Step 1: Get Your GA4 Property ID (Numeric)

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property (`G-BYPTPHM5LY`)
3. Go to **Admin** → **Property Settings**
4. Copy the **Property ID** (it's a number like `461385804`)

### Step 2: Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Analytics Data API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Analytics Data API"
   - Click **Enable**

4. Create a service account:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **Service Account**
   - Name: `learnflow-analytics`
   - Description: `Service account for LearnFlow analytics`
   - Click **Create and Continue**

5. Download the service account key:
   - Click on your service account
   - Go to **Keys** tab
   - Click **Add Key** → **Create New Key**
   - Choose **JSON** format
   - Download the file (save as `google-analytics-key.json`)

### Step 3: Grant Analytics Access

1. In Google Analytics, go to **Admin** → **Property Access Management**
2. Click **+** → **Add Users**
3. Add the service account email (from the JSON file)
4. Give **Viewer** permissions
5. Click **Add**

### Step 4: Configure Your Server

1. Place the `google-analytics-key.json` file in your server directory
2. Update your `.env` file:

```env
# Google Analytics API Configuration
GOOGLE_APPLICATION_CREDENTIALS=./google-analytics-key.json
GA_PROPERTY_ID=G-BYPTPHM5LY
GA_PROPERTY_ID_NUMERIC=YOUR_NUMERIC_PROPERTY_ID
```

3. Update the numeric property ID in `server/services/googleAnalyticsService.js`:

```javascript
const GA_PROPERTY_ID_NUMERIC = 'YOUR_NUMERIC_PROPERTY_ID'; // Replace with your actual ID
```

### Step 5: Test the Integration

1. Restart your server:
```bash
cd server
node server.js
```

2. Test the API endpoints:
```bash
# Test real-time data
curl http://localhost:3001/api/analytics/google-analytics

# Test visitor data
curl http://localhost:3001/api/analytics/visitors

# Test top pages
curl http://localhost:3001/api/analytics/top-pages
```

3. Check your website - you should now see real data!

## 🔍 Verification

### In Browser Console
Open your website and check the browser console. You should see:
```
Using real Google Analytics data: {activeUsers: 1, totalUsers: 390, ...}
```

### In Server Logs
Your server should show:
```
Google Analytics service initialized successfully
Fetching real-time data from Google Analytics...
```

### In Your Website
- Hero section badge should show your actual visitor count
- Statistics should reflect real data from your GA dashboard
- Live analytics badge should show current active users

## 🚨 Troubleshooting

### "Google Analytics service not initialized"
- Check if `google-analytics-key.json` exists and is valid
- Verify the service account has access to your GA property
- Check server logs for authentication errors

### "Property not found" Error
- Verify the numeric property ID is correct
- Make sure you're using GA4 (not Universal Analytics)
- Check if the service account has proper permissions

### No Real Data Showing
- The system will fall back to simulated data if real data isn't available
- Check browser console for error messages
- Verify API endpoints are responding correctly

## 📊 Available Data

Once connected, you'll get:

### Real-Time Data
- Active users currently on your site
- Page views in real-time
- Sessions and bounce rate

### Historical Data
- Total users over time periods
- Top performing pages
- User demographics and technology data
- Traffic sources and behavior

### Custom Metrics
- Tool usage tracking
- Resource download analytics
- User engagement patterns

## 🔒 Security Notes

1. **Never commit** the `google-analytics-key.json` file to version control
2. Add it to your `.gitignore`:
```
google-analytics-key.json
*.json
```

3. Use environment variables for sensitive data
4. Rotate service account keys periodically

## 🚀 Production Deployment

For production (Vercel, Netlify, etc.):

1. Upload the service account key as an environment variable:
```env
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

2. Update the service to read from environment variable instead of file

3. Set all required environment variables in your hosting platform

## 📈 Next Steps

After setup, you can:
1. Add more detailed analytics dashboards
2. Create custom reports and insights
3. Set up automated alerts for traffic spikes
4. Implement A/B testing with real data
5. Add conversion tracking and goal monitoring

## 🆘 Need Help?

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Ensure your GA property has recent data

The system is designed to gracefully fall back to simulated data if real data isn't available, so your website will always work even during setup.
