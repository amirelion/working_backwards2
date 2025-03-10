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
  aiSuggestions: WorkingBackwardsSuggestions;
} 