# LearnFlow Chatbot Integration

This document provides instructions on how to set up and use the LearnFlow Chatbot feature.

## Overview

The LearnFlow Chatbot is a floating widget that appears in the bottom-right corner of the website. It allows users to ask questions and get AI-powered responses using OpenAI's GPT-3.5 model.

## Features

- Floating chat button in the bottom-right corner
- Modern, responsive UI that works on desktop and mobile
- Dark/light theme support
- Conversation history saved in session storage
- Secure API key handling through backend server

## Setup Instructions

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. Install the required dependencies:

```bash
npm install
cd server
npm install
```

2. Set up the environment variables:

Create a `.env` file in the `server` directory with the following content:

```
OPENAI_API_KEY=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
PORT=3001
```

### Running the Application

To run both the frontend and backend servers simultaneously:

```bash
npm run start
```

This will start:
- The Vite development server for the frontend (typically on port 8080)
- The Express backend server for the chatbot API (on port 3001)

## Usage

1. Visit your website in a browser
2. Click on the chat icon in the bottom-right corner to open the chatbot
3. Type your question and press Enter or click the send button
4. The AI will respond with relevant information

## Customization

### Styling

You can customize the appearance of the chatbot by modifying the CSS in:
- `src/components/Chatbot/ChatbotWidget.css`

### AI Behavior

To modify the AI's behavior or system prompt, edit the `server.js` file in the server directory:

```javascript
// Add system message if not present
if (!formattedMessages.some(msg => msg.role === 'system')) {
  formattedMessages.unshift({
    role: 'system',
    content: 'You are a helpful assistant for LearnFlow, an educational platform. Provide concise, accurate information about academic topics, learning resources, and study techniques. Be friendly and supportive.'
  });
}
```

## Deployment

For production deployment:

1. Build the frontend:
```bash
npm run build
```

2. Deploy the `dist` directory to your web hosting service

3. Deploy the `server` directory to a Node.js hosting service (like Vercel, Netlify Functions, or a traditional server)

4. Update the API endpoint URL in `ChatbotWidget.tsx` to point to your production server

## Security Considerations

- The OpenAI API key is stored securely on the server side and never exposed to the client
- All API requests are made through the backend to protect your credentials
- Consider implementing rate limiting for production use

## Troubleshooting

If you encounter issues:

1. Check that both servers are running
2. Verify the API key is correctly set in the `.env` file
3. Check browser console for any JavaScript errors
4. Ensure the backend server is accessible from the frontend (CORS is enabled)