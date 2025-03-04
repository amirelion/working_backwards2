import axios from 'axios';
import { AIRequest, AIResponse, WorkingBackwardsResponses, PRFAQ, FAQ } from '../types';

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

// Specialized prompts for different parts of the Working Backwards process

// Prompt for guiding the Working Backwards conversation
export const getWorkingBackwardsPrompt = (
  question: string,
  previousResponses: Record<string, string> = {},
  initialThoughts: string = ''
): string => {
  const context = Object.entries(previousResponses)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `
You are an expert in Amazon's Working Backwards innovation methodology. 
You're helping a user develop their innovation idea using this approach.

${context ? `Context from previous responses:\n${context}\n\n` : ''}
${initialThoughts ? `Initial thoughts from the user:\n${initialThoughts}\n\n` : ''}

The current question is: "${question}"

Please provide a thoughtful response that helps the user think deeply about this aspect of their innovation.
Include 1-2 examples from well-known products or services to illustrate your points.
End with 1-2 follow-up questions that will help the user refine their thinking.
`;
};

// Helper function to format the context for PRFAQ prompts
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
  
  // Add user comment if provided
  if (userComment && userComment.trim()) {
    context += `\n\nUser Instructions for Revision: ${userComment.trim()}`;
  }
  
  return context;
};

// Prompt for generating the first paragraph (summary)
export const getFirstParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment, 'summary');
  
  return `
You are an expert in Amazon's Working Backwards innovation methodology.

${context}

Please write ONLY the First Paragraph for a press release about this innovation.
This should include a future launch date (e.g. January 1, 2024) and a short summary (4-5 sentences) that describes what is being launched and the most important customer benefit (an elevator pitch).

This paragraph should provide a high-level overview that introduces both the problem and solution briefly, without going into extensive detail on either.

Remember:
- Start with a future launch date
- Put the most important information at the beginning
- Briefly mention what problem is being solved and how
- Focus on the primary customer benefit
- Avoid marketing buzz words (e.g. simple, easy, exciting)
- Do not exaggerate the problem or solution
- Only include metrics that matter to the customer (e.g. their time, their money)
- Assume no one will read past this paragraph
- Keep it concise but compelling

${userComment ? 'Please revise the existing paragraph according to the user instructions.' : 'Provide ONLY the first paragraph text without any additional commentary.'}
`;
};

// Prompt for generating the second paragraph (problem/opportunity)
export const getSecondParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment, 'problem');
  
  return `
You are an expert in Amazon's Working Backwards innovation methodology.

${context}

Please write ONLY the Second Paragraph for a press release about this innovation.
This paragraph should EXCLUSIVELY focus on explaining the opportunity or problem being solved with this product.
Explain why this problem or opportunity is important and what impact it has on people.

IMPORTANT: Do NOT mention any solutions, products, or how the problem will be solved in this paragraph.
Focus ONLY on describing the problem or opportunity in detail.

Remember:
- Be specific about the problem or opportunity
- Explain why it matters to customers
- Use clear, jargon-free language
- Do not exaggerate the problem
- DO NOT mention your product, solution, or how the problem will be addressed
- This paragraph should ONLY establish the problem context, not introduce solutions

${userComment ? 'Please revise the existing paragraph according to the user instructions.' : 'Provide ONLY the second paragraph text without any additional commentary.'}
`;
};

// Prompt for generating the third paragraph (solution)
export const getThirdParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment, 'solution');
  
  return `
You are an expert in Amazon's Working Backwards innovation methodology.

${context}

Please write ONLY the Third Paragraph for a press release about this innovation.
This paragraph should introduce and explain the product or service in clear, customer-friendly language.
This is where you should first mention the solution to the problem described in the previous paragraph.
Describe the key features and how they address the problem or opportunity and are set to delight customers and answer their needs.

Remember:
- Start by introducing the solution to the problem described in the previous paragraph
- Focus on how the solution addresses the customer problem
- Use clear, jargon-free language
- Highlight the most important features
- Connect features to customer benefits
- Be specific about how your solution solves the problem

${userComment ? 'Please revise the existing paragraph according to the user instructions.' : 'Provide ONLY the third paragraph text without any additional commentary.'}
`;
};

// Prompt for generating the fourth paragraph (executive quote)
export const getFourthParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment, 'executiveQuote');
  
  return `
You are an expert in Amazon's Working Backwards innovation methodology.

${context}

Please write ONLY the Fourth Paragraph for a press release about this innovation.
This paragraph should be an imaginary quote from an executive of the company or organization launching the solution.
Include their name and role, and convey how this is part of a bigger vision.

Remember:
- Make the quote sound authentic and conversational
- Include the executive's name and title
- Connect the innovation to a larger company vision or strategy
- Express enthusiasm without using marketing buzz words

${userComment ? 'Please revise the existing paragraph according to the user instructions.' : 'Provide ONLY the fourth paragraph text without any additional commentary.'}
`;
};

