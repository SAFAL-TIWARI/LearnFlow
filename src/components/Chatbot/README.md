# LearnFlow AI Chatbot

A professional, responsive AI chatbot for the LearnFlow educational website that provides intelligent responses to student queries using Google's Gemini API.

## Features

- **Intelligent Educational Responses**: Answers questions about academic topics and provides coding help
- **Context-Aware Conversations**: Maintains chat history for multi-turn conversations
- **Course-Specific Knowledge**: Understands queries related to specific courses
- **Navigation Assistance**: Helps users find resources on the platform
- **Responsive UI**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme Support**: Adapts to the user's preferred theme
- **Command System**: Supports `/help`, `/clear`, `/scan`, and `/debug` commands

## Setup Instructions

1. Ensure the server is configured with a valid Gemini API key in `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

2. Start the chatbot server:
   - Use `start-chatbot-server.bat` or run `node server/server.js`

## Usage

### Basic Usage
1. Click on the chat icon in the bottom-right corner to open the chatbot
2. Type your question and press Enter or click the send button

### Available Commands
- `/help` - Show available commands
- `/clear` - Clear chat history
- `/scan [directory]` - Scan project files for issues (admin only)
- `/debug [directory]` - Debug code issues in project files (admin only)

### Example Queries
- "Explain the concept of nanomaterials in CHB 101."
- "Give me Python code for a bubble sort algorithm."
- "Where can I find 2nd semester CSE IoT materials?"

## Troubleshooting

If the chatbot is not working:
1. Check if the server is running
2. Test the API connection with `node server/test-api.js`
3. Check browser console for errors
4. Restart both the server and frontend

## Customization

You can customize the chatbot by modifying:
- Styling in `ChatbotWidget.css`
- System prompt in `server.js`
- Educational content in `server/utils/educationalUtils.js`