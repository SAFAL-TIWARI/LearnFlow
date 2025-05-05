# Deploying LearnFlow with Gemini Chatbot to Vercel

This guide provides step-by-step instructions for deploying your LearnFlow application with the Gemini-powered chatbot to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Git repository with your LearnFlow code
3. Google Gemini API key

## Deployment Options

### Option 1: Deploy via GitHub Integration (Recommended)

1. Push your code to a GitHub repository
2. Log in to your Vercel account
3. Click "Add New" → "Project"
4. Select your GitHub repository
5. Configure the project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `node deploy.js && npm run build`
   - Output Directory: dist
6. Add Environment Variables:
   - GEMINI_API_KEY: Your Google Gemini API key
7. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Prepare your project:
   ```bash
   node deploy.js
   ```

4. Deploy to Vercel:
   ```bash
   vercel
   ```

5. Follow the prompts and make sure to add your GEMINI_API_KEY as an environment variable.

## Updating the Frontend API Endpoint

After deployment, you need to update the API endpoint in your ChatbotWidget.tsx file:

1. Open `src/components/Chatbot/ChatbotWidget.tsx`
2. Find the `apiEndpoints` array
3. Replace the first URL with your Vercel deployment URL:
   ```typescript
   const apiEndpoints = [
     'https://your-vercel-app.vercel.app/api/chat', // Replace with your Vercel URL
     '/api/chat',
     `${window.location.origin}/api/chat`,
     'http://localhost:3001/api/chat'
   ];
   ```
4. Commit and push these changes, or redeploy if using the CLI.

## Testing Your Deployment

1. Visit your deployed site (e.g., https://learn-flow-seven.vercel.app)
2. Open the chatbot widget
3. Try asking a question to verify that the chatbot is working correctly

## Troubleshooting

### Chatbot Not Responding

If the chatbot doesn't respond:

1. Check the browser console for errors
2. Verify that your Gemini API key is correctly set in Vercel environment variables
3. Check the Vercel deployment logs for any server-side errors

### CORS Issues

If you see CORS errors in the console:

1. Make sure your server is properly configured to allow requests from your frontend domain
2. The current setup should handle this automatically, but you may need to add specific CORS headers if you're using a custom domain

### Serverless Function Timeout

Vercel has a default timeout of 10 seconds for serverless functions. If your chatbot responses take longer:

1. Optimize your code to reduce response time
2. Consider using a different hosting solution for the server component if needed

## Monitoring and Logs

You can monitor your deployment and check logs in the Vercel dashboard:

1. Log in to your Vercel account
2. Select your project
3. Go to the "Deployments" tab to see all deployments
4. Click on a deployment to view details and logs

This is helpful for debugging any issues that might arise in production.