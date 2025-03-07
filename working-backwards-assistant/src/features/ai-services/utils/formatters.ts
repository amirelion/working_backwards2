/**
 * Prompt Formatting Utilities
 * Helper functions for formatting context and prompt data
 */

import { WorkingBackwardsResponses, PRFAQ, FAQ } from '../../../types';

/**
 * Formats context data for PRFAQ prompts
 * 
 * @param responses - WorkingBackwards responses
 * @param currentPRFAQ - Current PRFAQ object with existing content
 * @param userComment - Optional user comment for context
 * @param sectionToRegenerate - Optional section being regenerated (for highlighting)
 * @returns Formatted context string
 */
export const formatPRFAQContext = (
  responses: WorkingBackwardsResponses,
  currentPRFAQ: Partial<PRFAQ> = {},
  userComment?: string,
  sectionToRegenerate?: string
): string => {
  let context = `Information about the customer and problem:\n`;
  
  // Add Working Backwards responses
  context += Object.entries(responses)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  
  // Add current PRFAQ content if available
  if (currentPRFAQ.title) {
    const isSectionToRegenerate = sectionToRegenerate === 'title';
    context += `\n\nCurrent Title: ${currentPRFAQ.title}`;
    if (isSectionToRegenerate) {
      context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
    }
  }
  
  if (currentPRFAQ.pressRelease) {
    const pr = currentPRFAQ.pressRelease;
    
    if (pr.summary) {
      const isSectionToRegenerate = sectionToRegenerate === 'summary';
      context += `\n\nFirst Paragraph (Summary): ${pr.summary}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.problem) {
      const isSectionToRegenerate = sectionToRegenerate === 'problem';
      context += `\n\nSecond Paragraph (Problem/Opportunity): ${pr.problem}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.solution) {
      const isSectionToRegenerate = sectionToRegenerate === 'solution';
      context += `\n\nThird Paragraph (Solution): ${pr.solution}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.executiveQuote) {
      const isSectionToRegenerate = sectionToRegenerate === 'executiveQuote';
      context += `\n\nFourth Paragraph (Executive Quote): ${pr.executiveQuote}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.customerJourney) {
      const isSectionToRegenerate = sectionToRegenerate === 'customerJourney';
      context += `\n\nFifth Paragraph (Customer Journey): ${pr.customerJourney}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.customerQuote) {
      const isSectionToRegenerate = sectionToRegenerate === 'customerQuote';
      context += `\n\nSixth Paragraph (Customer Quote): ${pr.customerQuote}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
    
    if (pr.gettingStarted) {
      const isSectionToRegenerate = sectionToRegenerate === 'gettingStarted';
      context += `\n\nLast Line (Call to Action): ${pr.gettingStarted}`;
      if (isSectionToRegenerate) {
        context += ` [THIS IS THE SECTION YOU ARE REVISING]`;
      }
    }
  }
  
  return context;
}; 