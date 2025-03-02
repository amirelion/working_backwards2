import { atom } from 'recoil';

// Define the type for AI suggestions
export interface WorkingBackwardsSuggestions {
  [key: string]: string;
}

// Define the type for working backwards questions state
export interface WorkingBackwardsQuestionsState {
  customer: string;
  problem: string;
  benefit: string;
  validation: string;
  experience: string;
  aiSuggestions?: WorkingBackwardsSuggestions;
}

// Initial state
const initialState: WorkingBackwardsQuestionsState = {
  customer: '',
  problem: '',
  benefit: '',
  validation: '',
  experience: '',
  aiSuggestions: {}
};

export const workingBackwardsQuestionsState = atom<WorkingBackwardsQuestionsState>({
  key: 'workingBackwardsQuestionsState',
  default: initialState
}); 