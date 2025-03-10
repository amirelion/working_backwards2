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
    aiPrompt: 'Based on the initial thoughts, who would be the target customer for this product or service? Please provide a detailed description of the customer profile, including their needs, pain points, and characteristics.'
  },
  {
    id: 'problem',
    label: 'What is the customer problem or opportunity?',
    placeholder: 'Describe the problem your solution addresses...',
    helperText: 'What pain point or unmet need does your solution address?',
    aiPrompt: 'Based on the initial thoughts and the identified customer, what specific problem or opportunity does this product or service address? Please describe the pain points, challenges, or unmet needs that exist in the market.'
  },
  {
    id: 'benefit',
    label: 'What is the most important customer benefit?',
    placeholder: 'Describe the primary benefit to the customer...',
    helperText: 'What is the single most compelling benefit your solution provides?',
    aiPrompt: 'Based on the initial thoughts, the identified customer, and the problem described, what is the most important benefit that this product or service provides to the customer? Focus on the primary value proposition that would be most compelling to the customer.'
  },
  {
    id: 'validation',
    label: 'How do you know what customers need or want?',
    placeholder: 'Describe your customer research or validation...',
    helperText: 'What evidence do you have that customers want this solution?',
    aiPrompt: 'Based on the information provided so far, how might you validate that customers actually need or want this solution? What research methods, experiments, or evidence could be gathered to confirm the customer need? If you were advising a product team, what validation approach would you recommend?'
  },
  {
    id: 'experience',
    label: 'What does the customer experience look like?',
    placeholder: 'Describe the customer journey and experience...',
    helperText: 'Walk through the customer experience from start to finish.',
    aiPrompt: 'Based on all the information provided so far, describe what the customer experience would look like when using this product or service. Walk through the customer journey from discovery to adoption and ongoing usage. What would be the key touchpoints and moments that matter in this experience?'
  }
]; 