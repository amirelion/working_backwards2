import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { initialThoughtsState } from '../atoms/initialThoughtsState';
import { workingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';
import { WorkingBackwardsProcess, WorkingBackwardsProcessSummary } from '../types/workingBackwards';
import * as workingBackwardsService from '../services/workingBackwardsService';
import { useSelector, useDispatch } from 'react-redux';
import { updatePRFAQTitle, updatePRFAQPressRelease, setFAQs, setCustomerFAQs, setStakeholderFAQs, PRFAQState } from '../store/prfaqSlice';
import { RootState } from '../store';
import { debounce } from 'lodash';

interface WorkingBackwardsContextType {
  // Current process management
  currentProcessId: string | null;
  setCurrentProcessId: (id: string | null) => void;
  
  // Processes data
  processes: WorkingBackwardsProcessSummary[];
  loadingProcesses: boolean;
  
  // Process operations
  createNewProcess: (title: string) => Promise<string>;
  loadProcess: (processId: string) => Promise<void>;
  saveCurrentProcess: () => Promise<void>;
  deleteProcess: (processId: string) => Promise<void>;
  
  // Status indicators
  error: string | null;
  isSaving: boolean;
  lastSaved: Date | null;
  isModified: boolean;
  setIsModified: (isModified: boolean) => void;
}

const WorkingBackwardsContext = createContext<WorkingBackwardsContextType | null>(null);

export function useWorkingBackwards(): WorkingBackwardsContextType {
  const context = useContext(WorkingBackwardsContext);
  if (!context) {
    throw new Error('useWorkingBackwards must be used within a WorkingBackwardsProvider');
  }
  return context;
}

export function WorkingBackwardsProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State for process management
  const [currentProcessId, setCurrentProcessId] = useState<string | null>(null);
  const [processes, setProcesses] = useState<WorkingBackwardsProcessSummary[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isModified, setIsModified] = useState<boolean>(false);
  
  // State from Recoil and Redux
  const [initialThoughts, setInitialThoughts] = useRecoilState(initialThoughtsState);
  const [workingBackwardsQuestions, setWorkingBackwardsQuestions] = useRecoilState(workingBackwardsQuestionsState);
  const prfaq = useSelector((state: RootState) => state.prfaq);
  
  // Subscribe to user's processes when user changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (currentUser) {
      setLoadingProcesses(true);
      unsubscribe = workingBackwardsService.subscribeToUserProcesses(
        currentUser.uid,
        (updatedProcesses) => {
          setProcesses(updatedProcesses);
          setLoadingProcesses(false);
        },
        (error) => {
          console.error('Error in processes subscription:', error);
          setError('Failed to load your Working Backwards processes');
          setLoadingProcesses(false);
        }
      );
    } else {
      setProcesses([]);
      setLoadingProcesses(false);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);
  
  // Subscribe to current process when currentProcessId changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (currentProcessId) {
      unsubscribe = workingBackwardsService.subscribeToProcess(
        currentProcessId,
        (process) => {
          // Update state with process data
          if (process) {
            // Reset modified flag when loading a process
            setIsModified(false);
            
            // Update initial thoughts
            if (process.initialThoughts) {
              setInitialThoughts(process.initialThoughts);
            }
            
            // Update working backwards questions
            setWorkingBackwardsQuestions(process.workingBackwardsQuestions || {
              customer: '',
              problem: '',
              benefit: '',
              validation: '',
              experience: '',
              aiSuggestions: {}
            });
            
            // Update PRFAQ state
            if (process.prfaq) {
              // Set title
              dispatch(updatePRFAQTitle(process.prfaq.title || ''));
              
              // Map Firebase fields to Redux fields
              const fieldMappings: Record<string, keyof PRFAQState['pressRelease']> = {
                'introduction': 'introduction',
                'problemStatement': 'problemStatement',
                'solution': 'solution',
                'stakeholderQuote': 'stakeholderQuote',
                'customerJourney': 'customerJourney',
                'customerQuote': 'customerQuote',
                'callToAction': 'callToAction'
              };
              
              // Update press release fields
              Object.entries(fieldMappings).forEach(([firebaseField, reduxField]) => {
                const value = process.prfaq?.pressRelease[firebaseField as keyof typeof process.prfaq.pressRelease] || '';
                dispatch(updatePRFAQPressRelease({
                  field: reduxField,
                  value
                }));
              });
              
              // Update FAQs
              dispatch(setFAQs([]));
              dispatch(setCustomerFAQs(process.prfaq.customerFaqs || []));
              dispatch(setStakeholderFAQs(process.prfaq.stakeholderFaqs || []));
            }
          }
        },
        (error) => {
          console.error('Error in process subscription:', error);
          setError('Failed to load process');
        }
      );
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentProcessId, dispatch, setInitialThoughts, setWorkingBackwardsQuestions]);
  
  // Update isModified when state changes
  useEffect(() => {
    if (currentProcessId) {
      setIsModified(true);
    }
  }, [initialThoughts, workingBackwardsQuestions, prfaq, currentProcessId]);
  
  // Create a new process
  const createNewProcess = async (title: string): Promise<string> => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a process');
    }
    
    try {
      // Create the process first
      const processId = await workingBackwardsService.createProcess(
        currentUser.uid, 
        title,
        '' // Start with empty initial thoughts
      );
      
      // Then clear all state
      setInitialThoughts('');
      setWorkingBackwardsQuestions({
        customer: '',
        problem: '',
        benefit: '',
        validation: '',
        experience: '',
        aiSuggestions: {}
      });
      
      // Clear PRFAQ state
      dispatch(updatePRFAQTitle(title)); // Use the provided title
      dispatch(updatePRFAQPressRelease({ field: 'introduction', value: '' }));
      dispatch(updatePRFAQPressRelease({ field: 'problemStatement', value: '' }));
      dispatch(updatePRFAQPressRelease({ field: 'solution', value: '' }));
      dispatch(updatePRFAQPressRelease({ field: 'stakeholderQuote', value: '' }));
      dispatch(updatePRFAQPressRelease({ field: 'customerJourney', value: '' }));
      dispatch(updatePRFAQPressRelease({ field: 'customerQuote', value: '' }));
      dispatch(updatePRFAQPressRelease({ field: 'callToAction', value: '' }));
      
      // Clear FAQs
      dispatch(setFAQs([]));
      dispatch(setCustomerFAQs([]));
      dispatch(setStakeholderFAQs([]));
      
      setCurrentProcessId(processId);
      setLastSaved(new Date());
      return processId;
    } catch (error) {
      console.error('Error creating process:', error);
      setError('Failed to create new process');
      throw error;
    }
  };
  
  // Load a process into state
  const loadProcess = async (processId: string): Promise<void> => {
    console.log('Loading process:', processId);
    
    if (!currentUser) {
      console.error('Cannot load process - no current user');
      throw new Error('Cannot load process - no current user');
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const process = await workingBackwardsService.getProcessById(processId);
      
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
      
      console.log('Process loaded:', process);
      
      // Set the current process ID
      setCurrentProcessId(processId);
      
      // Set the initial thoughts
      setInitialThoughts(process.initialThoughts || '');
      
      // Set the working backwards questions
      setWorkingBackwardsQuestions(process.workingBackwardsQuestions || {
        customer: '',
        problem: '',
        benefit: '',
        validation: '',
        experience: '',
        aiSuggestions: {}
      });
      
      // Set the PRFAQ data in Redux
      if (process.prfaq) {
        dispatch(updatePRFAQTitle(process.prfaq.title || ''));
        
        // Set press release fields
        if (process.prfaq.pressRelease) {
          dispatch(updatePRFAQPressRelease({
            field: 'introduction',
            value: process.prfaq.pressRelease.introduction || ''
          }));
          dispatch(updatePRFAQPressRelease({
            field: 'problemStatement',
            value: process.prfaq.pressRelease.problemStatement || ''
          }));
          dispatch(updatePRFAQPressRelease({
            field: 'solution',
            value: process.prfaq.pressRelease.solution || ''
          }));
          dispatch(updatePRFAQPressRelease({
            field: 'stakeholderQuote',
            value: process.prfaq.pressRelease.stakeholderQuote || ''
          }));
          dispatch(updatePRFAQPressRelease({
            field: 'customerJourney',
            value: process.prfaq.pressRelease.customerJourney || ''
          }));
          dispatch(updatePRFAQPressRelease({
            field: 'customerQuote',
            value: process.prfaq.pressRelease.customerQuote || ''
          }));
          dispatch(updatePRFAQPressRelease({
            field: 'callToAction',
            value: process.prfaq.pressRelease.callToAction || ''
          }));
        }
        
        // Set FAQs - use empty array
        dispatch(setFAQs([]));
        
        // Set customer FAQs
        dispatch(setCustomerFAQs(process.prfaq.customerFaqs || []));
        
        // Set stakeholder FAQs
        dispatch(setStakeholderFAQs(process.prfaq.stakeholderFaqs || []));
      }
      
      setLastSaved(new Date(process.updatedAt));
      setIsModified(false);
    } catch (error) {
      console.error('Error loading process:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Wrap saveCurrentProcess in useCallback to prevent it from changing on every render
  const saveCurrentProcess = useCallback(async (): Promise<void> => {
    console.log('saveCurrentProcess called with:', {
      hasCurrentUser: !!currentUser,
      currentUserId: currentUser?.uid,
      currentProcessId,
      initialThoughtsLength: initialThoughts?.length || 0,
      workingBackwardsQuestionsKeys: Object.keys(workingBackwardsQuestions || {}),
      prfaqTitle: prfaq?.title
    });
    
    if (!currentUser || !currentProcessId) {
      console.error('Cannot save process - no current process or user', {
        hasCurrentUser: !!currentUser,
        currentProcessId
      });
      throw new Error('Cannot save process - no current process or user');
    }
    
    // Skip saving if nothing has changed
    if (!isModified) {
      console.log('No changes detected, skipping save');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Preparing process data for save...');
      
      // Map the Redux PRFAQ state to the Firebase structure
      const mappedPrfaq = {
        title: prfaq.title,
        pressRelease: {
          introduction: prfaq.pressRelease.introduction,
          problemStatement: prfaq.pressRelease.problemStatement,
          solution: prfaq.pressRelease.solution,
          stakeholderQuote: prfaq.pressRelease.stakeholderQuote,
          customerJourney: prfaq.pressRelease.customerJourney, // Use customerJourney field
          customerQuote: prfaq.pressRelease.customerQuote,
          callToAction: prfaq.pressRelease.callToAction
        },
        // No internalFaqs field
        customerFaqs: prfaq.customerFaqs,
        stakeholderFaqs: prfaq.stakeholderFaqs
      };
      
      const processData: Partial<WorkingBackwardsProcess> = {
        initialThoughts,
        workingBackwardsQuestions,
        prfaq: mappedPrfaq
      };
      
      console.log('Saving process data:', {
        processId: currentProcessId,
        dataKeys: Object.keys(processData)
      });
      
      await workingBackwardsService.updateProcess(currentProcessId, processData);
      console.log('Process saved successfully');
      
      setLastSaved(new Date());
      setIsModified(false);
    } catch (error) {
      console.error('Error saving process:', error);
      setError('Failed to save process');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [
    currentUser, 
    currentProcessId, 
    initialThoughts, 
    workingBackwardsQuestions, 
    prfaq,
    isModified,
    setIsSaving, 
    setLastSaved, 
    setIsModified, 
    setError
  ]);
  
  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async () => {
      if (currentProcessId && currentUser) {
        try {
          setIsSaving(true);
          const processData: Partial<WorkingBackwardsProcess> = {
            initialThoughts,
            workingBackwardsQuestions,
            prfaq: {
              title: prfaq.title,
              pressRelease: {
                introduction: prfaq.pressRelease.introduction,
                problemStatement: prfaq.pressRelease.problemStatement,
                solution: prfaq.pressRelease.solution,
                stakeholderQuote: prfaq.pressRelease.stakeholderQuote,
                customerJourney: prfaq.pressRelease.customerJourney,
                customerQuote: prfaq.pressRelease.customerQuote,
                callToAction: prfaq.pressRelease.callToAction
              },
              customerFaqs: prfaq.customerFaqs,
              stakeholderFaqs: prfaq.stakeholderFaqs
            }
          };
          
          await workingBackwardsService.updateProcess(currentProcessId, processData);
          setLastSaved(new Date());
          setError(null);
        } catch (error) {
          console.error('Error auto-saving process:', error);
          setError('Failed to auto-save process');
        } finally {
          setIsSaving(false);
        }
      }
    }, 5000),
    [currentProcessId, currentUser, initialThoughts, workingBackwardsQuestions, prfaq]
  );
  
  // Auto-save when state changes
  useEffect(() => {
    if (currentProcessId && currentUser) {
      debouncedSave();
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [currentProcessId, currentUser, initialThoughts, workingBackwardsQuestions, prfaq, debouncedSave]);
  
  // Delete a process
  const deleteProcess = async (processId: string): Promise<void> => {
    try {
      await workingBackwardsService.deleteProcess(processId);
      
      // If we deleted the current process, clear it
      if (processId === currentProcessId) {
        setCurrentProcessId(null);
      }
    } catch (error) {
      console.error('Error deleting process:', error);
      setError('Failed to delete process');
      throw error;
    }
  };
  
  // Set up auto-save with debounce
  useEffect(() => {
    if (!currentProcessId || !isModified) return;
    
    const saveTimer = setTimeout(() => {
      saveCurrentProcess();
    }, 5000); // Increased from 2000ms to 5000ms to give more time for AI generation
    
    return () => clearTimeout(saveTimer);
  }, [currentProcessId, isModified, saveCurrentProcess]);
  
  const value = {
    currentProcessId,
    setCurrentProcessId,
    processes,
    loadingProcesses,
    createNewProcess,
    loadProcess,
    saveCurrentProcess,
    deleteProcess,
    error,
    isSaving,
    lastSaved,
    isModified,
    setIsModified
  };
  
  return (
    <WorkingBackwardsContext.Provider value={value}>
      {children}
    </WorkingBackwardsContext.Provider>
  );
} 