import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Google Gemini API key
const GEMINI_API_KEY = 'AIzaSyCOj3Extd63rPuOIHmhbSZNz2lqJwamAwk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// Create .env file if it doesn't exist
const envPath = join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(
    envPath,
    `GEMINI_API_KEY=${GEMINI_API_KEY}`
  );
  console.log('.env file created with Gemini API key');
}

// Test queries
const testQueries = [
  "Explain the concept of nanomaterials in CHB 101.",
  "Give me Python code for a bubble sort algorithm.",
  "Where can I find 2nd semester CSE IoT materials?",
  "What are the key topics covered in ITC 101?"
];

// System message
const systemMessage = `You are LearnFlow Assistant, an advanced AI for an educational platform. 
Provide concise, accurate information about academic topics, learning resources, and study techniques. Be friendly and supportive.

When answering:
1. For educational questions, provide clear explanations with examples
2. For coding questions, provide well-commented code snippets
3. For resource questions, give specific paths where materials can be found
4. For course-specific questions, reference relevant course materials and topics

Always maintain a helpful, educational tone and focus on providing value to students.`;

// Test function
async function testChatbot() {
  console.log("🤖 Testing LearnFlow Chatbot with Gemini API...\n");
  
  for (const query of testQueries) {
    console.log(`📝 Query: ${query}`);
    
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemMessage}\n\nUser query: ${query}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        })
      });
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        console.log(`🔍 Response: ${responseText}\n`);
      } else {
        console.error('❌ Invalid response format from Gemini API:', JSON.stringify(data, null, 2));
      }
      
      console.log("---------------------------------------------------\n");
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log("✅ Test completed!");
}

// Run the test
testChatbot();