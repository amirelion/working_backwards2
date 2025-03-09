import { clearInitialThoughts } from './initialThoughtsSlice';
import { resetWorkingBackwards } from './workingBackwardsSlice';
import { resetPrfaq } from './prfaqSlice';
import { clearCurrentProcess } from './processManagementSlice';
import { AppDispatch } from './rootStore';

/**
 * Reset all process-related state when starting or loading a new process
 * This ensures we don't have any lingering data from previous processes
 * 
 * @param dispatch - Redux dispatch function
 */
export const resetProcessState = (dispatch: AppDispatch) => {
  dispatch(clearInitialThoughts());
  dispatch(resetWorkingBackwards());
  dispatch(resetPrfaq());
  dispatch(clearCurrentProcess());
}; 