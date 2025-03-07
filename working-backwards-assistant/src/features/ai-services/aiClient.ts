/**
 * AI Client Service
 * Central service for handling AI requests to different providers
 */

import { AIRequest, AIResponse } from '../../types';
import { callOpenAI, callAnthropic } from './api-clients';
import { AI_PROVIDER, AI_MODEL, AI_API_KEY } from './utils/constants';

/**
 * Sends a request to the appropriate AI service and returns the response
 * 
 * @param request - The AI request containing prompt, model and provider options
 * @returns A Promise with the AI response
 */
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