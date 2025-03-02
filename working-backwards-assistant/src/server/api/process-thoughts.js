import { OpenAI } from 'openai';

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

    // Define the prompt for extracting insights
    const prompt = `
      You are an expert in Amazon's Working Backwards process. 
      
      Analyze the following initial thoughts about a product or service idea and extract key insights to help answer the Working Backwards questions.
      
      Initial thoughts:
      ${text}
      
      Based on these thoughts, provide suggested answers for the following Working Backwards questions:
      
      1. Who is the customer?
      2. What is the customer problem or opportunity?
      3. What is the most important customer benefit?
      4. How do you know what customers need or want?
      5. What does the customer experience look like?
      
      Format your response as a JSON object with keys corresponding to each question number and values containing the suggested answers.
    `;

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