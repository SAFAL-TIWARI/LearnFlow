# LearnFlow Chatbot Server

This is the backend server for the LearnFlow chatbot.

## Deployment on Railway.com

### Environment Variables

Make sure to set the following environment variables in your Railway.com project:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: Railway will set this automatically

### Deployment Steps

1. Push this repository to GitHub
2. Connect your GitHub repository to Railway.com
3. Set the required environment variables
4. Deploy the application

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the server:
   ```
   npm start
   ```

## API Endpoints

- `GET /api/health`: Health check endpoint
- `POST /api/chat`: Chat endpoint for the chatbot

## File Structure

- `server.js`: Main server file
- `utils/`: Utility functions
  - `educationalUtils.js`: Educational data and helper functions
  - `fileScannerUtils.js`: File scanning functionality
  - `webSearchUtils.js`: Web search functionality
  - `websiteKnowledgeUtils.js`: Website knowledge and resource searching
- `data/`: Data files
  - `websiteNavigation.json`: Website navigation data