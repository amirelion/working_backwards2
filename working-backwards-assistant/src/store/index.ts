// This file re-exports from rootStore.ts for backward compatibility
import { store } from './rootStore';
import type { RootState, AppDispatch } from './rootStore';

export { store };
export type { RootState, AppDispatch }; 