// Prompt for generating the fifth paragraph (customer journey)
export const getFifthParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment, 'customerJourney');
  
  return `
You are an expert in Amazon's Working Backwards innovation methodology.

${context}

Please write ONLY the Fifth Paragraph for a press release about this innovation.
This paragraph should describe a typical customer journey in simple, easy steps, motivating the reader to try it.

Remember:
- Break down the customer experience into clear steps
- Make it easy for the reader to visualize using the product
- Focus on the simplicity and value of the experience
- Highlight how the journey solves the customer's problem

${userComment ? 'Please revise the existing paragraph according to the user instructions.' : 'Provide ONLY the fifth paragraph text without any additional commentary.'}
`;
};

// Prompt for generating the sixth paragraph (customer quote)
export const getSixthParagraphPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment, 'customerQuote');
  
  return `
You are an expert in Amazon's Working Backwards innovation methodology.

${context}

Please write ONLY the Sixth Paragraph for a press release about this innovation.
This paragraph should be a speculative customer quote from someone who has been using the new solution recently.
The quote should reinforce why the customer cares about this launch.

A typical structure could include:
- What was the pain before
- How this new solution changed it
- How they feel about it now

Remember:
- Make the quote sound authentic and conversational
- Include the customer's name and relevant details (e.g., role, location)
- Focus on the emotional and practical benefits
- Be specific about the impact on the customer's life or work

${userComment ? 'Please revise the existing paragraph according to the user instructions.' : 'Provide ONLY the sixth paragraph text without any additional commentary.'}
`;
};

// Prompt for generating the last line (call to action)
export const getCallToActionPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment, 'gettingStarted');
  
  return `
You are an expert in Amazon's Working Backwards innovation methodology.

${context}

Please write ONLY the Last Line (Call to Action) for a press release about this innovation.
This should direct the reader to where they can go to get started (download app, go to store, call an agent, etc.).

Remember:
- Be clear and specific about what action to take
- Include any relevant dates, URLs, or contact information
- Keep it concise and actionable
- Create a sense of urgency if appropriate

${userComment ? 'Please revise the existing line according to the user instructions.' : 'Provide ONLY the call to action text without any additional commentary.'}
`;
};

// Prompt for generating the headline/title
export const getHeadlinePrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment, 'title');
  
  return `
You are an expert in Amazon's Working Backwards innovation methodology.

${context}

Please write ONLY the Headline for a press release about this innovation.
This should be a succinct one-liner (5-7 words) that captures the value that the new solution provides to customers.

Remember:
- Keep it short and impactful
- Focus on the primary customer benefit
- Avoid marketing buzz words
- Make it memorable and attention-grabbing

${userComment ? 'Please revise the existing headline according to the user instructions.' : 'Provide ONLY the headline text without any additional commentary.'}
`;
};

// Original full PRFAQ prompt (kept for backward compatibility)
export const getPRFAQGenerationPrompt = (
  responses: WorkingBackwardsResponses,
  title: string
): string => {
  return `
You an expert in Amazon's Working Backwards innovation methodology. You think of problems or opportunities to delight customers, come up with an innovative customer focused solution for the ${title || 'Use case'}, and write a one page Press Release about it.

The contents of the PR must answer the 5 working backwards questions:
Pressure Test your draft: Have you answered the 5 Working Backwards Questions?
1. Who is the specific customer? Is it clear from the PR who the customer is?
2. What is the customer problem or opportunity? Does the PR clearly outline the problem or opportunity?
3. What is the most important customer benefit? Is it clear how the customer need is met or resolved?
4. How do you know what customers need or want? Did the PR provide indications of customers' desire?
5. What does the customer experience look like? Can you visualize the customer experience?

Tips & Tricks: Guidelines to help you write
* Put the most important information at the beginning. Imagine no one reads past the first paragraph.
* Avoid Marketing Buzz Words (e.g. simple, easy, exciting, etc.).
* Do not exaggerate the problem or the solution.
* Only include metrics and data that matters to your customer (e.g. their time, their money).

Information about the customer and problem:
${Object.entries(responses)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

The structure of your Press Release should be:

Headline: Imagine a succinct one-liner a newsie would use - 5-7 words that capture the value that the new solution provides to customers.

First Paragraph: Date: Your future launch date (e.g. January 1, 2024), and Short Summary (4-5 sentences): Describe what you're launching and the most important benefit (i.e. Elevator Pitch). Assume no one will read past this point (unless it is intriguing).

Second paragraph - The Opportunity or The Problem: Clearly explain the opportunity or problem you are solving with your product. Why is this problem or opportunity important and what impact does it have on people.

Third paragraph - Describe What You're Launching: Explain the product or service in clear customer friendly language. The key features and how do they address the problem or opportunity and are set to delight customers and answer their needs.

Fourth paragraph - imaginary quote from an executive of the company or organization who is launching the solution. It should mention their name and role, and convey how is this part of a bigger vision.

Fifth paragraph - A typical customer journey describing the customer experience in simple easy steps, motivating the reader to try it.

Sixth paragraph - Customer Quote: Speculative customer quote who has been using the new solution product recently, reinforcing why the customer cares about your launch. A typical anatomy could be - what was the pain before, how this new solution changed it, and how do they feel about it now.

Last line - Call to Action: Direct the reader to where they can go to get started (download app, go to store, call an agent, etc.)

Focus primarily on creating an excellent press release. The FAQ section will be handled separately.
`;
};

