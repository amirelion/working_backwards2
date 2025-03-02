import axios from 'axios';
import { AIRequest, AIResponse, WorkingBackwardsResponses } from '../types';

// Get environment variables
const AI_PROVIDER = process.env.REACT_APP_AI_PROVIDER || 'openai';
const AI_MODEL = process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini';
const AI_API_KEY = process.env.REACT_APP_AI_API_KEY || '';

// OpenAI API call
const callOpenAI = async (prompt: string, model: string): Promise<AIResponse> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
      }
    );

    return {
      content: response.data.choices[0].message.content,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      content: '',
      error: 'Failed to get response from OpenAI API',
    };
  }
};

// Anthropic API call
const callAnthropic = async (prompt: string, model: string): Promise<AIResponse> => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return {
      content: response.data.content[0].text,
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    return {
      content: '',
      error: 'Failed to get response from Anthropic API',
    };
  }
};

// Main AI service function
export const getAIResponse = async (request: AIRequest): Promise<AIResponse> => {
  const { prompt, model = AI_MODEL, provider = AI_PROVIDER } = request;

  if (!AI_API_KEY) {
    return {
      content: '',
      error: 'API key not configured. Please add your API key to the .env file.',
    };
  }

  // Call the appropriate API based on the provider
  if (provider.toLowerCase() === 'openai') {
    return callOpenAI(prompt, model);
  } else if (provider.toLowerCase() === 'anthropic') {
    return callAnthropic(prompt, model);
  } else {
    return {
      content: '',
      error: `Unsupported AI provider: ${provider}`,
    };
  }
};

// Specialized prompts for different parts of the Working Backwards process

// Prompt for guiding the Working Backwards conversation
export const getWorkingBackwardsPrompt = (
  question: string,
  previousResponses: Record<string, string> = {}
): string => {
  const context = Object.entries(previousResponses)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `
You are an expert in Amazon's Working Backwards innovation methodology. 
You're helping a user develop their innovation idea using this approach.

${context ? `Context from previous responses:\n${context}\n\n` : ''}

The current question is: "${question}"

Please provide a thoughtful response that helps the user think deeply about this aspect of their innovation.
Include 1-2 examples from well-known products or services to illustrate your points.
End with 1-2 follow-up questions that will help the user refine their thinking.
`;
};

// Prompt for generating a PRFAQ based on Working Backwards responses
export const getPRFAQGenerationPrompt = (
  responses: WorkingBackwardsResponses,
  title: string
): string => {
  return `
You an expert in Amazon's Working Backwards innovation methodology. You think of problems or opportunities to delight customers, come up with an innovative customer focused solution for the ${title || 'Use case'}, and write a one page Press Release about it.

The contents of the PR must answer the 5 working backwards questions:
Pressure Test your draft: Have you answered the 5 Working Backwards Questions?
1. Who is the specific customer? Is it clear from the PR who the customer is?
2. What is the customer problem or opportunity? Does the PR clearly outline the problem or opportunity?
3. What is the most important customer benefit? Is it clear how the customer need is met or resolved?
4. How do you know what customers need or want? Did the PR provide indications of customers' desire?
5. What does the customer experience look like? Can you visualize the customer experience?

Tips & Tricks: Guidelines to help you write
* Put the most important information at the beginning. Imagine no one reads past the first paragraph.
* Avoid Marketing Buzz Words (e.g. simple, easy, exciting, etc.).
* Do not exaggerate the problem or the solution.
* Only include metrics and data that matters to your customer (e.g. their time, their money).

Information about the customer and problem:
${Object.entries(responses)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

The structure of your Press Release should be:

Headline: Imagine a succinct one-liner a newsie would use - 5-7 words that capture the value that the new solution provides to customers.

First Paragraph: Date: Your future launch date (e.g. January 1, 2024), and Short Summary (4-5 sentences): Describe what you're launching and the most important benefit (i.e. Elevator Pitch). Assume no one will read past this point (unless it is intriguing).

Second paragraph - The Opportunity or The Problem: Clearly explain the opportunity or problem you are solving with your product. Why is this problem or opportunity important and what impact does it have on people.

Third paragraph - Describe What You're Launching: Explain the product or service in clear customer friendly language. The key features and how do they address the problem or opportunity and are set to delight customers and answer their needs.

Fourth paragraph - imaginary quote from an executive of the company or organization who is launching the solution. It should mention their name and role, and convey how is this part of a bigger vision.

Fifth paragraph - A typical customer journey describing the customer experience in simple easy steps, motivating the reader to try it.

Sixth paragraph - Customer Quote: Speculative customer quote who has been using the new solution product recently, reinforcing why the customer cares about your launch. A typical anatomy could be - what was the pain before, how this new solution changed it, and how do they feel about it now.

Last line - Call to Action: Direct the reader to where they can go to get started (download app, go to store, call an agent, etc.)

Focus primarily on creating an excellent press release. The FAQ section will be handled separately.
`;
};

// Prompt for suggesting experiments based on PRFAQ
export const getExperimentSuggestionsPrompt = (
  prfaq: string,
  assumptions: string[]
): string => {
  return `
You are an expert in product validation and experimentation.
Based on the following PRFAQ and key assumptions, suggest 3-5 experiments that could validate the most critical assumptions.

PRFAQ:
${prfaq}

Key Assumptions:
${assumptions.join('\n')}

For each experiment, provide:
1. A clear name
2. The hypothesis being tested
3. A brief methodology (how to conduct the experiment)
4. Success criteria (how to measure results)

Focus on experiments that are:
- Quick to implement
- Low-cost
- Provide meaningful validation
- Address the riskiest assumptions first
`;
};

export default {
  getAIResponse,
  getWorkingBackwardsPrompt,
  getPRFAQGenerationPrompt,
  getExperimentSuggestionsPrompt,
}; 