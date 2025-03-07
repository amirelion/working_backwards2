/**
 * Full PRFAQ Prompt Generators
 * Functions for generating prompts for complete PRFAQ
 */

import PromptLoader from '../../../../services/PromptLoader';
import { WorkingBackwardsResponses } from '../../../../types';

/**
 * Generates a prompt for a complete PRFAQ
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