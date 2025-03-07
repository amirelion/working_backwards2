/**
 * AI Service
 * 
 * This file is maintained for backward compatibility.
 * It re-exports the refactored AI service from the features/ai-services module.
 * 
 * For new code, please import directly from the features/ai-services module.
 */

import aiService from '../features/ai-services';

// Re-export everything from the new AI service module
export const {
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
} = aiService;

// Export the default aiService object
export default aiService; 