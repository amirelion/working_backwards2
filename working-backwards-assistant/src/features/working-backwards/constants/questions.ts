import { WorkingBackwardsQuestionsState } from '../../../types/WorkingBackwardsQuestionsState';

// Define the type for working backwards questions
export interface WorkingBackwardsQuestion {
  id: keyof Omit<WorkingBackwardsQuestionsState, 'aiSuggestions'>;
  label: string;
  placeholder: string;
  helperText: string;
  promptKey: string;
}

// List of working backwards questions
export const questionsList: WorkingBackwardsQuestion[] = [
  {
    id: 'customer',
    label: 'Who is the customer?',
    placeholder: 'Describe your target customer in detail...',
    helperText: 'Be specific about who will use and benefit from your solution.',
    promptKey: 'questionPrompts.customer'
  },
  {
    id: 'problem',
    label: 'What is the customer problem or opportunity?',
    placeholder: 'Describe the problem your solution addresses...',
    helperText: 'What pain point or unmet need does your solution address?',
    promptKey: 'questionPrompts.problem'
  },
  {
    id: 'benefit',
    label: 'What is the most important customer benefit?',
    placeholder: 'Describe the primary benefit to the customer...',
    helperText: 'What is the single most compelling benefit your solution provides?',
    promptKey: 'questionPrompts.benefit'
  },
  {
    id: 'validation',
    label: 'How do you know what customers need or want?',
    placeholder: 'Describe your customer research or validation...',
    helperText: 'What evidence do you have that customers want this solution?',
    promptKey: 'questionPrompts.validation'
  },
  {
    id: 'experience',
    label: 'What does the customer experience look like?',
    placeholder: 'Describe the customer journey and experience...',
    helperText: 'Walk through the customer experience from start to finish.',
    promptKey: 'questionPrompts.experience'
  }
]; 