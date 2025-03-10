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
import { selectInitialThoughts } from '../store/initialThoughtsSlice';
import { selectQuestions } from '../store/workingBackwardsSlice';
import { RootState } from '../store/rootStore';
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
  const currentProcess = useAppSelector(selectCurrentProcess);
  const isModified = useAppSelector(selectIsModified);
  const currentProcessId = useAppSelector(selectCurrentProcessId);
  const isSaving = useAppSelector(selectIsSaving);
  const lastSaved = useAppSelector(selectLastSaved);
  const error = useAppSelector(selectCurrentProcessError);
  
  // Get data from all slices
  const initialThoughtsData = useAppSelector(selectInitialThoughts);
  const questionsData = useAppSelector(selectQuestions);
  const prfaqData = useAppSelector((state: RootState) => state.prfaq);

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
      return false;
    }
    
    try {
      dispatch(setIsSaving(true));
      dispatch(setCurrentProcessError(null));
      
      console.log('Starting save process for ID:', currentProcessId);
      
      // Create a complete process object using the selectors that were
      // already called at the top level of the hook
      const processData: Record<string, any> = {
        ...currentProcess
      };
      
      // Add data from other slices if available
      if (initialThoughtsData !== undefined) {
        processData.initialThoughts = initialThoughtsData;
      } else {
        processData.initialThoughts = '';
      }
      
      if (questionsData !== undefined) {
        processData.workingBackwardsQuestions = questionsData;
      } else {
        processData.workingBackwardsQuestions = {};
      }
      
      // Add PRFAQ data that we retrieved at the top level of the hook
      processData.prfaq = {
        title: prfaqData.title,
        pressRelease: {
          // Use Redux field names directly with no mapping
          introduction: prfaqData.pressRelease.introduction,
          problemStatement: prfaqData.pressRelease.problemStatement,
          solution: prfaqData.pressRelease.solution,
          stakeholderQuote: prfaqData.pressRelease.stakeholderQuote,
          customerJourney: prfaqData.pressRelease.customerJourney,
          customerQuote: prfaqData.pressRelease.customerQuote,
          callToAction: prfaqData.pressRelease.callToAction
        },
        customerFaqs: prfaqData.customerFaqs,
        stakeholderFaqs: prfaqData.stakeholderFaqs
      };
      
      // Always update the timestamp
      processData.updatedAt = new Date();
      
      console.log('Assembled process data for save:', processData);
      
      // Process the data to ensure no undefined values are sent to Firestore
      Object.keys(processData).forEach(key => {
        if (processData[key] === undefined) {
          console.log(`Converting undefined value for ${key} to null`);
          processData[key] = null;
        }
      });
      
      // Specifically handle assumptions - use empty array instead of undefined/null
      if (!processData.assumptions) {
        processData.assumptions = [];
        console.log('Setting empty assumptions array');
      }
      
      // Save the process via service - need to pass the processId and data
      await processService.updateProcess(currentProcessId, processData);
      
      // Update lastSaved timestamp
      const now = new Date();
      dispatch(setLastSaved(now.toISOString()));
      dispatch(setIsModified(false));
      
      console.log('Save completed successfully');
      return true;
    } catch (error) {
      console.error('Error saving process:', error);
      dispatch(setCurrentProcessError(`Failed to save process: ${error}`));
      return false;
    } finally {
      dispatch(setIsSaving(false));
    }
  }, [currentUser, currentProcessId, currentProcess, dispatch, initialThoughtsData, questionsData, prfaqData]);

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