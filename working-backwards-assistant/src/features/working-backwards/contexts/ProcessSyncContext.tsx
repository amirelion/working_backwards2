import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRecoilState } from 'recoil';
import { initialThoughtsState } from '../../../atoms/initialThoughtsState';
import { workingBackwardsQuestionsState } from '../../../atoms/workingBackwardsQuestionsState';
import { RootState } from '../../../store';
import { backwardCompatSelectors } from '../../../store/compatUtils';

interface ProcessSyncContextType {
  initialThoughts: string;
  workingBackwardsQuestions: any;
  prfaq: any;
  assumptions: any[];
  experiments: any[];
  isModified: boolean;
  setIsModified: (value: boolean) => void;
}

export const ProcessSyncContext = createContext<ProcessSyncContextType | null>(null);

/**
 * Custom hook to use the process sync context
 */
export const useProcessSync = (): ProcessSyncContextType => {
  const context = useContext(ProcessSyncContext);
  if (!context) {
    throw new Error('useProcessSync must be used within a ProcessSyncProvider');
  }
  return context;
};

/**
 * Provider component for giving access to process data
 * This is now a much simpler provider that just gives access to state
 * and tracks data modifications
 */
export const ProcessSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State from Recoil and Redux
  const [initialThoughts] = useRecoilState(initialThoughtsState);
  const [workingBackwardsQuestions] = useRecoilState(workingBackwardsQuestionsState);
  const prfaq = useSelector((state: RootState) => state.prfaq);
  const assumptions = useSelector((state: RootState) => backwardCompatSelectors.assumptions(state));
  const experiments = useSelector((state: RootState) => backwardCompatSelectors.experiments(state));
  const [isModified, setIsModified] = useState(false);
  
  // Keep previous values to compare for changes
  const prevAssumptionsRef = useRef<any[]>([]);
  const prevExperimentsRef = useRef<any[]>([]);

  // Track changes to data automatically
  const setModifiedCallback = useCallback(() => {
    console.log('[ProcessSyncContext] Setting isModified to true');
    setIsModified(true);
  }, []);
  
  // Explicitly mark as not modified (after saving)
  const markAsNotModified = useCallback(() => {
    console.log('[ProcessSyncContext] Setting isModified to false after save');
    setIsModified(false);
    
    // Update refs to current values to prevent immediate re-marking as modified
    prevAssumptionsRef.current = [...assumptions];
    prevExperimentsRef.current = [...experiments];
  }, [assumptions, experiments]);

  // Check if assumptions have changed
  useEffect(() => {
    // If we're already marked as modified, no need to check again
    if (isModified) return;
    
    // Skip the first render when refs are empty
    if (prevAssumptionsRef.current.length === 0) {
      prevAssumptionsRef.current = [...assumptions];
      return;
    }
    
    // Check if length has changed
    if (prevAssumptionsRef.current.length !== assumptions.length) {
      console.log('[ProcessSyncContext] Assumptions length changed, marking as modified');
      setModifiedCallback();
      prevAssumptionsRef.current = [...assumptions];
      return;
    }
    
    // Check if content has changed by comparing stringified versions
    const prevAssumptionsStr = JSON.stringify(prevAssumptionsRef.current);
    const currentAssumptionsStr = JSON.stringify(assumptions);
    
    if (prevAssumptionsStr !== currentAssumptionsStr) {
      console.log('[ProcessSyncContext] Assumptions content changed, marking as modified');
      setModifiedCallback();
    }
    
    // Update ref with current value
    prevAssumptionsRef.current = [...assumptions];
  }, [assumptions, setModifiedCallback, isModified]);
  
  // Check if experiments have changed
  useEffect(() => {
    // If we're already marked as modified, no need to check again
    if (isModified) return;
    
    // Skip the first render when refs are empty
    if (prevExperimentsRef.current.length === 0) {
      prevExperimentsRef.current = [...experiments];
      return;
    }
    
    // Similar check for experiments
    if (prevExperimentsRef.current.length !== experiments.length) {
      console.log('[ProcessSyncContext] Experiments length changed, marking as modified');
      setModifiedCallback();
      prevExperimentsRef.current = [...experiments];
      return;
    }
    
    const prevExperimentsStr = JSON.stringify(prevExperimentsRef.current);
    const currentExperimentsStr = JSON.stringify(experiments);
    
    if (prevExperimentsStr !== currentExperimentsStr) {
      console.log('[ProcessSyncContext] Experiments content changed, marking as modified');
      setModifiedCallback();
    }
    
    // Update ref with current value
    prevExperimentsRef.current = [...experiments];
  }, [experiments, setModifiedCallback, isModified]);

  // Track changes to other data
  useEffect(() => {
    // If we're already marked as modified, no need to check again
    if (isModified) return;
    
    console.log('[ProcessSyncContext] Initial thoughts, PRFAQ, or Working Backwards responses changed, marking as modified');
    setModifiedCallback();
    // We only want to run this when the data changes, not when setModifiedCallback changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialThoughts, workingBackwardsQuestions, prfaq]);

  const value = {
    initialThoughts,
    workingBackwardsQuestions,
    prfaq,
    assumptions,
    experiments,
    isModified,
    setIsModified: useCallback((value: boolean) => {
      if (!value) {
        markAsNotModified();
      } else {
        setIsModified(true);
      }
    }, [markAsNotModified])
  };

  return (
    <ProcessSyncContext.Provider value={value}>
      {children}
    </ProcessSyncContext.Provider>
  );
};

export default ProcessSyncContext; 