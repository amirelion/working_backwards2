/**
 * FAQ Prompt Generators
 * Functions for generating prompts for FAQs 
 */

import PromptLoader from '../../../../services/PromptLoader';
import { WorkingBackwardsResponses, PRFAQ, FAQ } from '../../../../types';
import { formatPRFAQContext } from '../../utils/formatters';

/**
 * Generates a prompt for customer FAQs
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getCustomerFAQPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('faqs', 'customerFAQs', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment),
      userComment
    }
  });
  return prompt;
};

/**
 * Generates a prompt for stakeholder FAQs
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getStakeholderFAQPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('faqs', 'stakeholderFAQs', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment),
      userComment
    }
  });
  return prompt;
};

/**
 * Generates a prompt for a single customer FAQ
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param existingFaqs - Existing FAQs for context
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getSingleCustomerFAQPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  existingFaqs: FAQ[] = [],
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('faqs', 'singleCustomerFAQ', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment),
      existingFaqs,
      userComment
    }
  });
  return prompt;
};

/**
 * Generates a prompt for a single stakeholder FAQ
 * 
 * @param responses - Working Backwards responses for context
 * @param currentPRFAQ - Current PRFAQ state
 * @param existingFaqs - Existing FAQs for context
 * @param userComment - Optional user guidance
 * @returns The generated prompt string
 */
export const getSingleStakeholderFAQPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  existingFaqs: FAQ[] = [],
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('faqs', 'singleStakeholderFAQ', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment),
      existingFaqs,
      userComment
    }
  });
  return prompt;
}; 