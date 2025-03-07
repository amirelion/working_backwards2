/**
 * OpenAI API Client
 * Handles communication with OpenAI's API
 */

import axios from 'axios';
import { AIResponse } from '../../../types';

// Get environment variables
const AI_API_KEY = process.env.REACT_APP_AI_API_KEY || '';

/**
 * Makes a request to OpenAI's chat completions API
 * 
 * @param prompt - The prompt to send to the model
 * @param model - The OpenAI model to use (default: set in .env)
 * @returns A Promise with the AI response
 */
export const callOpenAI = async (prompt: string, model: string): Promise<AIResponse> => {
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