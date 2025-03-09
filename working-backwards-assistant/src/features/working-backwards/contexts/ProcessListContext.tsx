import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { WorkingBackwardsProcessSummary } from '../../../types/workingBackwards';
import * as processService from '../services/processService';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  selectProcesses, 
  selectLoadingProcesses, 
  selectProcessListError,
  setProcesses,
  setLoadingProcesses,
  setProcessListError
} from '../../../store/processManagementSlice';

interface ProcessListContextType {
  processes: WorkingBackwardsProcessSummary[];
  loading: boolean;
  error: string | null;
  refreshProcesses: () => void;
  deleteProcess: (processId: string) => Promise<void>;
  createNewProcess: (title: string) => Promise<string>;
}

const ProcessListContext = createContext<ProcessListContextType | null>(null);

/**
 * Custom hook to use the process list context
 */
export const useProcessList = (): ProcessListContextType => {
  const context = useContext(ProcessListContext);
  if (!context) {
    throw new Error('useProcessList must be used within a ProcessListProvider');
  }
  return context;
};

/**
 * Provider component for managing the list of working backwards processes
 */
export const ProcessListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const appDispatch = useAppDispatch();
  
  // Keep using local state during transition
  const [processes, setProcessesState] = useState<WorkingBackwardsProcessSummary[]>([]);
  const [loading, setLoadingState] = useState<boolean>(true);
  const [error, setErrorState] = useState<string | null>(null);
  
  // Get state from Redux
  // These variables will be used after the migration is complete
  const reduxProcesses = useAppSelector(selectProcesses);
  const reduxLoading = useAppSelector(selectLoadingProcesses);
  const reduxError = useAppSelector(selectProcessListError);

  /**
   * Refresh the list of processes
   */
  const refreshProcesses = () => {
    if (!currentUser) {
      setProcessesState([]);
      setLoadingState(false);
      appDispatch(setProcesses([]));
      appDispatch(setLoadingProcesses(false));
      return;
    }

    setLoadingState(true);
    setErrorState(null);
    appDispatch(setLoadingProcesses(true));
    appDispatch(setProcessListError(null));
  };

  /**
   * Delete a process by ID
   */
  const deleteProcess = async (processId: string): Promise<void> => {
    try {
      await processService.deleteProcess(processId);
      // No need to update state as the subscription will handle it
    } catch (error) {
      console.error('Error deleting process:', error);
      setErrorState('Failed to delete process');
      appDispatch(setProcessListError('Failed to delete process'));
      throw error;
    }
  };

  /**
   * Create a new process
   */
  const createNewProcess = async (title: string): Promise<string> => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a process');
    }
    
    try {
      // Create the process with empty initial thoughts
      const processId = await processService.createProcess(
        currentUser.uid, 
        title,
        '' // Start with empty initial thoughts
      );
      
      return processId;
    } catch (error) {
      console.error('Error creating process:', error);
      setErrorState('Failed to create new process');
      appDispatch(setProcessListError('Failed to create new process'));
      throw error;
    }
  };

  /**
   * Subscribe to the user's processes
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (currentUser) {
      setLoadingState(true);
      appDispatch(setLoadingProcesses(true));
      
      unsubscribe = processService.subscribeToUserProcesses(
        currentUser.uid,
        (updatedProcesses) => {
          setProcessesState(updatedProcesses);
          setLoadingState(false);
          // Also update Redux state
          appDispatch(setProcesses(updatedProcesses));
          appDispatch(setLoadingProcesses(false));
        },
        (error) => {
          console.error('Error in processes subscription:', error);
          const errorMessage = 'Failed to load your Working Backwards processes';
          setErrorState(errorMessage);
          setLoadingState(false);
          // Also update Redux state
          appDispatch(setProcessListError(errorMessage));
          appDispatch(setLoadingProcesses(false));
        }
      );
    } else {
      setProcessesState([]);
      setLoadingState(false);
      // Also update Redux state
      appDispatch(setProcesses([]));
      appDispatch(setLoadingProcesses(false));
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, appDispatch]);

  const value = {
    processes,
    loading,
    error,
    refreshProcesses,
    deleteProcess,
    createNewProcess
  };

  return (
    <ProcessListContext.Provider value={value}>
      {children}
    </ProcessListContext.Provider>
  );
};

export default ProcessListContext; 