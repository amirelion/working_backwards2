import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import sessionReducer, { 
  resetSession,
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
} from '../features/session/sessionSlice';
import { 
  Session
} from '../types';
import { RootState } from './index';

// Re-export the reducer from the feature path
export default sessionReducer;

// Re-export all the action creators for backward compatibility
export {
  resetSession,
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
};

// These selectors are to maintain backward compatibility
export const selectCurrentSession = (state: RootState) => state.session.currentSession;
export const selectSessionStatus = (state: RootState) => state.session.status;
export const selectSessionError = (state: RootState) => state.session.error;
export const selectWorkingBackwardsResponses = (state: RootState) => 
  state.session.currentSession.workingBackwardsResponses;
export const selectPRFAQ = (state: RootState) => state.session.currentSession.prfaq;
export const selectAssumptions = (state: RootState) => state.session.currentSession.assumptions;
export const selectExperiments = (state: RootState) => state.session.currentSession.experiments; 