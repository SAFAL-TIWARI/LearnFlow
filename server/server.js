import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { scanProjectFiles } from './utils/fileScannerUtils.js';
import { 
  getCourseInfo, 
  getSemesterResources, 
  isNavigationQuery,
  extractCourseCode,
  getWebsiteNavigationInfo
} from './utils/educationalUtils.js';
import {
  getQueryContext,
  searchResources,
  extractResourceInfo
} from './utils/websiteKnowledgeUtils.js';
import {
  needsWebSearch,
  performWebSearch,
  getWebSearchContext
} from './utils/webSearchUtils.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Google Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// Get API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDjXHRQD2xGfp2nuM52SPFz9_srCQQDOf4'; // Fallback for development

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://learnflow.vercel.app', 'https://www.learnflow.app'] // Restrict in production
    : '*', // Allow all origins for development
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

// Log the API key format (first few characters only for security)
console.log('Using Gemini API key starting with:', GEMINI_API_KEY.substring(0, 5) + '...');

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
      
      try {
        // Scan files
        const scanResults = await scanProjectFiles(scanPath);
        
        // Format response
        let responseContent;
        if (scanResults.success) {
          responseContent = `📁 File Scan Results:\n\nScanned ${scanResults.scannedFiles} files in ${scanResults.scanPath}\n`;
          
          if (scanResults.files.length > 0) {
            try {
              // Send file list to Gemini for analysis
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

              // Call Gemini API for file analysis
              const analysisResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        { text: fileAnalysisPrompt }
                      ]
                    }
                  ],
                  generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1000
                  }
                })
              });
              
              const analysisData = await analysisResponse.json();
              
              if (analysisData.candidates && analysisData.candidates[0] && analysisData.candidates[0].content) {
                const analysisText = analysisData.candidates[0].content.parts[0].text;
                responseContent += `\n${analysisText}`;
              } else {
                throw new Error('Invalid response format from Gemini API');
              }
            } catch (apiError) {
              console.error('Error calling Gemini API for file analysis:', apiError);
              responseContent += "\nFile analysis failed. Here's a list of files found:\n" + 
                scanResults.files.map(file => `- ${file.path} (${file.lines} lines)`).join('\n');
            }
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
      } catch (scanError) {
        console.error('Error scanning files:', scanError);
        return res.json({
          message: {
            role: 'assistant',
            content: `❌ Error scanning files: ${scanError.message}`
          }
        });
      }
    }

    // Enhance system message with educational context
    let systemMessage = 'You are LearnFlow Assistant, an advanced AI for an educational platform. ';
    
    // Check if query is related to a specific course
    const courseCode = extractCourseCode(userContent);
    if (courseCode) {
      const courseInfo = getCourseInfo(courseCode);
      if (courseInfo) {
        systemMessage += `\nThe user is asking about ${courseCode}: ${courseInfo.name}. This course covers: ${courseInfo.topics.join(', ')}. `;
      }
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
      
      // Add website navigation information
      const navigationInfo = getWebsiteNavigationInfo(userContent);
      if (navigationInfo) {
        systemMessage += navigationInfo;
      }
    }
    
    // Add website knowledge context
    const websiteContext = getQueryContext(userContent);
    if (websiteContext) {
      systemMessage += `\n${websiteContext}`;
    }
    
    // Add web search context if needed
    if (needsWebSearch(userContent)) {
      try {
        console.log('Performing web search for:', userContent);
        const webSearchContext = await getWebSearchContext(userContent);
        if (webSearchContext) {
          systemMessage += `\nI've searched the web for information related to this query. Here are some relevant results: ${webSearchContext}`;
        }
      } catch (searchError) {
        console.error('Error performing web search:', searchError);
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
5. For general knowledge questions, use your knowledge to provide accurate and up-to-date information
6. For website-specific questions, guide users to the appropriate section of the LearnFlow website

If the user asks about content on the LearnFlow website, try to provide direct links or paths to the relevant pages.
If the user asks about academic topics not specific to LearnFlow, provide comprehensive educational answers.

Always maintain a helpful, educational tone and focus on providing value to students.`;

    // Get conversation history (last 5 messages for context)
    const conversationHistory = messages.slice(-5).map(msg => msg.content).join('\n');
    
    // Combine system message with user query and conversation history
    const fullPrompt = `${systemMessage}\n\nConversation history:\n${conversationHistory}\n\nUser query: ${userContent}`;

    try {
      // Call Gemini API
      console.log('Calling Gemini API...');
      
      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: fullPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        })
      });
      
      const geminiData = await geminiResponse.json();
      
      console.log('Gemini API response received');

      if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
        const responseText = geminiData.candidates[0].content.parts[0].text;
        
        // Send response
        res.json({
          message: {
            role: 'assistant',
            content: responseText
          }
        });
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      
      // Fallback response mechanism
      console.log('Using fallback response mechanism');
      
      // Generate a fallback response based on the user's query
      let fallbackResponse = '';
      
      if (userContent.toLowerCase().includes('hello') || userContent.toLowerCase().includes('hi')) {
        fallbackResponse = "Hello! I'm LearnFlow Assistant. How can I help you with your educational needs today?";
      } else if (userContent.toLowerCase().includes('help')) {
        fallbackResponse = "I'm here to help with your educational questions. You can ask me about courses, assignments, or study resources.";
      } else if (userContent.toLowerCase().includes('course') || userContent.toLowerCase().includes('class')) {
        fallbackResponse = "LearnFlow offers various courses across different disciplines. You can find course materials in the Resources section of the website.";
      } else if (userContent.toLowerCase().includes('assignment') || userContent.toLowerCase().includes('homework')) {
        fallbackResponse = "For assignment help, please check the specific course page where all assignments are listed with their due dates and requirements.";
      } else if (userContent.toLowerCase().includes('resource') || userContent.toLowerCase().includes('material')) {
        fallbackResponse = "Educational resources are available in the Resources section. You can filter by course, semester, or topic to find what you need.";
      } else {
        fallbackResponse = "I'm currently experiencing connection issues with my knowledge base. Please try again later or rephrase your question.";
      }
      
      res.json({
        message: {
          role: 'assistant',
          content: fallbackResponse
        }
      });
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Failed to process your request',
      message: {
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again later."
      }
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

// Start the server if not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for serverless environments (Vercel)
export default app;