# LearnFlow Chatbot - Setup Instructions

## Overview

The LearnFlow Chatbot is a floating widget that appears in the bottom-right corner of the website. It allows students to ask questions and get AI-powered responses using Google's Gemini API.

## Quick Start

1. Start the chatbot server:
   - Double-click on `start-chatbot-server.bat` file
   - Or run `node server/server.js` from the command line

2. Start your frontend application as usual:
   - Run `npm run dev` from the command line

3. Access the website and use the chatbot:
   - Click on the chat icon in the bottom-right corner
   - Type your question and press Enter or click the send button
   - The AI will respond with relevant information

## Troubleshooting

If the chatbot is not working properly:

1. Check if the server is running:
   - Make sure the terminal window running the server is still open
   - Check for any error messages in the terminal

2. Test the Gemini API connection:
   - Run `node server/test-api.js` to verify the API key is working

3. Check browser console for errors:
   - Open browser developer tools (F12) and look for errors in the Console tab

4. Restart both the server and the frontend:
   - Close all terminal windows
   - Start the server again with `start-chatbot-server.bat`
   - Start the frontend again with `npm run dev`

## Available Commands

The chatbot supports the following commands:

- `/help` - Show available commands
- `/clear` - Clear chat history
- `/reset` - Reset the conversation (alternative to /clear)
- `/scan [directory]` - Scan project files for issues (admin only)
- `/debug [directory]` - Debug code issues in project files (admin only)

## Example Queries

Try asking the chatbot:

- "Explain the concept of nanomaterials in CHB 101."
- "Give me Python code for a bubble sort algorithm."
- "Where can I find 2nd semester CSE IoT materials?"
- "What are the key topics covered in ITC 101?"
- "How do I calculate CGPA in this university?"