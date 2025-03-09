import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkingBackwardsProcess, WorkingBackwardsProcessSummary } from '../types/workingBackwards';

// Define the state structure for process management
interface ProcessManagementState {
  // Process List State
  processes: WorkingBackwardsProcessSummary[];
  loadingProcesses: boolean;
  processListError: string | null;
  
  // Current Process State
  currentProcessId: string | null;
  currentProcess: WorkingBackwardsProcess | null;
  isSaving: boolean;
  lastSaved: string | null; // ISO string for serialization
  currentProcessError: string | null;
  isModified: boolean;
}

// Define the initial state
const initialState: ProcessManagementState = {
  // Process List State
  processes: [],
  loadingProcesses: false,
  processListError: null,
  
  // Current Process State
  currentProcessId: null,
  currentProcess: null,
  isSaving: false,
  lastSaved: null,
  currentProcessError: null,
  isModified: false
};

// Create the slice
export const processManagementSlice = createSlice({
  name: 'processManagement',
  initialState,
  reducers: {
    // Process List Actions
    setProcesses: (state, action: PayloadAction<WorkingBackwardsProcessSummary[]>) => {
      state.processes = action.payload;
      state.loadingProcesses = false;
    },
    setLoadingProcesses: (state, action: PayloadAction<boolean>) => {
      state.loadingProcesses = action.payload;
    },
    setProcessListError: (state, action: PayloadAction<string | null>) => {
      state.processListError = action.payload;
      state.loadingProcesses = false;
    },
    
    // Current Process Actions
    setCurrentProcessId: (state, action: PayloadAction<string | null>) => {
      state.currentProcessId = action.payload;
      // Reset current process data when changing ID
      if (action.payload === null || action.payload !== state.currentProcessId) {
        state.currentProcess = null;
      }
    },
    setCurrentProcess: (state, action: PayloadAction<WorkingBackwardsProcess | null>) => {
      state.currentProcess = action.payload;
      if (action.payload) {
        state.currentProcessId = action.payload.id;
        state.lastSaved = action.payload.updatedAt.toISOString();
        state.isModified = false;
      }
    },
    setIsSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },
    setLastSaved: (state, action: PayloadAction<Date>) => {
      state.lastSaved = action.payload.toISOString();
    },
    setCurrentProcessError: (state, action: PayloadAction<string | null>) => {
      state.currentProcessError = action.payload;
      state.isSaving = false;
    },
    setIsModified: (state, action: PayloadAction<boolean>) => {
      state.isModified = action.payload;
    }
  }
});

// Export actions
export const {
  // Process List Actions  
  setProcesses,
  setLoadingProcesses,
  setProcessListError,
  
  // Current Process Actions
  setCurrentProcessId,
  setCurrentProcess,
  setIsSaving,
  setLastSaved,
  setCurrentProcessError,
  setIsModified
} = processManagementSlice.actions;

// Export selectors
export const selectProcesses = (state: any) => state.processManagement.processes;
export const selectLoadingProcesses = (state: any) => state.processManagement.loadingProcesses;
export const selectProcessListError = (state: any) => state.processManagement.processListError;

export const selectCurrentProcessId = (state: any) => state.processManagement.currentProcessId;
export const selectCurrentProcess = (state: any) => state.processManagement.currentProcess;
export const selectIsSaving = (state: any) => state.processManagement.isSaving;
export const selectLastSaved = (state: any) => {
  const lastSavedString = state.processManagement.lastSaved;
  return lastSavedString ? new Date(lastSavedString) : null;
};
export const selectCurrentProcessError = (state: any) => state.processManagement.currentProcessError;
export const selectIsModified = (state: any) => state.processManagement.isModified;

// Export the reducer
export default processManagementSlice.reducer; 