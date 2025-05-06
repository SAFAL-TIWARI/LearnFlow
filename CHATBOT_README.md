# LearnFlow AI Chatbot

A professional, responsive AI chatbot for the LearnFlow educational website that provides intelligent responses to student queries using Google's Gemini API.

## Overview

The LearnFlow Chatbot is a floating widget that appears in the bottom-right corner of the website. It allows users to ask questions and get AI-powered responses using Google's Gemini Pro model.

## Features

- **Intelligent Educational Responses**: Answers questions about academic topics, explains concepts, suggests resources, and provides coding help
- **Context-Aware Conversations**: Maintains chat history for multi-turn conversations
- **Course-Specific Knowledge**: Understands queries related to specific courses (like CHB 101, ITC 101)
- **Navigation Assistance**: Helps users find resources on the platform
- **File Scanner & Error Detector**: Admin-only commands to scan project files for issues
- **Responsive UI**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme Support**: Adapts to the user's preferred theme
- **Session Storage**: Preserves chat history during the session
- **Command System**: Supports special commands like `/scan`, `/debug`, `/help`, and `/clear`
- **Secure Implementation**: API key is stored securely on the server side

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
GEMINI_API_KEY=your_gemini_api_key_here
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

### Basic Usage

1. Visit your website in a browser
2. Click on the chat icon in the bottom-right corner to open the chatbot
3. Type your question and press Enter or click the send button
4. The AI will respond with relevant information

### Available Commands

- `/help` - Show available commands
- `/clear` - Clear chat history
- `/scan [directory]` - Scan project files for issues (admin only)
- `/debug [directory]` - Debug code issues in project files (admin only)

### Example Queries

- "Explain the concept of nanomaterials in CHB 101."
- "Give me Python code for a bubble sort algorithm."
- "Where can I find 2nd semester CSE IoT materials?"
- "What are the key topics covered in ITC 101?"
- "How do I calculate CGPA in this university?"

## Customization

### Styling

You can customize the appearance of the chatbot by modifying the CSS in:
- `src/components/Chatbot/ChatbotWidget.css`

### System Prompt

You can customize the AI's behavior by modifying the system prompt in `server.js`:

```javascript
// Enhance system message with educational context
let systemMessage = 'You are LearnFlow Assistant, an advanced AI for an educational platform. ';
```

### Educational Content

Update the educational database in `server/utils/educationalUtils.js` to add more courses, topics, and resources:

```javascript
// Course information database
export const courseDatabase = {
  'CHB101': {
    name: 'Chemistry Basics 101',
    // ...
  },
  // Add more courses here
};
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

## Security Features

- **API Key Protection**: The Google Gemini API key is stored securely on the server side and never exposed to the client
- **Rate Limiting**: Prevents abuse of the API with a token bucket rate limiter
- **Input Validation**: All user inputs are validated before processing
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Troubleshooting

If you encounter issues:

1. Check that both servers are running
2. Verify the API key is correctly set in the `.env` file
3. Check browser console for any JavaScript errors
4. Ensure the backend server is accessible from the frontend (CORS is enabled)