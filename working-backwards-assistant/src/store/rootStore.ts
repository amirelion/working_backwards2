import { configureStore } from '@reduxjs/toolkit';
import prfaqReducer from './prfaqSlice';
import sessionReducer from '../features/session/sessionSlice';
import initialThoughtsReducer from './initialThoughtsSlice';
import workingBackwardsReducer from './workingBackwardsSlice';
import processManagementReducer from './processManagementSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    prfaq: prfaqReducer,
    initialThoughts: initialThoughtsReducer,
    workingBackwards: workingBackwardsReducer,
    processManagement: processManagementReducer,
    // We'll add more reducers incrementally
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore certain action types that might have non-serializable payloads
        ignoredActions: [
          'processManagement/setProcesses', 
          'processManagement/setCurrentProcess',
          'processManagement/setLastSaved'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'processManagement.processes',
          'processManagement.currentProcess',
          'processManagement.lastSaved'
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 