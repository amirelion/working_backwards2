import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './rootStore';

interface InitialThoughtsState {
  content: string;
  skipInitialThoughts: boolean;
}

const initialState: InitialThoughtsState = {
  content: '',
  skipInitialThoughts: false
};

export const initialThoughtsSlice = createSlice({
  name: 'initialThoughts',
  initialState,
  reducers: {
    setInitialThoughts: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
    },
    appendToInitialThoughts: (state, action: PayloadAction<string>) => {
      state.content = state.content + ' ' + action.payload;
    },
    setSkipInitialThoughts: (state, action: PayloadAction<boolean>) => {
      state.skipInitialThoughts = action.payload;
    },
    clearInitialThoughts: (state) => {
      state.content = '';
    }
  },
});

export const { 
  setInitialThoughts, 
  appendToInitialThoughts, 
  setSkipInitialThoughts,
  clearInitialThoughts
} = initialThoughtsSlice.actions;

export const selectInitialThoughts = (state: RootState) => state.initialThoughts.content;
export const selectSkipInitialThoughts = (state: RootState) => state.initialThoughts.skipInitialThoughts;

export default initialThoughtsSlice.reducer; 