/**
 * Anthropic API Client
 * Handles communication with Anthropic's API
 */

import axios from 'axios';
import { AIResponse } from '../../../types';

// Get environment variables
const AI_API_KEY = process.env.REACT_APP_AI_API_KEY || '';

/**
 * Makes a request to Anthropic's messages API
 * 
 * @param prompt - The prompt to send to the model
 * @param model - The Anthropic model to use (default: set in .env)
 * @returns A Promise with the AI response
 */
export const callAnthropic = async (prompt: string, model: string): Promise<AIResponse> => {
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