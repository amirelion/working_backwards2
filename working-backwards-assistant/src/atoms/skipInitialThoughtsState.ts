import { atom } from 'recoil';

/**
 * Recoil state to track if the user skipped entering initial thoughts
 * This helps determine whether to auto-generate AI suggestions
 */
export const skipInitialThoughtsState = atom<boolean>({
  key: 'skipInitialThoughtsState',
  default: false,
}); 