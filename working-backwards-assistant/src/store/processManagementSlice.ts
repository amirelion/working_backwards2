import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkingBackwardsProcess } from '../types/workingBackwards';

// Define serializable versions of the types with string dates
interface SerializableProcessSummary {
  id: string;
  title: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Omit the Date properties from WorkingBackwardsProcess and add them back as strings
type SerializableProcess = Omit<WorkingBackwardsProcess, 'createdAt' | 'updatedAt'> & {
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

// Define the state structure for process management
interface ProcessManagementState {
  // Process List State
  processes: SerializableProcessSummary[];
  loadingProcesses: boolean;
  processListError: string | null;
  
  // Current Process State
  currentProcessId: string | null;
  currentProcess: SerializableProcess | null;
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
    setProcesses: (state, action: PayloadAction<SerializableProcessSummary[]>) => {
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
    setCurrentProcess: (state, action: PayloadAction<SerializableProcess | null>) => {
      state.currentProcess = action.payload;
      if (action.payload) {
        state.currentProcessId = action.payload.id;
        state.lastSaved = action.payload.updatedAt;
        state.isModified = false;
      }
    },
    setIsSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },
    setLastSaved: (state, action: PayloadAction<string>) => {
      state.lastSaved = action.payload;
    },
    setCurrentProcessError: (state, action: PayloadAction<string | null>) => {
      state.currentProcessError = action.payload;
      state.isSaving = false;
    },
    setIsModified: (state, action: PayloadAction<boolean>) => {
      state.isModified = action.payload;
    },
    
    // Add a clear current process action
    clearCurrentProcess: (state) => {
      state.currentProcessId = null;
      state.currentProcess = null;
      state.isSaving = false;
      state.lastSaved = null;
      state.currentProcessError = null;
      state.isModified = false;
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
  setIsModified,
  
  // Add a clear current process action
  clearCurrentProcess
} = processManagementSlice.actions;

// Export selectors
export const selectProcesses = (state: { processManagement: ProcessManagementState }) => {
  // Convert ISO date strings back to Date objects when retrieving from the store
  return state.processManagement.processes.map((process: SerializableProcessSummary) => ({
    ...process,
    createdAt: process.createdAt ? new Date(process.createdAt) : null,
    updatedAt: process.updatedAt ? new Date(process.updatedAt) : null
  }));
};
export const selectLoadingProcesses = (state: { processManagement: ProcessManagementState }) => 
  state.processManagement.loadingProcesses;
export const selectProcessListError = (state: { processManagement: ProcessManagementState }) => 
  state.processManagement.processListError;

export const selectCurrentProcessId = (state: { processManagement: ProcessManagementState }) => 
  state.processManagement.currentProcessId;
export const selectCurrentProcess = (state: { processManagement: ProcessManagementState }) => {
  const process = state.processManagement.currentProcess;
  // Convert ISO date strings back to Date objects when retrieving from the store
  if (process) {
    return {
      ...process,
      createdAt: process.createdAt ? new Date(process.createdAt) : null,
      updatedAt: process.updatedAt ? new Date(process.updatedAt) : null
    };
  }
  return null;
};
export const selectIsSaving = (state: { processManagement: ProcessManagementState }) => 
  state.processManagement.isSaving;
export const selectLastSaved = (state: { processManagement: ProcessManagementState }) => {
  const lastSavedString = state.processManagement.lastSaved;
  return lastSavedString ? new Date(lastSavedString) : null;
};
export const selectCurrentProcessError = (state: { processManagement: ProcessManagementState }) => 
  state.processManagement.currentProcessError;
export const selectIsModified = (state: { processManagement: ProcessManagementState }) => 
  state.processManagement.isModified;

// Export the reducer
export default processManagementSlice.reducer; 