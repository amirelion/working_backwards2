import { WorkingBackwardsQuestionsState } from '../../../types/WorkingBackwardsQuestionsState';

// Define the type for working backwards questions
export interface WorkingBackwardsQuestion {
  id: keyof Omit<WorkingBackwardsQuestionsState, 'aiSuggestions'>;
  label: string;
  placeholder: string;
  helperText: string;
  aiPrompt: string;
}

// List of working backwards questions
export const questionsList: WorkingBackwardsQuestion[] = [
  {
    id: 'customer',
    label: 'Who is the customer?',
    placeholder: 'Describe your target customer in detail...',
    helperText: 'Be specific about who will use and benefit from your solution.',
    aiPrompt: 'Based on the initial thoughts, identify ONLY the target customer for this idea. Provide a specific, detailed description of the customer profile, including demographics, needs, pain points, and characteristics. Focus exclusively on the customer without discussing any potential solutions or products.'
  },
  {
    id: 'problem',
    label: 'What is the customer problem or opportunity?',
    placeholder: 'Describe the problem your solution addresses...',
    helperText: 'What pain point or unmet need does your solution address?',
    aiPrompt: 'Based on the initial thoughts and the identified customer, define ONLY the specific problem or opportunity that exists. Focus exclusively on describing the pain points, challenges, or unmet needs that exist in the market. Do NOT discuss or mention any product, service, or solution - concentrate solely on articulating the problem itself in clear, specific terms.'
  },
  {
    id: 'benefit',
    label: 'What is the most important customer benefit?',
    placeholder: 'Describe the primary benefit to the customer...',
    helperText: 'What is the single most compelling benefit your solution provides?',
    aiPrompt: 'Based on the initial thoughts, the identified customer, and the problem described, identify ONLY the single most important benefit that would address this problem. Focus exclusively on the primary value that would be most compelling to the customer. Do NOT describe implementation details or features - articulate only the core benefit in terms of customer outcomes.'
  },
  {
    id: 'validation',
    label: 'How do you know what customers need or want?',
    placeholder: 'Describe your customer research or validation...',
    helperText: 'What evidence do you have that customers want this solution?',
    aiPrompt: 'Based on the customer, problem, and benefit identified, suggest ONLY concrete methods to validate that this problem truly exists and that customers value the proposed benefit. Describe specific, actionable research methods, experiments, or evidence-gathering approaches that would confirm the customer need. Focus exclusively on validation techniques without suggesting product features or implementation details. Also include examples of what would be good evidence or data that vlidate the problem or missed opportunity, and what\'s most important to the customer.'
  },
  {
    id: 'experience',
    label: 'What does the customer experience look like?',
    placeholder: 'Describe the customer journey and experience...',
    helperText: 'Walk through the customer experience from start to finish.',
    aiPrompt: 'Based on the customer, problem, benefit, and validation methods identified, describe ONLY what the ideal customer experience would look like. Walk through the customer journey from discovery to adoption and ongoing usage, focusing exclusively on the experience from the customer\'s perspective. Highlight the key touchpoints and moments that would matter most to the customer. Focus on outcomes and emotional responses rather than specific product features or implementation details. If there is no data in the initial thoughts about the solution, come up with a possible solution but mention that it is a suggested solution and not one that was included in the description of the initial thoughts.'
  }
]; 