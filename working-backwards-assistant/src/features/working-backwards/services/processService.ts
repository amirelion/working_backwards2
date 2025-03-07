import * as workingBackwardsService from '../../../services/workingBackwardsService';
import { WorkingBackwardsProcess, WorkingBackwardsProcessSummary } from '../../../types/workingBackwards';

/**
 * Subscribe to a user's working backwards processes
 */
export const subscribeToUserProcesses = (
  userId: string,
  onSuccess: (processes: WorkingBackwardsProcessSummary[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  return workingBackwardsService.subscribeToUserProcesses(userId, onSuccess, onError);
};

/**
 * Subscribe to a specific process
 */
export const subscribeToProcess = (
  processId: string,
  onSuccess: (process: WorkingBackwardsProcess | null) => void,
  onError: (error: Error) => void
): (() => void) => {
  return workingBackwardsService.subscribeToProcess(processId, onSuccess, onError);
};

/**
 * Create a new process
 */
export const createProcess = async (
  userId: string,
  title: string,
  initialThoughts: string
): Promise<string> => {
  return workingBackwardsService.createProcess(userId, title, initialThoughts);
};

/**
 * Get a process by ID
 */
export const getProcessById = async (
  processId: string
): Promise<WorkingBackwardsProcess | null> => {
  return workingBackwardsService.getProcessById(processId);
};

/**
 * Update a process
 */
export const updateProcess = async (
  processId: string,
  data: Partial<WorkingBackwardsProcess>
): Promise<void> => {
  return workingBackwardsService.updateProcess(processId, data);
};

/**
 * Delete a process
 */
export const deleteProcess = async (
  processId: string
): Promise<void> => {
  return workingBackwardsService.deleteProcess(processId);
}; 