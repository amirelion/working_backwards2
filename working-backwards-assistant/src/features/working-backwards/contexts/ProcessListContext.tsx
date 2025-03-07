import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { WorkingBackwardsProcessSummary } from '../../../types/workingBackwards';
import * as processService from '../services/processService';

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
  const [processes, setProcesses] = useState<WorkingBackwardsProcessSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh the list of processes
   */
  const refreshProcesses = () => {
    if (!currentUser) {
      setProcesses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
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
      setError('Failed to delete process');
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
      setError('Failed to create new process');
      throw error;
    }
  };

  /**
   * Subscribe to the user's processes
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (currentUser) {
      setLoading(true);
      unsubscribe = processService.subscribeToUserProcesses(
        currentUser.uid,
        (updatedProcesses) => {
          setProcesses(updatedProcesses);
          setLoading(false);
        },
        (error) => {
          console.error('Error in processes subscription:', error);
          setError('Failed to load your Working Backwards processes');
          setLoading(false);
        }
      );
    } else {
      setProcesses([]);
      setLoading(false);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

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