import { configureStore } from '@reduxjs/toolkit';
import prfaqReducer from './prfaqSlice';
import sessionReducer from '../features/session/sessionSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    prfaq: prfaqReducer,
  },
  // Add middleware for Redux DevTools and development experience
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these non-serializable paths (if any)
        ignoredActions: [],
        ignoredPaths: [],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 