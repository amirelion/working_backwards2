/**
 * Paragraph Prompt Generators
 * Functions for generating prompts for PRFAQ paragraphs
 */

import PromptLoader from '../../../../services/PromptLoader';
import { WorkingBackwardsResponses, PRFAQ } from '../../../../types';
import { formatPRFAQContext } from '../../utils/formatters';

/**
 * Generates a prompt for the first paragraph (summary)
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getFirstParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'firstParagraph', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment, 'summary'),
      userComment
    }
  });
  return prompt;
};

/**
 * Generates a prompt for the second paragraph (problem/opportunity)
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getSecondParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'secondParagraph', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment, 'problem'),
      userComment
    }
  });
  return prompt;
};

/**
 * Generates a prompt for the third paragraph (solution)
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getThirdParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'thirdParagraph', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment, 'solution'),
      userComment
    }
  });
  return prompt;
};

/**
 * Generates a prompt for the fourth paragraph (executive quote)
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getFourthParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'fourthParagraph', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment, 'executiveQuote'),
      userComment
    }
  });
  return prompt;
};

/**
 * Generates a prompt for the fifth paragraph (customer journey)
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getFifthParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'fifthParagraph', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment, 'customerJourney'),
      userComment
    }
  });
  return prompt;
};

/**
 * Generates a prompt for the sixth paragraph (customer quote)
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getSixthParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'sixthParagraph', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment, 'customerQuote'),
      userComment
    }
  });
  return prompt;
};

/**
 * Generates a prompt for the call to action (last line)
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getCallToActionPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'callToAction', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment, 'gettingStarted'),
      userComment
    }
  });
  return prompt;
}; 