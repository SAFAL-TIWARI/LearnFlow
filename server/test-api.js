import fetch from 'node-fetch';

// Google Gemini API key
const GEMINI_API_KEY = 'AIzaSyDjXHRQD2xGfp2nuM52SPFz9_srCQQDOf4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

async function testGeminiAPI() {
  try {
    console.log('Testing Google Gemini API connection...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Hello, are you working?" }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      })
    });
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      console.log('API Response:', data.candidates[0].content.parts[0].text);
      console.log('✅ Google Gemini API connection successful!');
    } else {
      console.error('❌ Invalid response format from Gemini API:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error connecting to Google Gemini API:', error);
  }
}

testGeminiAPI();