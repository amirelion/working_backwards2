import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { WorkingBackwardsProcess } from '../../../types/workingBackwards';
import * as processService from '../services/processService';
import { useProcessSync } from './ProcessSyncContext';

interface CurrentProcessContextType {
  currentProcessId: string | null;
  setCurrentProcessId: (id: string | null) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  loadProcess: (processId: string) => Promise<void>;
  saveCurrentProcess: () => Promise<void>;
}

// Provide default values for the context to prevent errors
const defaultContextValue: CurrentProcessContextType = {
  currentProcessId: null,
  setCurrentProcessId: () => {},
  isSaving: false,
  lastSaved: null,
  error: null,
  loadProcess: async () => { throw new Error('Not implemented'); },
  saveCurrentProcess: async () => { throw new Error('Not implemented'); }
};

export const CurrentProcessContext = createContext<CurrentProcessContextType>(defaultContextValue);

/**
 * Custom hook to use the current process context
 */
export const useCurrentProcess = (): CurrentProcessContextType => {
  const context = useContext(CurrentProcessContext);
  if (!context) {
    throw new Error('useCurrentProcess must be used within a CurrentProcessProvider');
  }
  return context;
};

/**
 * Provider component for managing the current working backwards process
 */
export const CurrentProcessProvider: React.FC<{ 
  children: React.ReactNode;
  getProcessData: () => Partial<WorkingBackwardsProcess>;
  onProcessLoad: (process: WorkingBackwardsProcess) => void;
}> = ({ children, getProcessData, onProcessLoad }) => {
  const { currentUser } = useAuth();
  const { isModified, setIsModified } = useProcessSync();
  
  const [currentProcessId, setCurrentProcessId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load a process by ID
   */
  const loadProcess = useCallback(async (processId: string): Promise<void> => {
    if (!currentUser) {
      console.error('Cannot load process - no current user');
      throw new Error('Cannot load process - no current user');
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const process = await processService.getProcessById(processId);
      
      if (!process) {
        console.error('Process not found:', processId);
        setError('Process not found');
        throw new Error('Process not found');
      }
      
      if (process.userId !== currentUser.uid) {
        console.error('Process belongs to another user');
        setError('You do not have permission to access this process');
        throw new Error('Process belongs to another user');
      }
      
      // Set the current process ID
      setCurrentProcessId(processId);
      
      // Call the callback to update app state
      onProcessLoad(process);
      
      setLastSaved(new Date(process.updatedAt));
      setIsModified(false);
    } catch (error) {
      console.error('Error loading process:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentUser, onProcessLoad, setIsModified]);

  /**
   * Save the current process
   */
  const saveCurrentProcess = useCallback(async (): Promise<void> => {
    if (!currentProcessId || !currentUser) {
      console.error('Cannot save process - no current process or user');
      throw new Error('Cannot save process - no current process or user');
    }
    
    if (!isModified) {
      console.log('No changes to save');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const processData = getProcessData();
      
      await processService.updateProcess(currentProcessId, processData);
      setLastSaved(new Date());
      setIsModified(false);
    } catch (error) {
      console.error('Error saving process:', error);
      setError('Failed to save process');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentProcessId, currentUser, getProcessData, isModified, setIsModified]);

  /**
   * Set up auto-save with debounce when state changes
   */
  useEffect(() => {
    if (!currentProcessId || !isModified) return;
    
    const saveTimer = setTimeout(() => {
      saveCurrentProcess();
    }, 5000); // 5 second auto-save delay
    
    return () => clearTimeout(saveTimer);
  }, [currentProcessId, isModified, saveCurrentProcess]);

  const value = {
    currentProcessId,
    setCurrentProcessId,
    isSaving,
    lastSaved,
    error,
    loadProcess,
    saveCurrentProcess
  };

  return (
    <CurrentProcessContext.Provider value={value}>
      {children}
    </CurrentProcessContext.Provider>
  );
};

export default CurrentProcessContext; 