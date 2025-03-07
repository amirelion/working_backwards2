/**
 * Full PRFAQ Prompt Generators
 * Functions for generating prompts for complete PRFAQ
 */

import PromptLoader from '../../../../services/PromptLoader';
import { WorkingBackwardsResponses } from '../../../../types';

/**
 * Generates a prompt for a complete PRFAQ
 * This function is kept for backward compatibility
 * 
 * @param responses - Working Backwards responses for context
 * @param title - Title for the PRFAQ
 * @returns The generated prompt string
 */
export const getPRFAQGenerationPrompt = (
  responses: WorkingBackwardsResponses,
  title: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'fullPRFAQ', {
    variables: {
      title,
      responses: Object.entries(responses)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    }
  });
  return prompt;
}; 