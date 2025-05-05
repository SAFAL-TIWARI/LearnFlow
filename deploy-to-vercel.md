# Deploying LearnFlow to Vercel

This guide will help you deploy your LearnFlow application to Vercel, including both the frontend and the Gemini chatbot server.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional, but recommended)
3. Git repository with your LearnFlow code

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

Navigate to your project directory and run:

```bash
vercel
```

Follow the prompts to configure your deployment. When asked about the build settings, use the defaults as they are configured in your `vercel.json` file.

### 4. Set Environment Variables

After deployment, go to your Vercel dashboard, select your project, and add the following environment variables:

- `GEMINI_API_KEY`: Your Google Gemini API key

### 5. Update Frontend API Endpoint

In your `ChatbotWidget.tsx` file, make sure the API endpoint is pointing to your Vercel deployment:

```typescript
const apiEndpoints = [
  'https://your-vercel-app.vercel.app/api/chat',
  '/api/chat',
  `${window.location.origin}/api/chat`
];
```

Replace `your-vercel-app.vercel.app` with your actual Vercel deployment URL.

## Troubleshooting

### CORS Issues

If you encounter CORS issues, make sure your server is properly configured to allow requests from your frontend domain. The current setup should handle this automatically.

### API Connection Issues

If the chatbot can't connect to the API:

1. Check the browser console for errors
2. Verify that the API endpoint is correct
3. Ensure your Gemini API key is properly set in Vercel environment variables

### Serverless Function Timeout

Vercel has a default timeout of 10 seconds for serverless functions. If your chatbot responses take longer, you may need to optimize your code or consider a different hosting solution for the server component.

## Monitoring

You can monitor your deployment and check logs in the Vercel dashboard. This is helpful for debugging any issues that might arise in production.