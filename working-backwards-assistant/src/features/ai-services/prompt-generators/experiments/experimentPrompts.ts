/**
 * Experiment Prompt Generators
 * Functions for generating prompts related to experiments
 */

import PromptLoader from '../../../../services/PromptLoader';

/**
 * Generates a prompt for experiment suggestions based on PRFAQ and assumptions
 * 
 * @param prfaq - The complete PRFAQ text
 * @param assumptions - Array of assumptions to test
 * @returns The generated prompt string
 */
export const getExperimentSuggestionsPrompt = (
  prfaq: string,
  assumptions: string[]
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('experiments', 'experimentSuggestions', {
    variables: {
      prfaq,
      assumptions
    }
  });
  return prompt;
}; 