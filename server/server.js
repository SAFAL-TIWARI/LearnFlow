import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { scanProjectFiles } from './utils/fileScannerUtils.js';
import { 
  getCourseInfo, 
  getSemesterResources, 
  isNavigationQuery,
  extractCourseCode
} from './utils/educationalUtils.js';

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
  origin: '*', // Allow all origins for development
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

// Create .env file if it doesn't exist or update it with the latest API key
const envPath = join(__dirname, '.env');
const apiKey = 'OPENAI_API_KEY=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';

// Always update the API key to ensure it's the latest
fs.writeFileSync(envPath, apiKey);
console.log('API key updated in .env file');

// Set the API key in process.env directly as well
process.env.OPENAI_API_KEY = apiKey.split('=')[1];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rate limiting configuration
const rateLimits = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  tokens: new Map() // Store user tokens and their request counts
};

// Simple rate limiter middleware
const rateLimiter = (req, res, next) => {
  const userId = req.body.userId || req.ip; // Use userId if provided, otherwise IP
  const now = Date.now();
  
  // Initialize or get user's token bucket
  if (!rateLimits.tokens.has(userId)) {
    rateLimits.tokens.set(userId, {
      count: 0,
      resetTime: now + rateLimits.windowMs
    });
  }
  
  const userToken = rateLimits.tokens.get(userId);
  
  // Reset count if window has passed
  if (now > userToken.resetTime) {
    userToken.count = 0;
    userToken.resetTime = now + rateLimits.windowMs;
  }
  
  // Check if user has exceeded rate limit
  if (userToken.count >= rateLimits.maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please try again later.',
      resetTime: userToken.resetTime
    });
  }
  
  // Increment count and continue
  userToken.count++;
  next();
};

// API endpoint for chat
app.post('/api/chat', rateLimiter, async (req, res) => {
  try {
    const { messages, userId } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get the latest user message
    const latestUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (!latestUserMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    // Check for special commands
    const userContent = latestUserMessage.content.trim();
    
    // Handle file scanning command
    if (userContent.startsWith('/scan') || userContent.startsWith('/debug')) {
      // Extract path from command (e.g., /scan src/components)
      const parts = userContent.split(' ');
      const scanPath = parts.length > 1 ? parts.slice(1).join(' ') : '';
      
      // Scan files
      const scanResults = await scanProjectFiles(scanPath);
      
      // Format response
      let responseContent;
      if (scanResults.success) {
        responseContent = `📁 File Scan Results:\n\nScanned ${scanResults.scannedFiles} files in ${scanResults.scanPath}\n`;
        
        if (scanResults.files.length > 0) {
          // Send file list to OpenAI for analysis
          const fileAnalysisPrompt = `You are a code review expert. Analyze these files for potential issues:
${scanResults.files.map(file => `
File: ${file.path} (${file.lines} lines)
Extension: ${file.extension}
First 500 chars: ${file.content.substring(0, 500)}${file.content.length > 500 ? '...' : ''}
`).join('\n')}

Identify potential issues like:
1. Syntax errors
2. Broken imports
3. Unused variables or dead code
4. Missing tags or structural issues
5. Unhandled async code or bad API calls

Format your response as a clear, concise report with specific issues and suggested fixes.`;

          const analysis = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'system', content: fileAnalysisPrompt }],
            max_tokens: 1000
          });
          
          responseContent += `\n${analysis.choices[0].message.content}`;
        } else {
          responseContent += "\nNo files found matching the criteria.";
        }
      } else {
        responseContent = `❌ Scan Error: ${scanResults.error}`;
      }
      
      return res.json({
        message: {
          role: 'assistant',
          content: responseContent
        }
      });
    }

    // Format messages for OpenAI API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Enhance system message with educational context
    let systemMessage = 'You are LearnFlow Assistant, an advanced AI for an educational platform. ';
    
    // Check if query is related to a specific course
    const courseCode = extractCourseCode(userContent);
    if (courseCode) {
      const courseInfo = getCourseInfo(courseCode);
      systemMessage += `\nThe user is asking about ${courseCode}: ${courseInfo.name}. This course covers: ${courseInfo.topics.join(', ')}. `;
    }
    
    // Check if query is related to navigation
    if (isNavigationQuery(userContent)) {
      systemMessage += '\nThe user is asking about navigating or finding resources on the LearnFlow platform. Be specific about where to find materials. ';
      
      // Check for semester-specific queries
      const semesterMatch = userContent.match(/\b(\d)(st|nd|rd|th)?\s+sem(ester)?\b/i);
      if (semesterMatch) {
        const semNumber = semesterMatch[1];
        const semResources = getSemesterResources(semNumber);
        if (semResources) {
          systemMessage += `\nSemester ${semNumber} resources are located at ${semResources.path} and include courses: ${semResources.courses.join(', ')}. `;
        }
      }
    }
    
    // Complete the system message with general instructions
    systemMessage += `
Provide concise, accurate information about academic topics, learning resources, and study techniques. Be friendly and supportive.

When answering:
1. For educational questions, provide clear explanations with examples
2. For coding questions, provide well-commented code snippets
3. For resource questions, give specific paths where materials can be found
4. For course-specific questions, reference relevant course materials and topics

Always maintain a helpful, educational tone and focus on providing value to students.`;

    // Add or replace system message
    if (formattedMessages.some(msg => msg.role === 'system')) {
      formattedMessages.forEach(msg => {
        if (msg.role === 'system') {
          msg.content = systemMessage;
        }
      });
    } else {
      formattedMessages.unshift({
        role: 'system',
        content: systemMessage
      });
    }

    // Call OpenAI API with appropriate model
    console.log('Calling OpenAI API with messages:', JSON.stringify(formattedMessages));
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use GPT-3.5-turbo for all queries for reliability
      messages: formattedMessages,
      max_tokens: 800,
      temperature: 0.7
    });
    
    console.log('OpenAI API response received');

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