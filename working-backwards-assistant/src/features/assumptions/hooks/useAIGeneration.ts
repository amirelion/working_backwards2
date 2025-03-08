import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getAIResponse } from '../../../services/aiService';
import { RootState } from '../../../store';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AssumptionCategory, EnhancedAssumption } from '../types';
import { backwardCompatSelectors } from '../../../store/compatUtils';
import { useAssumptions } from './useAssumptions';

export const useAIGeneration = () => {
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
      // Create prompt context
      const contextData = {
        prfaq: {
          title: prfaq.title,
          pressRelease: {
            summary: prfaq.pressRelease.summary,
            problem: prfaq.pressRelease.problem,
            solution: prfaq.pressRelease.solution,
            executiveQuote: prfaq.pressRelease.executiveQuote,
            customerJourney: prfaq.pressRelease.customerJourney,
            customerQuote: prfaq.pressRelease.customerQuote,
          }
        },
        workingBackwards: workingBackwardsResponses,
        category,
        customInstructions: customPrompt || ''
      };
      
      // Call AI service with appropriate prompt
      const promptTemplate = `You are an expert in product innovation and assumption identification for the Amazon Working Backwards process.

Based on the following information about a product or service, generate 5 key ${category} assumptions that should be validated.

Context:
${JSON.stringify(contextData, null, 2)}

${customPrompt ? `Additional instructions: ${customPrompt}` : ''}

For ${category} assumptions, focus on:
${getCategoryPromptGuidance(category)}

Format your response as follows:
1. [Assumption statement 1]
2. [Assumption statement 2]
3. [Assumption statement 3]
...and so on.

Each assumption should be concise, testable, and specific. Do not include any explanations, just the assumption statements.`;
      
      const response = await getAIResponse({
        prompt: promptTemplate,
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
  
  // Helper function to get category-specific prompt guidance
  const getCategoryPromptGuidance = (category: AssumptionCategory): string => {
    switch (category) {
      case 'customer':
        return `• Who are the customers?
- What problem do they have?
- How important is this problem to them?
- Would they pay for a solution?
- What are their key needs and pain points?`;
      
      case 'solution':
        return `• Does our solution solve the problem?
- Is it better than alternatives?
- Can we build it with our resources?
- Will customers understand how to use it?
- What technical challenges might we face?`;
      
      case 'business':
        return `• Will customers pay our price?
- Is our cost structure sustainable?
- Can we reach customers efficiently?
- Is the market large enough?
- Is our revenue model viable?`;
      
      case 'market':
        return `• Is the timing right for this innovation?
- How will competitors respond?
- Are there regulatory concerns?
- Are there technological dependencies?
- What market trends might impact success?`;
      
      default:
        return '';
    }
  };
  
  return {
    generatedAssumptions,
    isGenerating,
    generateAssumptions,
    addGeneratedAssumption
  };
}; 