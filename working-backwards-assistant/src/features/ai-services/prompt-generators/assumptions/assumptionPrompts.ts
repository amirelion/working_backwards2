/**
 * Assumption Prompt Generators
 * Functions for generating prompts related to assumptions
 */

import PromptLoader from '../../../../services/PromptLoader';
import { AssumptionCategory } from '../../../assumptions/types';

interface GenerateAssumptionsPromptParams {
  prfaq: any;
  workingBackwards: any;
  category: AssumptionCategory;
  customInstructions?: string;
}

/**
 * Generates a prompt for assumption generation based on PRFAQ and working backwards responses
 * 
 * @param params - Parameters for generating the assumptions prompt
 * @returns The generated prompt string
 */
export const getGenerateAssumptionsPrompt = (params: GenerateAssumptionsPromptParams): string => {
  const { prfaq, workingBackwards, category, customInstructions = '' } = params;
  
  const promptLoader = PromptLoader.getInstance();
  
  // Get the category-specific guidance
  const categoryGuidance = promptLoader.getRawPromptData('assumptions')?.categoryGuidance?.[category] || '';
  
  // Create context for the prompt
  const context = JSON.stringify({
    prfaq: {
      title: prfaq.title,
      pressRelease: {
        summary: prfaq.pressRelease.summary,
        problem: prfaq.pressRelease.problem,
        solution: prfaq.pressRelease.solution,
        executiveQuote: prfaq.pressRelease.executiveQuote,
        customerJourney: prfaq.pressRelease.customerJourney,
        customerQuote: prfaq.pressRelease.customerQuote,
      }
    },
    workingBackwards
  }, null, 2);
  
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