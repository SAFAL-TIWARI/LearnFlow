# Environment Variables Setup Guide

## Local Development

1. Copy `.env.example` to `.env` and fill in your actual credentials:
   ```
   cp .env.example .env
   ```

2. For server-specific environment variables, copy `server/.env.example` to `server/.env` and fill in your credentials:
   ```
   cp server/.env.example server/.env
   ```

3. Never commit your actual `.env` files to the repository.

## Vercel Deployment

To securely set up environment variables in Vercel:

1. Go to your Vercel dashboard and select your project
2. Navigate to "Settings" > "Environment Variables"
3. Add each environment variable from your `.env` files:
   - VITE_GOOGLE_CLIENT_ID
   - VITE_GOOGLE_CLIENT_SECRET
   - VITE_NEXTAUTH_URL (use your production URL)
   - VITE_NEXTAUTH_SECRET
   - GEMINI_API_KEY

4. Select the appropriate environments (Production, Preview, Development)
5. Click "Save" to apply the changes

This approach keeps your sensitive credentials secure while allowing your application to access them during runtime.

## Important Security Notes

- **NEVER** commit `.env` files with real credentials to your repository
- Regularly rotate your API keys and secrets
- Use different credentials for development and production environments
- Consider using a secrets management service for more complex applications