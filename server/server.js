import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://learn-flow-seven.vercel.app'] 
    : 'http://localhost:8080',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  // Simple request logging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create .env file if it doesn't exist
const envPath = join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(
    envPath,
    'OPENAI_API_KEY=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'
  );
  console.log('.env file created with API key');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Format messages for OpenAI API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add system message if not present
    if (!formattedMessages.some(msg => msg.role === 'system')) {
      formattedMessages.unshift({
        role: 'system',
        content: 'You are a helpful assistant for LearnFlow, an educational platform. Provide concise, accurate information about academic topics, learning resources, and study techniques. Be friendly and supportive.'
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      max_tokens: 500
    });

    // Send response
    res.json({
      message: completion.choices[0].message
    });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});