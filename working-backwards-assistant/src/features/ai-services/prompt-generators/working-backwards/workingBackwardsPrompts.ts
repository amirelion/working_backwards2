/**
 * Working Backwards Prompt Generators
 * Functions for generating prompts related to the Working Backwards process
 */

import PromptLoader from '../../../../services/PromptLoader';

/**
 * Generates a prompt for Working Backwards questions
 * 
 * @param question - The Working Backwards question to answer
 * @param previousResponses - Previous responses for context
 * @param initialThoughts - Optional initial thoughts to include
 * @returns The generated prompt string
 */
export const getWorkingBackwardsPrompt = (
  question: string,
  previousResponses: Record<string, string> = {},
  initialThoughts: string = ''
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('workingBackwards', 'workingBackwardsPrompt', {
    variables: {
      question,
      initialThoughts,
      context: Object.entries(previousResponses)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    }
  });
  return prompt;
}; 