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
  setIsModified,
  setCurrentProcess
} from '../store/processManagementSlice';
import * as processService from '../services/workingBackwardsService';
import { useAuth } from './useAuth';
import { distributeProcessData } from '../utils/processDataDistribution';

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
        
        // Create a properly serialized process with string dates
        const serializedProcess = {
          ...process,
          createdAt: process.createdAt instanceof Date 
            ? process.createdAt.toISOString() 
            : typeof process.createdAt === 'string'
              ? process.createdAt
              : new Date().toISOString(),
          updatedAt: process.updatedAt instanceof Date 
            ? process.updatedAt.toISOString() 
            : typeof process.updatedAt === 'string'
              ? process.updatedAt
              : new Date().toISOString()
        };
        
        // Set current process in Redux
        dispatch(setCurrentProcess(serializedProcess));
        
        // Distribute process data to all Redux slices
        distributeProcessData(process, dispatch);
        
        // Update lastSaved timestamp
        const updatedAt = process.updatedAt instanceof Date
          ? process.updatedAt.toISOString()
          : typeof process.updatedAt === 'string'
            ? process.updatedAt
            : new Date().toISOString();
        
        dispatch(setLastSaved(updatedAt));
        dispatch(setIsModified(false));
      } else {
        dispatch(setCurrentProcessError('Process not found'));
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
    if (!currentUser) {
      console.error('Cannot save process - no current user');
      return false;
    }
    
    if (!currentProcessId) {
      console.error('Cannot save process - no current process ID');
      return false;
    }
    
    if (!currentProcess) {
      console.error('Cannot save process - no current process data');
      
      // Try to reload the process
      try {
        await loadProcess(currentProcessId);
        // Return false to indicate save was not completed
        return false;
      } catch (error) {
        console.error('Failed to reload process:', error);
        return false;
      }
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
      
      // Transform data to handle null values - convert them to undefined for compatibility
      // with Partial<WorkingBackwardsProcess> which expects string | Date | undefined (not null)
      const processDataForUpdate = {
        ...processData,
        createdAt: processData.createdAt === null ? undefined : processData.createdAt,
        updatedAt: processData.updatedAt === null ? undefined : processData.updatedAt
      };
      
      // Save the process via service - need to pass the processId and data
      await processService.updateProcess(currentProcessId, processDataForUpdate);
      
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
  }, [currentUser, currentProcessId, currentProcess, isModified, dispatch, loadProcess]);

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