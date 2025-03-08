/**
 * Assumption Prompt Generators
 * Functions for generating prompts related to assumptions
 */

import PromptLoader from '../../../../services/PromptLoader';
import { AssumptionCategory } from '../../../assumptions/types';

interface GenerateAssumptionsPromptParams {
  prfaq: any;
  workingBackwards: any;
  faqs?: Array<{ question: string; answer: string }>;
  category: AssumptionCategory;
  customInstructions?: string;
}

/**
 * Constructs the full press release text from individual sections
 * 
 * @param prfaq - The PRFAQ data
 * @returns Formatted complete press release text
 */
const constructFullPressReleaseText = (prfaq: any): string => {
  const { title, pressRelease } = prfaq;
  
  return `# ${title}

## Summary
${pressRelease.summary || ''}

## Customer Problem
${pressRelease.problem || ''}

## Solution
${pressRelease.solution || ''}

## Executive Quote
${pressRelease.executiveQuote || ''}

## Customer Journey
${pressRelease.customerJourney || ''}

## Customer Quote
${pressRelease.customerQuote || ''}`;
};

/**
 * Formats FAQs for inclusion in the prompt
 * 
 * @param faqs - Array of FAQ items
 * @returns Formatted FAQ text
 */
const formatFAQs = (faqs: Array<{ question: string; answer: string }> = []): string => {
  if (!faqs || faqs.length === 0) return '';
  
  return faqs.map((faq, index) => `Q${index + 1}: ${faq.question}\nA${index + 1}: ${faq.answer}`).join('\n\n');
};

/**
 * Generates a prompt for assumption generation based on PRFAQ and working backwards responses
 * 
 * @param params - Parameters for generating the assumptions prompt
 * @returns The generated prompt string
 */
export const getGenerateAssumptionsPrompt = (params: GenerateAssumptionsPromptParams): string => {
  const { prfaq, workingBackwards, faqs = [], category, customInstructions = '' } = params;
  
  const promptLoader = PromptLoader.getInstance();
  
  // Get the category-specific guidance
  const categoryGuidance = promptLoader.getRawPromptData('assumptions')?.categoryGuidance?.[category] || '';
  
  // Generate full press release text
  const fullPressReleaseText = constructFullPressReleaseText(prfaq);
  
  // Format FAQs
  const formattedFAQs = formatFAQs(faqs);
  
  // Create context for the prompt
  const context = {
    fullPressReleaseText,
    formattedFAQs,
    workingBackwards: JSON.stringify(workingBackwards, null, 2)
  };
  
  // Build the prompt
  const { prompt } = promptLoader.buildPrompt('assumptions', 'generateAssumptions', {
    variables: {
      context,
      category,
      categoryGuidance,
      customInstructions
    }
  });
  
  return prompt;
}; 