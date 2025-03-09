import { AppDispatch } from '../store/rootStore';
import { WorkingBackwardsProcess } from '../types/workingBackwards';
import { setInitialThoughts } from '../store/initialThoughtsSlice';
import { 
  setQuestionsData, 
  setAISuggestions 
} from '../store/workingBackwardsSlice';
import { 
  updatePRFAQTitle, 
  updatePRFAQPressRelease, 
  setCustomerFAQs, 
  setStakeholderFAQs 
} from '../store/prfaqSlice';

/**
 * Distributes process data to all Redux slices
 * This replicates the functionality of the original handleProcessLoad in WorkingBackwardsProvider
 * 
 * @param process - The loaded process from Firestore
 * @param dispatch - Redux dispatch function
 */
export const distributeProcessData = (
  process: WorkingBackwardsProcess, 
  dispatch: AppDispatch
): void => {
  // 1. Update initial thoughts
  if (process.initialThoughts) {
    dispatch(setInitialThoughts(process.initialThoughts));
  }
  
  // 2. Update working backwards questions
  if (process.workingBackwardsQuestions) {
    // Update main questions data
    dispatch(setQuestionsData(process.workingBackwardsQuestions));
    
    // Ensure AI suggestions are also updated
    if (process.workingBackwardsQuestions.aiSuggestions) {
      dispatch(setAISuggestions(process.workingBackwardsQuestions.aiSuggestions));
    }
  }
  
  // 3. Update PRFAQ data
  if (process.prfaq) {
    // Set PRFAQ title
    dispatch(updatePRFAQTitle(process.prfaq.title || ''));
    
    // Update press release fields
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
    
    // Update FAQs
    dispatch(setCustomerFAQs(process.prfaq.customerFaqs || []));
    dispatch(setStakeholderFAQs(process.prfaq.stakeholderFaqs || []));
  }
  
  // 4. Update assumptions if present (using session actions)
  if (process.assumptions && process.assumptions.length > 0) {
    // First reset existing assumptions
    dispatch({ type: 'session/resetAssumptions' });
    
    // Then add each assumption
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
  
  // 5. Update experiments if present (using session actions)
  if (process.experiments && process.experiments.length > 0) {
    // First reset existing experiments
    dispatch({ type: 'session/resetExperiments' });
    
    // Then add each experiment
    process.experiments.forEach(experiment => {
      dispatch({ 
        type: 'session/addExperiment', 
        payload: experiment 
      });
    });
  }
}; 