import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { 
  selectAISuggestions, 
  addAISuggestion
} from '../../../store/workingBackwardsSlice';
import { getAIResponse, getWorkingBackwardsPrompt } from '../../../services/aiService';
import { WorkingBackwardsQuestion } from '../constants/questions';
import { 
  selectInitialThoughts, 
  selectSkipInitialThoughts
} from '../../../store/initialThoughtsSlice';
import { useCurrentProcess } from '../../../hooks/useCurrentProcess';

/**
 * Custom hook for managing AI suggestions in the Working Backwards process
 */
export const useAISuggestions = () => {
  const aiSuggestions = useAppSelector(selectAISuggestions);
  const dispatch = useAppDispatch();
  const initialThoughts = useAppSelector(selectInitialThoughts);
  const skipInitialThoughts = useAppSelector(selectSkipInitialThoughts);
  const questionsState = useAppSelector((state: any) => state.workingBackwards.questions);
  const { setIsModified, saveCurrentProcess } = useCurrentProcess();
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isLoadingFirstSuggestion, setIsLoadingFirstSuggestion] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  /**
   * Get an AI suggestion for a specific question
   */
  const getAISuggestion = useCallback(async (currentQuestion: WorkingBackwardsQuestion, currentStep: number) => {
    // Don't generate suggestions if the user skipped initial thoughts or there are no initial thoughts
    if (skipInitialThoughts || !initialThoughts.trim()) {
      return;
    }
    
    setIsGeneratingSuggestion(true);
    try {
      // Create a context object from existing responses
      const contextObj: Record<string, string> = {};
      Object.entries(questionsState)
        .filter(([key]) => key !== 'aiSuggestions' && key !== currentQuestion.id)
        .forEach(([key, value]) => {
          if (typeof value === 'string') {
            contextObj[key] = value;
          }
        });
      
      const promptText = getWorkingBackwardsPrompt(currentQuestion.aiPrompt, contextObj, initialThoughts);
      
      console.log(`Generating suggestion for question: ${currentQuestion.label}`);
      
      // Call the AI service
      const response = await getAIResponse({
        prompt: promptText,
        model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
        provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
      });
      
      if (response.error) {
        console.error('AI suggestion error:', response.error);
        setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
      } else {
        setAiSuggestion(response.content);
        
        // Store the suggestion using Redux dispatch
        const questionKey = `${currentStep + 1}. ${currentQuestion.label}`;
        dispatch(addAISuggestion({ 
          question: questionKey, 
          suggestion: response.content 
        }));
        
        console.log(`Suggestion generated and stored for: ${questionKey}`);
        
        // Mark as modified
        setIsModified(true);
        
        // Always save to Firestore after generating a suggestion
        try {
          await saveCurrentProcess();
          console.log('Suggestion saved to Firestore');
        } catch (error) {
          console.error('Error saving process after generating suggestion:', error);
        }
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
    } finally {
      setIsGeneratingSuggestion(false);
    }
  }, [initialThoughts, dispatch, skipInitialThoughts, questionsState, setIsModified, saveCurrentProcess]);

  /**
   * Generate initial AI suggestions for all questions
   */
  const generateInitialSuggestions = useCallback(async (questionsList: WorkingBackwardsQuestion[], currentStep: number) => {
    // Don't generate suggestions if the user skipped initial thoughts or if there are no initial thoughts
    if (skipInitialThoughts || !initialThoughts.trim()) {
      console.log('Skipping initial suggestions - no initial thoughts or user opted to skip');
      return;
    }
    
    console.log('Starting to generate initial suggestions for all questions');
    setIsLoadingFirstSuggestion(true);
    
    try {
      // Create a context object from existing responses
      const contextObj: Record<string, string> = {};
      const suggestions: Record<string, string> = {};
      
      // Generate suggestions in sequence, building context as we go
      for (let i = 0; i < questionsList.length; i++) {
        const question = questionsList[i];
        const questionNumber = i + 1;
        const fullQuestionKey = `${questionNumber}. ${question.label}`;
        
        console.log(`Generating suggestion for question ${i+1}/${questionsList.length}: ${question.label}`);
        
        // Call the AI service
        const promptText = getWorkingBackwardsPrompt(question.aiPrompt, contextObj, initialThoughts);
        
        const response = await getAIResponse({
          prompt: promptText,
          model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
          provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
        });
        
        if (!response.error) {
          suggestions[fullQuestionKey] = response.content;
          
          // Add this suggestion to context for next questions
          contextObj[question.id] = response.content;
          
          // Update suggestions in state using Redux dispatch
          dispatch(addAISuggestion({ 
            question: fullQuestionKey, 
            suggestion: response.content 
          }));
          
          // If this is the first question and we're still on it, show the suggestion
          if (i === 0 && currentStep === 0) {
            setAiSuggestion(response.content);
          }
          
          // Save after each suggestion to ensure they're not lost
          setIsModified(true);
          // We don't await this to avoid slowing down the generation process
          if (i % 2 === 0) { // Save every couple of questions to reduce Firebase writes
            try {
              await saveCurrentProcess();
              console.log(`Saved progress after generating suggestion ${i+1}`);
            } catch (error) {
              console.error(`Error saving after suggestion ${i+1}:`, error);
            }
          }
        } else {
          console.error('Error generating suggestion:', response.error);
        }
      }
      
      // Final save after all suggestions are generated
      try {
        await saveCurrentProcess();
        console.log('All suggestions generated and saved to Firestore');
      } catch (error) {
        console.error('Error in final save after generating all suggestions:', error);
      }
    } catch (error) {
      console.error('Error generating initial AI suggestions:', error);
    } finally {
      setIsLoadingFirstSuggestion(false);
    }
  }, [initialThoughts, dispatch, skipInitialThoughts, setIsModified, saveCurrentProcess]);
  
  /**
   * Load a suggestion for the current question from state
   */
  const loadSuggestionForQuestion = useCallback((question: WorkingBackwardsQuestion, step: number) => {
    if (aiSuggestions) {
      const questionNumber = step + 1;
      const fullQuestionKey = `${questionNumber}. ${question.label}`;
      
      if (aiSuggestions[fullQuestionKey]) {
        setAiSuggestion(aiSuggestions[fullQuestionKey]);
        return true;
      }
    }
    setAiSuggestion('');
    return false;
  }, [aiSuggestions]);

  return {
    aiSuggestion,
    setAiSuggestion,
    isLoadingFirstSuggestion,
    isGeneratingSuggestion,
    getAISuggestion,
    generateInitialSuggestions,
    loadSuggestionForQuestion
  };
}; 