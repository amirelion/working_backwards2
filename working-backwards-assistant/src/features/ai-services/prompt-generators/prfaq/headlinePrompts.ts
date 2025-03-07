/**
 * Headline Prompt Generators
 * Functions for generating prompts for PRFAQ titles/headlines
 */

import PromptLoader from '../../../../services/PromptLoader';
import { WorkingBackwardsResponses, PRFAQ } from '../../../../types';
import { formatPRFAQContext } from '../../utils/formatters';

/**
 * Generates a prompt for creating a PRFAQ headline/title
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getHeadlinePrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'headline', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment, 'title'),
      userComment
    }
  });
  return prompt;
}; 