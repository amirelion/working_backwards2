import axios from 'axios';
import { AIRequest, AIResponse, WorkingBackwardsResponses, PRFAQ, FAQ } from '../types';
import PromptLoader from './PromptLoader';

// Get environment variables
const AI_PROVIDER = process.env.REACT_APP_AI_PROVIDER || 'openai';
const AI_MODEL = process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini';
const AI_API_KEY = process.env.REACT_APP_AI_API_KEY || '';

// OpenAI API call
const callOpenAI = async (prompt: string, model: string): Promise<AIResponse> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
      }
    );

    return {
      content: response.data.choices[0].message.content,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      content: '',
      error: 'Failed to get response from OpenAI API',
    };
  }
};

// Anthropic API call
const callAnthropic = async (prompt: string, model: string): Promise<AIResponse> => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return {
      content: response.data.content[0].text,
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    return {
      content: '',
      error: 'Failed to get response from Anthropic API',
    };
  }
};

// Main AI service function
export const getAIResponse = async (request: AIRequest): Promise<AIResponse> => {
  const { prompt, model = AI_MODEL, provider = AI_PROVIDER } = request;

  if (!AI_API_KEY) {
    return {
      content: '',
      error: 'API key not configured. Please add your API key to the .env file.',
    };
  }

  // Call the appropriate API based on the provider
  if (provider.toLowerCase() === 'openai') {
    return callOpenAI(prompt, model);
  } else if (provider.toLowerCase() === 'anthropic') {
    return callAnthropic(prompt, model);
  } else {
    return {
      content: '',
      error: `Unsupported AI provider: ${provider}`,
    };
  }
};

// Helper function to format context for PRFAQ prompts
const formatPRFAQContext = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string,
  sectionToRegenerate?: string
): string => {
  let context = `Information about the customer and problem:\n`;
  
  // Add Working Backwards responses
  context += Object.entries(responses)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  
  // Add current PRFAQ content if available
  if (currentPRFAQ.title) {
    const isSectionToRegenerate = sectionToRegenerate === 'title';
    context += `\n\nCurrent Title: ${currentPRFAQ.title}`;
    if (isSectionToRegenerate) {
      context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
    }
  }
  
  if (currentPRFAQ.pressRelease) {
    const pr = currentPRFAQ.pressRelease;
    
    if (pr.summary) {
      const isSectionToRegenerate = sectionToRegenerate === 'summary';
      context += `\n\nFirst Paragraph (Summary): ${pr.summary}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.problem) {
      const isSectionToRegenerate = sectionToRegenerate === 'problem';
      context += `\n\nSecond Paragraph (Problem/Opportunity): ${pr.problem}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.solution) {
      const isSectionToRegenerate = sectionToRegenerate === 'solution';
      context += `\n\nThird Paragraph (Solution): ${pr.solution}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.executiveQuote) {
      const isSectionToRegenerate = sectionToRegenerate === 'executiveQuote';
      context += `\n\nFourth Paragraph (Executive Quote): ${pr.executiveQuote}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.customerJourney) {
      const isSectionToRegenerate = sectionToRegenerate === 'customerJourney';
      context += `\n\nFifth Paragraph (Customer Journey): ${pr.customerJourney}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.customerQuote) {
      const isSectionToRegenerate = sectionToRegenerate === 'customerQuote';
      context += `\n\nSixth Paragraph (Customer Quote): ${pr.customerQuote}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.gettingStarted) {
      const isSectionToRegenerate = sectionToRegenerate === 'gettingStarted';
      context += `\n\nLast Line (Call to Action): ${pr.gettingStarted}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
  }
  
  return context;
};

// Specialized prompts for different parts of the Working Backwards process
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

// Prompt for generating the headline/title
export const getHeadlinePrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'headline', {
    variables: {
      context: formatPRFAQContext(responses, currentPRFAQ, userComment, 'title'),
      userComment
    }
  });
  return prompt;
};

// Prompt for generating the first paragraph (summary)
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

// Prompt for generating the second paragraph (problem/opportunity)
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

// Prompt for generating the third paragraph (solution)
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

// Prompt for generating the fourth paragraph (executive quote)
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

// Prompt for generating the fifth paragraph (customer journey)
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

// Prompt for generating the sixth paragraph (customer quote)
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

// Prompt for generating the last line (call to action)
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

// Original full PRFAQ prompt (kept for backward compatibility)
export const getPRFAQGenerationPrompt = (
  responses: WorkingBackwardsResponses,
  title: string
): string => {
  const promptLoader = PromptLoader.getInstance();
  const { prompt } = promptLoader.buildPrompt('pressRelease', 'fullPRFAQ', {
    variables: {
      title,
      responses: Object.entries(responses)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    }
  });
  return prompt;
};

// Prompt for suggesting experiments based on PRFAQ
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

// Generate customer FAQs
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

// Generate stakeholder FAQs
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

// Generate a single customer FAQ
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

// Generate a single stakeholder FAQ
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