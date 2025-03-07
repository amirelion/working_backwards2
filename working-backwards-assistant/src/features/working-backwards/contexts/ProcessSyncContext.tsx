import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRecoilState } from 'recoil';
import { initialThoughtsState } from '../../../atoms/initialThoughtsState';
import { workingBackwardsQuestionsState } from '../../../atoms/workingBackwardsQuestionsState';
import { RootState } from '../../../store';

interface ProcessSyncContextType {
  initialThoughts: string;
  workingBackwardsQuestions: any;
  prfaq: any;
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
  const [isModified, setIsModified] = useState(false);

  // Track changes to data automatically
  const setModifiedCallback = useCallback(() => {
    setIsModified(true);
  }, []);

  useEffect(() => {
    setModifiedCallback();
    // We only want to run this when the data changes, not when setModifiedCallback changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialThoughts, workingBackwardsQuestions, prfaq]);

  const value = {
    initialThoughts,
    workingBackwardsQuestions,
    prfaq,
    isModified,
    setIsModified
  };

  return (
    <ProcessSyncContext.Provider value={value}>
      {children}
    </ProcessSyncContext.Provider>
  );
};

export default ProcessSyncContext; 