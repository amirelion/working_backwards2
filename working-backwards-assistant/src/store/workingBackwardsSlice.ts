import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

// Define the state structure for this slice
interface WorkingBackwardsState {
  questions: WorkingBackwardsQuestionsState;
  showSummary: boolean;
  currentStep: number;
}

// Define the initial state
const initialState: WorkingBackwardsState = {
  questions: {
    customer: '',
    problem: '',
    benefit: '',
    validation: '',
    experience: '',
    aiSuggestions: {}
  },
  showSummary: false,
  currentStep: 0
};

// Create the slice
export const workingBackwardsSlice = createSlice({
  name: 'workingBackwards',
  initialState,
  reducers: {
    // Update a single question field
    updateQuestionField: (state, action: PayloadAction<{ field: keyof Omit<WorkingBackwardsQuestionsState, 'aiSuggestions'>; value: string }>) => {
      const { field, value } = action.payload;
      state.questions[field] = value;
    },
    
    // Add an AI suggestion for a specific question
    addAISuggestion: (state, action: PayloadAction<{ question: string; suggestion: string }>) => {
      const { question, suggestion } = action.payload;
      state.questions.aiSuggestions[question] = suggestion;
    },
    
    // Set all AI suggestions at once
    setAISuggestions: (state, action: PayloadAction<WorkingBackwardsSuggestions>) => {
      state.questions.aiSuggestions = action.payload;
    },
    
    // Set the showSummary flag
    setShowSummary: (state, action: PayloadAction<boolean>) => {
      state.showSummary = action.payload;
    },
    
    // Set the current step
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    
    // Set all questions data at once (useful for loading from storage)
    setQuestionsData: (state, action: PayloadAction<WorkingBackwardsQuestionsState>) => {
      state.questions = action.payload;
    }
  }
});

// Export actions
export const { 
  updateQuestionField, 
  addAISuggestion, 
  setAISuggestions, 
  setShowSummary, 
  setCurrentStep,
  setQuestionsData
} = workingBackwardsSlice.actions;

// Export selectors
export const selectQuestions = (state: any) => state.workingBackwards.questions;
export const selectShowSummary = (state: any) => state.workingBackwards.showSummary;
export const selectCurrentStep = (state: any) => state.workingBackwards.currentStep;
export const selectCustomer = (state: any) => state.workingBackwards.questions.customer;
export const selectProblem = (state: any) => state.workingBackwards.questions.problem;
export const selectBenefit = (state: any) => state.workingBackwards.questions.benefit;
export const selectValidation = (state: any) => state.workingBackwards.questions.validation;
export const selectExperience = (state: any) => state.workingBackwards.questions.experience;
export const selectAISuggestions = (state: any) => state.workingBackwards.questions.aiSuggestions;

// Export the reducer
export default workingBackwardsSlice.reducer; 