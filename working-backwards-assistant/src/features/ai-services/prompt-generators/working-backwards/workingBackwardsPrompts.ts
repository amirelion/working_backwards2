/**
 * Working Backwards Prompt Generators
 * Functions for generating prompts related to the Working Backwards process
 */

import PromptLoader from '../../../../services/PromptLoader';

/**
 * Generates a prompt for Working Backwards questions
 * 
 * @param promptKey - The key for the question prompt in the config
 * @param previousResponses - Previous responses for context
 * @param initialThoughts - Optional initial thoughts to include
 * @returns The generated prompt string
 */
export const getWorkingBackwardsPrompt = (
  promptKey: string,
  previousResponses: Record<string, string> = {},
  initialThoughts: string = ''
): string => {
  const promptLoader = PromptLoader.getInstance();
  
  // Get the question prompt template from the config
  // When promptKey is a nested path like 'questionPrompts.customer'
  // it will be handled by the updated getPromptConfig method
  const questionConfig = promptLoader.getPromptConfig('workingBackwards', promptKey);
  const questionTemplate = questionConfig.template;
  
  // Use the question template with the main workingBackwards prompt
  const { prompt } = promptLoader.buildPrompt('workingBackwards', 'workingBackwardsPrompt', {
    variables: {
      question: questionTemplate,
      initialThoughts,
      context: Object.entries(previousResponses)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    }
  });
  return prompt;
}; 