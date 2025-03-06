import { OpenAI } from 'openai';
import PromptLoader from '../src/services/promptLoader';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_AI_API_KEY || process.env.AI_API_KEY || '',
});

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check for API key
    const apiKey = process.env.REACT_APP_AI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      console.error('Missing OpenAI API key');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Load the prompt configuration
    const promptLoader = PromptLoader.getInstance();
    const { prompt } = await promptLoader.buildPrompt('initialThoughts', 'processInitialThoughts', {
      variables: { text }
    });

    // Call OpenAI API to process the text
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI assistant that helps extract insights from initial product thoughts to support the Amazon Working Backwards process." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const suggestions = JSON.parse(completion.choices[0].message.content);

    // Return the suggestions
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('API error:', error);
    
    // Ensure we always return a proper JSON response
    return res.status(500).json({ 
      error: 'Processing failed', 
      details: error.message,
      type: error.constructor.name
    });
  }
} 