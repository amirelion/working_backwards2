import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// FAQ type
export interface FAQ {
  question: string;
  answer: string;
}

// PRFAQ State interface
export interface PRFAQState {
  title: string;
  pressRelease: {
    date: string;
    location: string;
    headline: string;
    subheadline: string;
    introduction: string;
    problemStatement: string;
    solution: string;
    customerQuote: string;
    stakeholderQuote: string;
    callToAction: string;
    aboutCompany: string;
  };
  faqs: FAQ[];
  customerFaqs: FAQ[];
  stakeholderFaqs: FAQ[];
}

// Initial state
const initialState: PRFAQState = {
  title: '',
  pressRelease: {
    date: new Date().toISOString().split('T')[0],
    location: 'SEATTLE',
    headline: '',
    subheadline: '',
    introduction: '',
    problemStatement: '',
    solution: '',
    customerQuote: '',
    stakeholderQuote: '',
    callToAction: '',
    aboutCompany: 'Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.',
  },
  faqs: [],
  customerFaqs: [],
  stakeholderFaqs: [],
};

// Create slice
export const prfaqSlice = createSlice({
  name: 'prfaq',
  initialState,
  reducers: {
    // Reset state
    resetPRFAQ: (state) => {
      return initialState;
    },
    
    // Update title
    updatePRFAQTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    
    // Update press release field
    updatePRFAQPressRelease: (
      state,
      action: PayloadAction<{ field: keyof PRFAQState['pressRelease']; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.pressRelease[field] = value;
    },
    
    // FAQ actions
    addFAQ: (state, action: PayloadAction<FAQ>) => {
      state.faqs.push(action.payload);
    },
    
    updateFAQ: (
      state,
      action: PayloadAction<{ index: number; question?: string; answer?: string }>
    ) => {
      const { index, question, answer } = action.payload;
      if (question !== undefined) {
        state.faqs[index].question = question;
      }
      if (answer !== undefined) {
        state.faqs[index].answer = answer;
      }
    },
    
    removeFAQ: (state, action: PayloadAction<number>) => {
      state.faqs.splice(action.payload, 1);
    },
    
    setFAQs: (state, action: PayloadAction<FAQ[]>) => {
      state.faqs = action.payload;
    },
    
    // Customer FAQ actions
    addCustomerFAQ: (state, action: PayloadAction<FAQ>) => {
      state.customerFaqs.push(action.payload);
    },
    
    updateCustomerFAQ: (
      state,
      action: PayloadAction<{ index: number; question?: string; answer?: string }>
    ) => {
      const { index, question, answer } = action.payload;
      if (question !== undefined) {
        state.customerFaqs[index].question = question;
      }
      if (answer !== undefined) {
        state.customerFaqs[index].answer = answer;
      }
    },
    
    removeCustomerFAQ: (state, action: PayloadAction<number>) => {
      state.customerFaqs.splice(action.payload, 1);
    },
    
    setCustomerFAQs: (state, action: PayloadAction<FAQ[]>) => {
      state.customerFaqs = action.payload;
    },
    
    // Stakeholder FAQ actions
    addStakeholderFAQ: (state, action: PayloadAction<FAQ>) => {
      state.stakeholderFaqs.push(action.payload);
    },
    
    updateStakeholderFAQ: (
      state,
      action: PayloadAction<{ index: number; question?: string; answer?: string }>
    ) => {
      const { index, question, answer } = action.payload;
      if (question !== undefined) {
        state.stakeholderFaqs[index].question = question;
      }
      if (answer !== undefined) {
        state.stakeholderFaqs[index].answer = answer;
      }
    },
    
    removeStakeholderFAQ: (state, action: PayloadAction<number>) => {
      state.stakeholderFaqs.splice(action.payload, 1);
    },
    
    setStakeholderFAQs: (state, action: PayloadAction<FAQ[]>) => {
      state.stakeholderFaqs = action.payload;
    },
  },
});

// Export actions
export const {
  resetPRFAQ,
  updatePRFAQTitle,
  updatePRFAQPressRelease,
  addFAQ,
  updateFAQ,
  removeFAQ,
  setFAQs,
  addCustomerFAQ,
  updateCustomerFAQ,
  removeCustomerFAQ,
  setCustomerFAQs,
  addStakeholderFAQ,
  updateStakeholderFAQ,
  removeStakeholderFAQ,
  setStakeholderFAQs,
} = prfaqSlice.actions;

// Export reducer
export default prfaqSlice.reducer; 