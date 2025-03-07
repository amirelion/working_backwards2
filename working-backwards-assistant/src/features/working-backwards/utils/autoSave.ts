import { debounce } from 'lodash';
import { WorkingBackwardsProcess } from '../../../types/workingBackwards';
import * as processService from '../services/processService';

/**
 * Create a debounced auto-save function
 * @param processId - The ID of the process to auto-save
 * @param getData - Function that returns the data to save
 * @param onSaveStart - Callback when save starts
 * @param onSaveComplete - Callback when save completes
 * @param onSaveError - Callback when save fails
 * @param debounceTimeMs - Debounce time in milliseconds (default: 5000ms)
 * @returns A debounced function that can be called to trigger auto-save
 */
export const createAutoSaveFunction = (
  processId: string | null,
  getData: () => Partial<WorkingBackwardsProcess>,
  onSaveStart: () => void,
  onSaveComplete: (timestamp: Date) => void,
  onSaveError: (error: Error) => void,
  debounceTimeMs = 5000
) => {
  const saveFunction = async () => {
    if (!processId) return;
    
    try {
      onSaveStart();
      const processData = getData();
      await processService.updateProcess(processId, processData);
      onSaveComplete(new Date());
    } catch (error) {
      console.error('Error auto-saving process:', error);
      onSaveError(error as Error);
    }
  };
  
  return debounce(saveFunction, debounceTimeMs);
};

/**
 * Hook to set up automatic saving on a timer
 * @param shouldSave - Whether auto-save should be active
 * @param saveFunction - The auto-save function to call
 * @param intervalMs - Interval in milliseconds (default: 30000ms)
 * @returns A cleanup function
 */
export const setupAutoSaveInterval = (
  shouldSave: boolean,
  saveFunction: () => void,
  intervalMs = 30000
) => {
  if (!shouldSave) return () => {};
  
  const intervalId = setInterval(saveFunction, intervalMs);
  return () => clearInterval(intervalId);
}; 