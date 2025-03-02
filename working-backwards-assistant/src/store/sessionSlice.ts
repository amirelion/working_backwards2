import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { 
  Session, 
  WorkingBackwardsResponses, 
  PRFAQ, 
  Assumption, 
  Experiment, 
  FAQ 
} from '../types';

// Initial empty PRFAQ
const initialPRFAQ: PRFAQ = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  pressRelease: {
    summary: '',
    problem: '',
    solution: '',
    executiveQuote: '',
    customerJourney: '',
    customerQuote: '',
    gettingStarted: '',
  },
  faq: [],
  customerFaqs: [],
  stakeholderFaqs: [],
};

// Initial empty Working Backwards responses
const initialWorkingBackwardsResponses: WorkingBackwardsResponses = {
  customer: '',
  problem: '',
  benefit: '',
  validation: '',
  experience: '',
};

// Initial session state
const initialState: Session = {
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  workingBackwardsResponses: initialWorkingBackwardsResponses,
  prfaq: initialPRFAQ,
  assumptions: [],
  experiments: [],
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Update Working Backwards responses
    updateWorkingBackwardsResponse: (
      state,
      action: PayloadAction<{ field: keyof WorkingBackwardsResponses; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.workingBackwardsResponses[field] = value;
      state.updatedAt = new Date().toISOString();
    },
    
    // Update PRFAQ title
    updatePRFAQTitle: (state, action: PayloadAction<string>) => {
      state.prfaq.title = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    
    // Update PRFAQ press release section
    updatePRFAQPressRelease: (
      state,
      action: PayloadAction<{ field: keyof PRFAQ['pressRelease']; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.prfaq.pressRelease[field] = value;
      state.updatedAt = new Date().toISOString();
    },
    
    // Add FAQ
    addFAQ: (state, action: PayloadAction<FAQ>) => {
      state.prfaq.faq.push(action.payload);
      state.updatedAt = new Date().toISOString();
    },
    
    // Update FAQ
    updateFAQ: (
      state,
      action: PayloadAction<{ index: number; question?: string; answer?: string }>
    ) => {
      const { index, question, answer } = action.payload;
      if (question !== undefined) {
        state.prfaq.faq[index].question = question;
      }
      if (answer !== undefined) {
        state.prfaq.faq[index].answer = answer;
      }
      state.updatedAt = new Date().toISOString();
    },
    
    // Remove FAQ
    removeFAQ: (state, action: PayloadAction<number>) => {
      state.prfaq.faq.splice(action.payload, 1);
      state.updatedAt = new Date().toISOString();
    },
    
    // Add Customer FAQ
    addCustomerFAQ: (state, action: PayloadAction<FAQ>) => {
      state.prfaq.customerFaqs.push(action.payload);
      state.updatedAt = new Date().toISOString();
    },
    
    // Update Customer FAQ
    updateCustomerFAQ: (
      state,
      action: PayloadAction<{ index: number; question?: string; answer?: string }>
    ) => {
      const { index, question, answer } = action.payload;
      if (question !== undefined) {
        state.prfaq.customerFaqs[index].question = question;
      }
      if (answer !== undefined) {
        state.prfaq.customerFaqs[index].answer = answer;
      }
      state.updatedAt = new Date().toISOString();
    },
    
    // Remove Customer FAQ
    removeCustomerFAQ: (state, action: PayloadAction<number>) => {
      state.prfaq.customerFaqs.splice(action.payload, 1);
      state.updatedAt = new Date().toISOString();
    },
    
    // Add Stakeholder FAQ
    addStakeholderFAQ: (state, action: PayloadAction<FAQ>) => {
      state.prfaq.stakeholderFaqs.push(action.payload);
      state.updatedAt = new Date().toISOString();
    },
    
    // Update Stakeholder FAQ
    updateStakeholderFAQ: (
      state,
      action: PayloadAction<{ index: number; question?: string; answer?: string }>
    ) => {
      const { index, question, answer } = action.payload;
      if (question !== undefined) {
        state.prfaq.stakeholderFaqs[index].question = question;
      }
      if (answer !== undefined) {
        state.prfaq.stakeholderFaqs[index].answer = answer;
      }
      state.updatedAt = new Date().toISOString();
    },
    
    // Remove Stakeholder FAQ
    removeStakeholderFAQ: (state, action: PayloadAction<number>) => {
      state.prfaq.stakeholderFaqs.splice(action.payload, 1);
      state.updatedAt = new Date().toISOString();
    },
    
    // Add assumption
    addAssumption: (state, action: PayloadAction<Omit<Assumption, 'id'>>) => {
      const newAssumption = {
        ...action.payload,
        id: uuidv4(),
      };
      state.assumptions.push(newAssumption);
      state.updatedAt = new Date().toISOString();
    },
    
    // Update assumption
    updateAssumption: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<Assumption, 'id'>> }>
    ) => {
      const { id, updates } = action.payload;
      const index = state.assumptions.findIndex(a => a.id === id);
      if (index !== -1) {
        state.assumptions[index] = { ...state.assumptions[index], ...updates };
        state.updatedAt = new Date().toISOString();
      }
    },
    
    // Remove assumption
    removeAssumption: (state, action: PayloadAction<string>) => {
      state.assumptions = state.assumptions.filter(a => a.id !== action.payload);
      state.updatedAt = new Date().toISOString();
    },
    
    // Add experiment
    addExperiment: (state, action: PayloadAction<Omit<Experiment, 'id'>>) => {
      const newExperiment = {
        ...action.payload,
        id: uuidv4(),
      };
      state.experiments.push(newExperiment);
      state.updatedAt = new Date().toISOString();
    },
    
    // Update experiment
    updateExperiment: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<Experiment, 'id'>> }>
    ) => {
      const { id, updates } = action.payload;
      const index = state.experiments.findIndex(e => e.id === id);
      if (index !== -1) {
        state.experiments[index] = { ...state.experiments[index], ...updates };
        state.updatedAt = new Date().toISOString();
      }
    },
    
    // Remove experiment
    removeExperiment: (state, action: PayloadAction<string>) => {
      state.experiments = state.experiments.filter(e => e.id !== action.payload);
      state.updatedAt = new Date().toISOString();
    },
    
    // Reset session (create new)
    resetSession: () => {
      return {
        ...initialState,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    
    // Import session (for loading saved data)
    importSession: (_, action: PayloadAction<Session>) => {
      return action.payload;
    },
  },
});

export const {
  updateWorkingBackwardsResponse,
  updatePRFAQTitle,
  updatePRFAQPressRelease,
  addFAQ,
  updateFAQ,
  removeFAQ,
  addCustomerFAQ,
  updateCustomerFAQ,
  removeCustomerFAQ,
  addStakeholderFAQ,
  updateStakeholderFAQ,
  removeStakeholderFAQ,
  addAssumption,
  updateAssumption,
  removeAssumption,
  addExperiment,
  updateExperiment,
  removeExperiment,
  resetSession,
  importSession,
} = sessionSlice.actions;

export default sessionSlice.reducer; 