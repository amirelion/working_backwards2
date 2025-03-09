import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  selectProcesses,
  selectLoadingProcesses,
  selectProcessListError,
  setProcesses,
  setLoadingProcesses,
  setProcessListError
} from '../store/processManagementSlice';
import * as processService from '../services/workingBackwardsService';
import { useAuth } from './useAuth';

/**
 * Custom hook providing process list operations from Redux
 * This is a drop-in replacement for the context-based useProcessList hook
 */
export const useProcessList = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAuth();
  
  // Get process list state from Redux
  const processes = useAppSelector(selectProcesses);
  const loading = useAppSelector(selectLoadingProcesses);
  const error = useAppSelector(selectProcessListError);

  /**
   * Refresh the list of processes
   */
  const refreshProcesses = useCallback(() => {
    if (!currentUser) {
      dispatch(setProcesses([]));
      dispatch(setLoadingProcesses(false));
      return;
    }

    dispatch(setLoadingProcesses(true));
    dispatch(setProcessListError(null));
  }, [currentUser, dispatch]);

  /**
   * Delete a process by ID
   */
  const deleteProcess = useCallback(async (processId: string): Promise<void> => {
    try {
      await processService.deleteProcess(processId);
      // No need to update state as Firebase subscription will handle it
    } catch (error) {
      console.error('Error deleting process:', error);
      dispatch(setProcessListError('Failed to delete process'));
      throw error;
    }
  }, [dispatch]);

  /**
   * Create a new process
   */
  const createNewProcess = useCallback(async (title: string): Promise<string> => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a process');
    }
    
    try {
      // Create the process with empty initial thoughts
      const processId = await processService.createProcess(
        currentUser.uid, 
        title,
        '' // Initial thoughts
      );
      
      return processId;
    } catch (error) {
      console.error('Error creating new process:', error);
      dispatch(setProcessListError('Failed to create new process'));
      throw error;
    }
  }, [currentUser, dispatch]);

  return {
    processes,
    loading,
    error,
    refreshProcesses,
    deleteProcess,
    createNewProcess
  };
}; 