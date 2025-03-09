import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  selectCurrentProcessId,
  selectCurrentProcess,
  selectIsSaving,
  selectLastSaved,
  selectCurrentProcessError,
  selectIsModified,
  setCurrentProcessId,
  setIsSaving,
  setLastSaved,
  setCurrentProcessError,
  setIsModified
} from '../store/processManagementSlice';
import * as processService from '../services/workingBackwardsService';
import { useAuth } from './useAuth';

/**
 * Custom hook providing current process state and operations from Redux
 * This is a drop-in replacement for the context-based useCurrentProcess hook
 */
export const useCurrentProcess = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAuth();
  
  // Get process state from Redux
  const currentProcessId = useAppSelector(selectCurrentProcessId);
  const currentProcess = useAppSelector(selectCurrentProcess);
  const isSaving = useAppSelector(selectIsSaving);
  const lastSaved = useAppSelector(selectLastSaved);
  const error = useAppSelector(selectCurrentProcessError);
  const isModified = useAppSelector(selectIsModified);

  /**
   * Set the current process ID
   */
  const setCurrentProcessIdHandler = useCallback((id: string | null) => {
    dispatch(setCurrentProcessId(id));
  }, [dispatch]);

  /**
   * Load a process by ID
   */
  const loadProcess = useCallback(async (processId: string) => {
    if (!processId) {
      dispatch(setCurrentProcessError('No process ID provided'));
      return;
    }

    try {
      dispatch(setIsSaving(true));
      dispatch(setCurrentProcessError(null));
      
      // Load process from service
      const process = await processService.getProcessById(processId);
      
      if (process) {
        // Update Redux state with loaded process
        dispatch(setCurrentProcessId(process.id));
        
        // Convert date objects to strings for Redux
        const serializedProcess = {
          ...process,
          createdAt: process.createdAt instanceof Date ? process.createdAt.toISOString() : process.createdAt,
          updatedAt: process.updatedAt instanceof Date ? process.updatedAt.toISOString() : process.updatedAt,
        };
        
        // Update lastSaved timestamp
        let lastSavedString: string;
        if (process.updatedAt instanceof Date) {
          lastSavedString = process.updatedAt.toISOString();
        } else if (typeof process.updatedAt === 'string') {
          lastSavedString = process.updatedAt;
        } else {
          lastSavedString = new Date().toISOString();
        }
        
        dispatch(setLastSaved(lastSavedString));
        dispatch(setIsModified(false));
      } else {
        dispatch(setCurrentProcessError(`Process with ID ${processId} not found`));
      }
    } catch (error) {
      console.error('Error loading process:', error);
      dispatch(setCurrentProcessError('Failed to load process. Please try again.'));
    } finally {
      dispatch(setIsSaving(false));
    }
  }, [dispatch]);

  /**
   * Save the current process
   */
  const saveCurrentProcess = useCallback(async () => {
    if (!currentUser || !currentProcessId || !currentProcess) {
      console.error('Cannot save process - no current process or user');
      return false;
    }
    
    if (!isModified) {
      console.log('No changes to save');
      return true;
    }
    
    try {
      dispatch(setIsSaving(true));
      dispatch(setCurrentProcessError(null));
      
      console.log('Starting save process for ID:', currentProcessId);
      
      // Create a process object from current state
      const processData = {
        ...currentProcess,
        updatedAt: new Date() // Use fresh date
      };
      
      // Save the process via service
      await processService.updateProcess(processData);
      
      // Update lastSaved timestamp
      const now = new Date();
      dispatch(setLastSaved(now.toISOString()));
      dispatch(setIsModified(false));
      
      console.log('Save completed successfully');
      return true;
    } catch (error) {
      console.error('Error saving process:', error);
      dispatch(setCurrentProcessError('Failed to save process. Please try again.'));
      return false;
    } finally {
      dispatch(setIsSaving(false));
    }
  }, [currentUser, currentProcessId, currentProcess, isModified, dispatch]);

  return {
    currentProcessId,
    setCurrentProcessId: setCurrentProcessIdHandler,
    currentProcess,
    isSaving,
    lastSaved: lastSaved ? new Date(lastSaved) : null,
    error,
    isModified,
    loadProcess,
    saveCurrentProcess,
    setIsModified: (value: boolean) => dispatch(setIsModified(value))
  };
}; 