import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { 
  Session, 
  WorkingBackwardsResponses, 
  PRFAQ, 
  Assumption, 
  Experiment, 
  FAQ 
} from '../../types';
import {
  SessionState,
  UpdateWorkingBackwardsResponsePayload,
  UpdatePRFAQPressReleasePayload,
  UpdateFAQPayload,
  UpdateAssumptionPayload,
  UpdateExperimentPayload
} from './types';

// Initial empty PRFAQ
const initialPRFAQ: PRFAQ = {
  title: '',
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

// Initial session 
const initialSession: Session = {
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  workingBackwardsResponses: initialWorkingBackwardsResponses,
  prfaq: initialPRFAQ,
  assumptions: [],
  experiments: [],
};

// Initial state
const initialState: SessionState = {
  currentSession: initialSession,
  status: 'idle',
  error: null
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Reset the current session to initial state
    resetSession: (state) => {
      state.currentSession = {
        ...initialSession,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.status = 'idle';
      state.error = null;
    },
    
    // Reset just the assumptions array
    resetAssumptions: (state) => {
      state.currentSession.assumptions = [];
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Reset just the experiments array
    resetExperiments: (state) => {
      state.currentSession.experiments = [];
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Update Working Backwards responses
    updateWorkingBackwardsResponse: (
      state,
      action: PayloadAction<UpdateWorkingBackwardsResponsePayload>
    ) => {
      const { field, value } = action.payload;
      state.currentSession.workingBackwardsResponses[field] = value;
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Update PRFAQ title
    updatePRFAQTitle: (state, action: PayloadAction<string>) => {
      state.currentSession.prfaq.title = action.payload;
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Update PRFAQ press release section
    updatePRFAQPressRelease: (
      state,
      action: PayloadAction<UpdatePRFAQPressReleasePayload>
    ) => {
      const { field, value } = action.payload;
      state.currentSession.prfaq.pressRelease[field] = value;
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Add FAQ
    addFAQ: (state, action: PayloadAction<FAQ>) => {
      state.currentSession.prfaq.faq.push(action.payload);
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Update FAQ
    updateFAQ: (
      state,
      action: PayloadAction<UpdateFAQPayload>
    ) => {
      const { index, question, answer } = action.payload;
      if (question !== undefined) {
        state.currentSession.prfaq.faq[index].question = question;
      }
      if (answer !== undefined) {
        state.currentSession.prfaq.faq[index].answer = answer;
      }
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Remove FAQ
    removeFAQ: (state, action: PayloadAction<number>) => {
      state.currentSession.prfaq.faq.splice(action.payload, 1);
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Add Assumption
    addAssumption: (state, action: PayloadAction<Omit<Assumption, 'id'> | Assumption>) => {
      // Check if the payload already has an ID
      const payload = 'id' in action.payload 
        ? action.payload 
        : {
            ...action.payload,
            id: uuidv4(),
            description: action.payload.description || '',
            category: action.payload.category || 'customer',
            relatedExperiments: action.payload.relatedExperiments || [],
            status: action.payload.status || 'unvalidated'
          };
          
      console.log('[sessionSlice] Adding assumption:', {
        id: payload.id,
        statement: payload.statement.substring(0, 30) + (payload.statement.length > 30 ? '...' : ''),
        category: payload.category,
        status: payload.status
      });
          
      state.currentSession.assumptions.push(payload);
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Update Assumption
    updateAssumption: (
      state,
      action: PayloadAction<UpdateAssumptionPayload>
    ) => {
      const { id, updates } = action.payload;
      const index = state.currentSession.assumptions.findIndex(a => a.id === id);
      if (index !== -1) {
        console.log('[sessionSlice] Updating assumption:', { 
          id,
          updates: Object.keys(updates).join(', '),
          beforeStatus: state.currentSession.assumptions[index].status,
          afterStatus: updates.status || state.currentSession.assumptions[index].status
        });
        
        state.currentSession.assumptions[index] = {
          ...state.currentSession.assumptions[index],
          ...updates,
          // Handle new fields explicitly
          description: updates.description !== undefined 
            ? updates.description 
            : state.currentSession.assumptions[index].description || '',
          category: updates.category !== undefined
            ? updates.category
            : state.currentSession.assumptions[index].category || 'customer',
          relatedExperiments: updates.relatedExperiments !== undefined
            ? updates.relatedExperiments
            : state.currentSession.assumptions[index].relatedExperiments || [],
          status: updates.status !== undefined
            ? updates.status
            : state.currentSession.assumptions[index].status || 'unvalidated'
        };
        state.currentSession.updatedAt = new Date().toISOString();
      } else {
        console.warn('[sessionSlice] Attempted to update assumption that does not exist:', id);
      }
    },
    
    // Remove Assumption
    removeAssumption: (state, action: PayloadAction<string>) => {
      console.log('[sessionSlice] Removing assumption:', action.payload);
      state.currentSession.assumptions = state.currentSession.assumptions.filter(
        a => a.id !== action.payload
      );
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Add Experiment
    addExperiment: (state, action: PayloadAction<Omit<Experiment, 'id'> | Experiment>) => {
      // Check if the payload already has an ID
      const payload = 'id' in action.payload 
        ? action.payload 
        : {
            ...action.payload,
            id: uuidv4(),
          };
          
      state.currentSession.experiments.push(payload);
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Update Experiment
    updateExperiment: (
      state,
      action: PayloadAction<UpdateExperimentPayload>
    ) => {
      const { id, updates } = action.payload;
      const index = state.currentSession.experiments.findIndex(e => e.id === id);
      if (index !== -1) {
        state.currentSession.experiments[index] = {
          ...state.currentSession.experiments[index],
          ...updates
        };
        state.currentSession.updatedAt = new Date().toISOString();
      }
    },
    
    // Remove Experiment
    removeExperiment: (state, action: PayloadAction<string>) => {
      state.currentSession.experiments = state.currentSession.experiments.filter(
        e => e.id !== action.payload
      );
      state.currentSession.updatedAt = new Date().toISOString();
    },
    
    // Set loading state
    setLoading: (state) => {
      state.status = 'loading';
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    }
  }
});

// Export actions
export const {
  resetSession,
  resetAssumptions,
  resetExperiments,
  updateWorkingBackwardsResponse,
  updatePRFAQTitle,
  updatePRFAQPressRelease,
  addFAQ,
  updateFAQ,
  removeFAQ,
  addAssumption,
  updateAssumption,
  removeAssumption,
  addExperiment,
  updateExperiment,
  removeExperiment,
  setLoading,
  setError
} = sessionSlice.actions;

// Selectors
export const selectCurrentSession = (state: { session: SessionState }) => state.session.currentSession;
export const selectSessionStatus = (state: { session: SessionState }) => state.session.status;
export const selectSessionError = (state: { session: SessionState }) => state.session.error;
export const selectWorkingBackwardsResponses = (state: { session: SessionState }) => 
  state.session.currentSession.workingBackwardsResponses;
export const selectPRFAQ = (state: { session: SessionState }) => state.session.currentSession.prfaq;
export const selectAssumptions = (state: { session: SessionState }) => state.session.currentSession.assumptions;
export const selectExperiments = (state: { session: SessionState }) => state.session.currentSession.experiments;

export default sessionSlice.reducer; 