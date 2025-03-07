import { getAIResponse } from '../services/aiService';
import { PromptLoaderClient } from './PromptLoaderClient';

/**
 * Extracts valid JSON from a potentially markdown-formatted string
 * Handles various response formats from AI models
 */
function extractJSONFromAIResponse(text: string): string {
  // Case 1: Text is already valid JSON
  try {
    JSON.parse(text);
    return text;
  } catch (e) {
    // Not valid JSON, continue with extraction
  }

  // Case 2: JSON inside code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      JSON.parse(codeBlockMatch[1]);
      return codeBlockMatch[1];
    } catch (e) {
      // Not valid JSON, continue with other methods
    }
  }

  // Case 3: Find content between curly braces as a last resort
  const curlyBraceMatch = text.match(/{[\s\S]*}/);
  if (curlyBraceMatch) {
    try {
      JSON.parse(curlyBraceMatch[0]);
      return curlyBraceMatch[0];
    } catch (e) {
      // Not valid JSON, try the next approach
    }
  }

  // Case 4: Remove markdown code block markers and try again
  const cleanedContent = text
    .replace(/^```(json)?|```$/gm, '')
    .trim();
  
  try {
    JSON.parse(cleanedContent);
    return cleanedContent;
  } catch (e) {
    // Still not valid JSON
  }
  
  // If we get here, we couldn't extract valid JSON
  throw new Error("Could not extract valid JSON from AI response");
}

export async function processInitialThoughts(text: string) {
  try {
    console.log('Processing initial thoughts with the AI service');
    
    // Use the PromptLoaderClient to load the same template used by the server
    const promptLoader = PromptLoaderClient.getInstance();
    const { prompt, settings } = promptLoader.buildPrompt('initialThoughts', 'processInitialThoughts', {
      variables: { text }
    });
    
    // Call the AI service directly using the same method that works elsewhere in the app
    const response = await getAIResponse({
      prompt,
      model: settings.model || process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
      provider: settings.provider || process.env.REACT_APP_AI_PROVIDER || 'openai'
    });
    
    if (response.error) {
      console.error('AI service error:', response.error);
      throw new Error(response.error);
    }
    
    // Parse the JSON response from the content field using our robust extraction
    let responseData;
    try {
      console.log('Raw AI response:', response.content);
      const jsonString = extractJSONFromAIResponse(response.content);
      responseData = JSON.parse(jsonString);
      console.log('Successfully parsed AI response:', responseData);
    } catch (parseError: any) {
      console.error('Failed to parse AI response:', response.content);
      throw new Error(`Failed to parse AI response: ${parseError?.message || 'Invalid JSON'}`);
    }
    
    // Format the response to match the expected structure for workingBackwardsQuestions
    return {
      customer: '',
      problem: '',
      benefit: '',
      validation: '',
      experience: '',
      aiSuggestions: {
        "1. Who is the customer?": responseData.customer || responseData["1"] || '',
        "2. What is the customer problem or opportunity?": responseData.problem || responseData["2"] || '',
        "3. What is the most important customer benefit?": responseData.benefit || responseData["3"] || '',
        "4. How do you know what customers need or want?": responseData.validation || responseData["4"] || '',
        "5. What does the customer experience look like?": responseData.experience || responseData["5"] || ''
      }
    };
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw error;
  }
} 