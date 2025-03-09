import { configureStore } from '@reduxjs/toolkit';
import prfaqReducer from './prfaqSlice';
import sessionReducer from '../features/session/sessionSlice';
import initialThoughtsReducer from './initialThoughtsSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    prfaq: prfaqReducer,
    initialThoughts: initialThoughtsReducer,
    // We'll add more reducers incrementally
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredPaths: [],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 