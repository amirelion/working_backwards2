import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './sessionSlice';
import prfaqReducer from './prfaqSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    prfaq: prfaqReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 