import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { initialThoughtsState } from '../atoms/initialThoughtsState';
import { workingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';
import { WorkingBackwardsProcess, WorkingBackwardsProcessSummary } from '../types/workingBackwards';
import * as workingBackwardsService from '../services/workingBackwardsService';
import { useSelector, useDispatch } from 'react-redux';
import { updatePRFAQTitle, updatePRFAQPressRelease, setFAQs, setCustomerFAQs, setStakeholderFAQs, PRFAQState } from '../store/prfaqSlice';
import { RootState } from '../store';

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
  
  // Error handling
  error: string | null;
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
          if (process) {
            // Update initial thoughts
            setInitialThoughts(process.initialThoughts || '');
            
            // Update working backwards questions
            setWorkingBackwardsQuestions(process.workingBackwardsQuestions || {
              customer: '',
              problem: '',
              benefit: '',
              validation: '',
              experience: '',
              aiSuggestions: {}
            });
            
            // Update PRFAQ if it exists
            if (process.prfaq) {
              // Update title
              dispatch(updatePRFAQTitle(process.prfaq.title));
              
              // Update press release
              Object.entries(process.prfaq.pressRelease).forEach(([key, value]) => {
                dispatch(updatePRFAQPressRelease({ 
                  field: key as keyof PRFAQState['pressRelease'], 
                  value 
                }));
              });
              
              // Update FAQs
              dispatch(setFAQs(process.prfaq.internalFaqs || []));
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
  
  // Create a new process
  const createNewProcess = async (title: string): Promise<string> => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a process');
    }
    
    try {
      const processId = await workingBackwardsService.createProcess(
        currentUser.uid, 
        title,
        initialThoughts
      );
      return processId;
    } catch (error) {
      console.error('Error creating process:', error);
      setError('Failed to create new process');
      throw error;
    }
  };
  
  // Load a process into state
  const loadProcess = async (processId: string): Promise<void> => {
    setError(null);
    setCurrentProcessId(processId);
    
    try {
      const process = await workingBackwardsService.getProcessById(processId);
      if (process) {
        // Update all the state
        setInitialThoughts(process.initialThoughts || '');
        setWorkingBackwardsQuestions(process.workingBackwardsQuestions);
        dispatch(updatePRFAQTitle(process.prfaq?.title || ''));
        
        // Update each press release field individually
        if (process.prfaq?.pressRelease) {
          const fields = [
            'date', 'location', 'headline', 'subheadline', 'introduction',
            'problemStatement', 'solution', 'customerQuote', 'stakeholderQuote',
            'callToAction', 'aboutCompany'
          ] as const;
          
          fields.forEach(field => {
            dispatch(updatePRFAQPressRelease({
              field,
              value: process.prfaq?.pressRelease[field] || ''
            }));
          });
        }

        if (process.prfaq) {
          dispatch(setFAQs(process.prfaq.internalFaqs || []));
          dispatch(setCustomerFAQs(process.prfaq.customerFaqs || []));
          dispatch(setStakeholderFAQs(process.prfaq.stakeholderFaqs || []));
        }
      }
    } catch (error) {
      console.error('Error loading process:', error);
      setError('Failed to load process');
      throw error;
    }
  };
  
  // Save current process
  const saveCurrentProcess = async (): Promise<void> => {
    if (!currentUser || !currentProcessId) {
      throw new Error('Cannot save process - no current process or user');
    }
    
    try {
      const processData: Partial<WorkingBackwardsProcess> = {
        initialThoughts,
        workingBackwardsQuestions,
        prfaq: {
          title: prfaq.title,
          pressRelease: prfaq.pressRelease,
          internalFaqs: prfaq.faqs,
          customerFaqs: prfaq.customerFaqs,
          stakeholderFaqs: prfaq.stakeholderFaqs
        }
      };
      
      await workingBackwardsService.updateProcess(currentProcessId, processData);
    } catch (error) {
      console.error('Error saving process:', error);
      setError('Failed to save process');
      throw error;
    }
  };
  
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
  
  const value = {
    currentProcessId,
    setCurrentProcessId,
    processes,
    loadingProcesses,
    createNewProcess,
    loadProcess,
    saveCurrentProcess,
    deleteProcess,
    error
  };
  
  return (
    <WorkingBackwardsContext.Provider value={value}>
      {children}
    </WorkingBackwardsContext.Provider>
  );
} 