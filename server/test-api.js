import OpenAI from 'openai';

// API key
const apiKey = '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';

// Create OpenAI client
const openai = new OpenAI({
  apiKey: apiKey
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API connection...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, are you working?' }
      ],
      max_tokens: 50
    });
    
    console.log('API Response:', completion.choices[0].message);
    console.log('✅ OpenAI API connection successful!');
  } catch (error) {
    console.error('❌ Error connecting to OpenAI API:', error);
  }
}

testOpenAI();