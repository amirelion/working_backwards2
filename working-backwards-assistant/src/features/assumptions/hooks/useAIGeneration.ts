import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getAIResponse } from '../../../services/aiService';
import { RootState } from '../../../store';
import { AssumptionCategory } from '../types';
import { backwardCompatSelectors } from '../../../store/compatUtils';
import { useAssumptions } from './useAssumptions';
import { getGenerateAssumptionsPrompt } from '../../../features/ai-services/prompt-generators/assumptions/assumptionPrompts';

interface UseAIGenerationReturn {
  generatedAssumptions: Array<{ statement: string; category: AssumptionCategory }>;
  isGenerating: boolean;
  generateAssumptions: (category: AssumptionCategory, customPrompt?: string) => Promise<void>;
  addGeneratedAssumption: (statement: string, category: AssumptionCategory) => void;
  clearGeneratedAssumptions: () => void;
}

export const useAIGeneration = (): UseAIGenerationReturn => {
  const { addAssumption } = useAssumptions();
  const prfaq = useSelector((state: RootState) => backwardCompatSelectors.prfaq(state));
  const workingBackwardsResponses = useSelector((state: RootState) => 
    backwardCompatSelectors.workingBackwardsResponses(state)
  );
  
  // State for generated assumptions
  const [generatedAssumptions, setGeneratedAssumptions] = useState<Array<{
    statement: string;
    category: AssumptionCategory;
  }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Handle generating assumptions for a specific category
  const generateAssumptions = useCallback(async (
    category: AssumptionCategory,
    customPrompt?: string
  ) => {
    setIsGenerating(true);
    
    try {
      // Get the prompt from the prompt generator
      const prompt = getGenerateAssumptionsPrompt({
        prfaq,
        workingBackwards: workingBackwardsResponses,
        category,
        customInstructions: customPrompt
      });
      
      // Call AI service with the generated prompt
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || 'gpt-4o',
        provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
      });
      
      if (response.error) {
        console.error('AI generation error:', response.error);
        throw new Error(response.error);
      }
      
      // Parse the response to extract assumptions
      const assumptionLines = response.content
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      // Create new generated assumptions array
      const newAssumptions = assumptionLines.map(statement => ({
        statement,
        category
      }));
      
      // Update state with generated assumptions
      setGeneratedAssumptions(newAssumptions);
    } catch (error) {
      console.error('Error generating assumptions:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [prfaq, workingBackwardsResponses]);
  
  // Add a generated assumption
  const addGeneratedAssumption = useCallback((statement: string, category: AssumptionCategory) => {
    addAssumption({
      statement,
      description: '',
      category,
      impact: 'medium',
      confidence: 'medium',
      priority: 0,
      status: 'unvalidated',
      relatedExperiments: []
    });
    
    // Remove from generated list
    setGeneratedAssumptions(prev => prev.filter(a => a.statement !== statement));
  }, [addAssumption]);
  
  // Clear all generated assumptions
  const clearGeneratedAssumptions = useCallback(() => {
    setGeneratedAssumptions([]);
  }, []);
  
  return {
    generatedAssumptions,
    isGenerating,
    generateAssumptions,
    addGeneratedAssumption,
    clearGeneratedAssumptions
  };
}; 