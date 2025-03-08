import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRecoilState } from 'recoil';
import { ProcessListProvider } from './ProcessListContext';
import { CurrentProcessProvider } from './CurrentProcessContext';
import { ProcessSyncProvider } from './ProcessSyncContext';
import { WorkingBackwardsProcess } from '../../../types/workingBackwards';
import { initialThoughtsState } from '../../../atoms/initialThoughtsState';
import { workingBackwardsQuestionsState } from '../../../atoms/workingBackwardsQuestionsState';
import { updatePRFAQTitle, updatePRFAQPressRelease, setFAQs, setCustomerFAQs, setStakeholderFAQs } from '../../../store/prfaqSlice';
import { RootState } from '../../../store';
import { backwardCompatSelectors } from '../../../store/compatUtils';

/**
 * Combined provider that wraps all working backwards contexts
 */
export const WorkingBackwardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [initialThoughts, setInitialThoughts] = useRecoilState(initialThoughtsState);
  const [workingBackwardsQuestions, setWorkingBackwardsQuestions] = useRecoilState(workingBackwardsQuestionsState);
  const prfaq = useSelector((state: RootState) => state.prfaq);
  const assumptions = useSelector((state: RootState) => backwardCompatSelectors.assumptions(state));
  const experiments = useSelector((state: RootState) => backwardCompatSelectors.experiments(state));
  
  // Define the process data getter function
  const getProcessData = useCallback((): Partial<WorkingBackwardsProcess> => {
    console.log("[WorkingBackwardsProvider] getProcessData called - collecting data for save");
    console.log("[WorkingBackwardsProvider] Current assumptions in Redux:", 
      assumptions.length > 0 ? `${assumptions.length} assumptions` : "none");
    
    // Log sample of assumptions for debugging
    if (assumptions.length > 0) {
      console.log("[WorkingBackwardsProvider] Sample assumptions:", 
        assumptions.slice(0, 2).map(a => ({
          id: a.id, 
          statement: a.statement?.substring(0, 30) || '',
          status: a.status || 'unvalidated'
        }))
      );
    }
    
    return {
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
      },
      assumptions: assumptions,
      experiments: experiments
    };
  }, [initialThoughts, workingBackwardsQuestions, prfaq, assumptions, experiments]);

  // Define the process load handler
  const handleProcessLoad = useCallback((process: WorkingBackwardsProcess): void => {
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
    
    // Update PRFAQ state in Redux
    if (process.prfaq) {
      dispatch(updatePRFAQTitle(process.prfaq.title || ''));
      
      // Map Firebase fields to Redux fields
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
      
      // Set FAQs
      dispatch(setFAQs([]));
      dispatch(setCustomerFAQs(process.prfaq.customerFaqs || []));
      dispatch(setStakeholderFAQs(process.prfaq.stakeholderFaqs || []));
    }
    
    // Load assumptions into Redux if present
    if (process.assumptions) {
      // Clear existing assumptions and replace with loaded ones
      dispatch({ type: 'session/resetAssumptions' });
      process.assumptions.forEach(assumption => {
        dispatch({ 
          type: 'session/addAssumption', 
          payload: {
            ...assumption,
            // Ensure all required fields are present
            description: assumption.description || '',
            category: assumption.category || 'customer',
            status: assumption.status || 'unvalidated',
            relatedExperiments: assumption.relatedExperiments || []
          }
        });
      });
    }
    
    // Load experiments into Redux if present
    if (process.experiments) {
      // Clear existing experiments and replace with loaded ones
      dispatch({ type: 'session/resetExperiments' });
      process.experiments.forEach(experiment => {
        dispatch({ 
          type: 'session/addExperiment', 
          payload: experiment 
        });
      });
    }
  }, [dispatch, setInitialThoughts, setWorkingBackwardsQuestions]);
  
  return (
    <ProcessListProvider>
      <ProcessSyncProvider>
        <CurrentProcessProvider
          getProcessData={getProcessData}
          onProcessLoad={handleProcessLoad}
        >
          {children}
        </CurrentProcessProvider>
      </ProcessSyncProvider>
    </ProcessListProvider>
  );
};

export default WorkingBackwardsProvider; 