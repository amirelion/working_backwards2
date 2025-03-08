import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { WorkingBackwardsProcess } from '../../../types/workingBackwards';
import * as processService from '../services/processService';
import * as saveService from '../../../services/saveService';
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
      console.error('[CurrentProcessContext] Cannot save process - no current process or user');
      throw new Error('Cannot save process - no current process or user');
    }
    
    if (!isModified) {
      console.log('[CurrentProcessContext] No changes to save');
      return;
    }
    
    console.log('[CurrentProcessContext] Starting save process for ID:', currentProcessId);
    setIsSaving(true);
    setError(null);
    
    try {
      const processData = getProcessData();
      
      console.log('[CurrentProcessContext] Process data to save:', {
        ...processData,
        assumptions: processData.assumptions ? `${processData.assumptions.length} assumptions` : 'none',
        experiments: processData.experiments ? `${processData.experiments.length} experiments` : 'none'
      });
      
      if (processData.assumptions && processData.assumptions.length > 0) {
        console.log('[CurrentProcessContext] Sample of assumptions being saved:', 
          processData.assumptions.slice(0, 3).map(a => ({
            id: a.id,
            statement: a.statement?.substring(0, 30) + (a.statement?.length > 30 ? '...' : '') || '',
            category: a.category || 'unknown',
            impact: a.impact || 'unknown',
            confidence: a.confidence || 'unknown',
            status: a.status || 'unvalidated'
          }))
        );
      } else {
        console.warn('[CurrentProcessContext] No assumptions to save, this might be a problem if you expected some');
      }
      
      // Validate the process data before saving
      if (!saveService.validateProcessData(processData)) {
        console.error('[CurrentProcessContext] Invalid process data structure');
        throw new Error('Invalid process data structure');
      }
      
      // Use the saveService to save the process
      await saveService.saveProcess(currentProcessId, processData);
      console.log('[CurrentProcessContext] Save completed successfully');
      
      setLastSaved(new Date());
      
      // Explicitly set isModified to false to prevent immediate re-marking as modified
      console.log('[CurrentProcessContext] Setting isModified to false after successful save');
      setIsModified(false);
    } catch (error) {
      console.error('[CurrentProcessContext] Error saving process:', error);
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
    
    console.log('[CurrentProcessContext] Setting up auto-save timer - isModified:', isModified);
    
    const saveTimer = setTimeout(() => {
      console.log('[CurrentProcessContext] Auto-save timer triggered, calling saveCurrentProcess()');
      saveCurrentProcess().then(() => {
        console.log('[CurrentProcessContext] Auto-save completed successfully');
      }).catch(error => {
        console.error('[CurrentProcessContext] Auto-save failed:', error);
      });
    }, 3000); // Reduced from 5 seconds to 3 seconds for testing
    
    return () => {
      console.log('[CurrentProcessContext] Clearing auto-save timer');
      clearTimeout(saveTimer);
    };
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