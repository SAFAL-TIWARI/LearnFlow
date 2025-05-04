import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

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

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
  console.log("🤖 Testing LearnFlow Chatbot...\n");
  
  for (const query of testQueries) {
    console.log(`📝 Query: ${query}`);
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: query }
        ],
        max_tokens: 500
      });
      
      console.log(`🔍 Response: ${completion.choices[0].message.content}\n`);
      console.log("---------------------------------------------------\n");
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log("✅ Test completed!");
}

// Run the test
testChatbot();