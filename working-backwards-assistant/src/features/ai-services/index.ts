/**
 * AI Services Module
 * Main entry point for AI services
 */

// Export the AI client
export { getAIResponse } from './aiClient';

// Export all prompt generators
export * from './prompt-generators';

// Create and export the default aiService object for backward compatibility
import { getAIResponse } from './aiClient';
import {
  getWorkingBackwardsPrompt,
  getHeadlinePrompt,
  getFirstParagraphPrompt,
  getSecondParagraphPrompt,
  getThirdParagraphPrompt,
  getFourthParagraphPrompt,
  getFifthParagraphPrompt,
  getSixthParagraphPrompt,
  getCallToActionPrompt,
  getPRFAQGenerationPrompt,
  getCustomerFAQPrompt,
  getStakeholderFAQPrompt,
  getSingleCustomerFAQPrompt,
  getSingleStakeholderFAQPrompt,
  getExperimentSuggestionsPrompt
} from './prompt-generators';

/**
 * Main AI service object
 * Provides a facade for all AI-related functionality
 */
const aiService = {
  getAIResponse,
  getWorkingBackwardsPrompt,
  getPRFAQGenerationPrompt,
  getExperimentSuggestionsPrompt,
  getFirstParagraphPrompt,
  getSecondParagraphPrompt,
  getThirdParagraphPrompt,
  getFourthParagraphPrompt,
  getFifthParagraphPrompt,
  getSixthParagraphPrompt,
  getCallToActionPrompt,
  getHeadlinePrompt,
  getCustomerFAQPrompt,
  getStakeholderFAQPrompt,
  getSingleCustomerFAQPrompt,
  getSingleStakeholderFAQPrompt,
};

export default aiService; 