// Prompt for suggesting experiments based on PRFAQ
export const getExperimentSuggestionsPrompt = (
  prfaq: string,
  assumptions: string[]
): string => {
  return `
You are an expert in product validation and experimentation.
Based on the following PRFAQ and key assumptions, suggest 3-5 experiments that could validate the most critical assumptions.

PRFAQ:
${prfaq}

Key Assumptions:
${assumptions.join('\n')}

For each experiment, provide:
1. A clear name
2. The hypothesis being tested
3. A brief methodology (how to conduct the experiment)
4. Success criteria (how to measure results)

Focus on experiments that are:
- Quick to implement
- Low-cost
- Provide meaningful validation
- Address the riskiest assumptions first
`;
};

// Generate customer FAQs
export const getCustomerFAQPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment);
  
  return `${context}

Based on the information provided about this product/service, generate 5 frequently asked questions (FAQs) that potential customers might have, along with detailed answers. These should address common concerns, questions, and objections that customers might have.

Focus on questions related to:
- Pricing and value
- How the product/service works
- Support and customer service
- Implementation and getting started
- Compatibility and integration with existing systems
- Features and limitations
- Security and privacy concerns

${userComment ? `\nAdditional instructions: ${userComment}` : ''}

Format your response as a numbered list of questions and answers, like this:
1. Q: [Question]
   A: [Answer]

2. Q: [Question]
   A: [Answer]

And so on. Make sure each answer is comprehensive and addresses the question fully.`;
};

// Generate stakeholder FAQs
export const getStakeholderFAQPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment);
  
  return `${context}

Based on the information provided about this product/service, generate 5 frequently asked questions (FAQs) that internal stakeholders (investors, executives, team members) might have, along with detailed answers. These should address strategic concerns, risks, and implementation details.

Focus on questions related to:
- Business model and revenue potential
- Risks and mitigations
- Rollout strategy and timeline
- Scaling considerations
- Resource requirements
- Success metrics and KPIs
- Competitive landscape
- Technical implementation challenges

${userComment ? `\nAdditional instructions: ${userComment}` : ''}

Format your response as a numbered list of questions and answers, like this:
1. Q: [Question]
   A: [Answer]

2. Q: [Question]
   A: [Answer]

And so on. Make sure each answer is comprehensive and addresses the question fully from a business and strategic perspective.`;
};

// Generate a single customer FAQ
export const getSingleCustomerFAQPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  existingFaqs: FAQ[] = [],
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment);
  
  // Format existing FAQs
  let existingFaqsText = '';
  if (existingFaqs.length > 0) {
    existingFaqsText = '\n\nExisting Customer FAQs:\n';
    existingFaqs.forEach((faq, index) => {
      existingFaqsText += `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}\n\n`;
    });
  }
  
  return `${context}${existingFaqsText}

Based on the information provided about this product/service, generate 1 additional frequently asked question (FAQ) that a potential customer might have, along with a detailed answer. This should address a common concern, question, or objection that hasn't been covered in the existing FAQs.

${userComment ? `\nAdditional instructions: ${userComment}` : ''}

Format your response exactly as follows:
Q: [Question]
A: [Answer]

Make sure the answer is comprehensive and addresses the question fully.`;
};

// Generate a single stakeholder FAQ
export const getSingleStakeholderFAQPrompt = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  existingFaqs: FAQ[] = [],
  userComment?: string
): string => {
  const context = formatPRFAQContext(responses, currentPRFAQ, userComment);
  
  // Format existing FAQs
  let existingFaqsText = '';
  if (existingFaqs.length > 0) {
    existingFaqsText = '\n\nExisting Stakeholder FAQs:\n';
    existingFaqs.forEach((faq, index) => {
      existingFaqsText += `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}\n\n`;
    });
  }
  
  return `${context}${existingFaqsText}

Based on the information provided about this product/service, generate 1 additional frequently asked question (FAQ) that an internal stakeholder (investor, executive, team member) might have, along with a detailed answer. This should address a strategic concern, risk, or implementation detail that hasn't been covered in the existing FAQs.

${userComment ? `\nAdditional instructions: ${userComment}` : ''}

Format your response exactly as follows:
Q: [Question]
A: [Answer]

Make sure the answer is comprehensive and addresses the question fully from a business and strategic perspective.`;
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