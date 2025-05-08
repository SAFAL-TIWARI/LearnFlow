# LearnFlow Vercel Deployment Guide

This guide provides step-by-step instructions for deploying LearnFlow to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A GitHub repository with your LearnFlow code
3. Google Gemini API key and other required API keys

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure your code is pushed to a GitHub repository.

### 2. Connect to Vercel

1. Log in to your Vercel account
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Configure the project settings:

### 3. Configure Project Settings

- **Framework Preset**: Vite
- **Root Directory**: ./
- **Build Command**: `npm run vercel-build`
- **Output Directory**: dist
- **Install Command**: `npm install`

### 4. Add Environment Variables

Add the following environment variables in the Vercel dashboard:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `NODE_ENV`: production
- `PORT`: 3000
- `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID
- `VITE_GOOGLE_CLIENT_SECRET`: Your Google Client Secret
- `VITE_NEXTAUTH_SECRET`: Your NextAuth Secret
- `VITE_NEXTAUTH_URL`: Your Vercel deployment URL (e.g., https://learn-flow-seven.vercel.app)

**Important Notes:**
- These environment variables must be added in the Vercel dashboard, not in your code
- Never commit files containing actual API keys or secrets to your repository
- The `.env.example` file in your repository is just a template and doesn't contain real values

### 5. Deploy

Click "Deploy" and wait for the deployment to complete.

## Troubleshooting

### Build Failures

If your build fails:

1. Check the Vercel build logs for specific errors
2. Ensure all required environment variables are set
3. Verify that your code is compatible with Vercel's serverless environment

### API Connection Issues

If the chatbot can't connect to the API:

1. Check that your API endpoints are correctly configured
2. Verify that your Gemini API key is properly set
3. Check for CORS issues in the browser console

## Updating Your Deployment

When you push changes to your GitHub repository, Vercel will automatically redeploy your application.

## Monitoring

You can monitor your deployment and check logs in the Vercel dashboard:

1. Log in to your Vercel account
2. Select your project
3. Go to the "Deployments" tab to see all deployments
4. Click on a deployment to view details and logs