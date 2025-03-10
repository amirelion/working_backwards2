import { useCallback, useEffect } from 'react';
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
  const refreshProcesses = useCallback(async () => {
    if (!currentUser) {
      dispatch(setProcesses([]));
      dispatch(setLoadingProcesses(false));
      return;
    }

    try {
      dispatch(setLoadingProcesses(true));
      dispatch(setProcessListError(null));
      
      // Fetch processes from Firestore
      const fetchedProcesses = await processService.getUserProcesses(currentUser.uid);
      
      // Convert to serializable format (ensure dates are strings)
      const serializableProcesses = fetchedProcesses.map(process => ({
        id: process.id,
        title: process.title,
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
      }));
      
      dispatch(setProcesses(serializableProcesses));
    } catch (error) {
      console.error('Error fetching processes:', error);
      dispatch(setProcessListError('Failed to fetch processes'));
    } finally {
      dispatch(setLoadingProcesses(false));
    }
  }, [currentUser, dispatch]);
  
  // Load processes when component mounts or currentUser changes
  useEffect(() => {
    refreshProcesses();
    
    // Set up real-time listener for changes
    if (currentUser) {
      const unsubscribe = processService.subscribeToUserProcesses(
        currentUser.uid,
        (fetchedProcesses) => {
          // Convert to serializable format (ensure dates are strings)
          const serializableProcesses = fetchedProcesses.map(process => ({
            id: process.id,
            title: process.title,
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
          }));
          
          dispatch(setProcesses(serializableProcesses));
          dispatch(setLoadingProcesses(false));
        },
        (error) => {
          console.error('Error with real-time updates:', error);
          dispatch(setProcessListError('Failed to get real-time updates'));
          dispatch(setLoadingProcesses(false));
        }
      );
      
      return () => unsubscribe();
    }
  }, [currentUser, dispatch, refreshProcesses]);

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