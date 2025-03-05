import { OpenAI } from 'openai';
import { PromptLoader } from '../../utils/promptLoader';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Load the prompt configuration
    const promptLoader = PromptLoader.getInstance();
    const prompt = await promptLoader.buildPrompt('initialThoughts', 'processInitialThoughts', {
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
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Processing failed', 
      details: error.message 
    });
  }
} 