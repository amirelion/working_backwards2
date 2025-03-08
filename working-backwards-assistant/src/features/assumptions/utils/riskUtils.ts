import { AssumptionImpact, AssumptionConfidence } from '../types';

// Get color associated with each impact level
export const getImpactColor = (impact: AssumptionImpact): 'error' | 'warning' | 'success' => {
  switch (impact) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'warning';
  }
};

// Get color associated with each confidence level
export const getConfidenceColor = (confidence: AssumptionConfidence): 'success' | 'warning' | 'error' => {
  switch (confidence) {
    case 'high':
      return 'success';
    case 'medium':
      return 'warning';
    case 'low':
      return 'error';
    default:
      return 'warning';
  }
};

// Get risk score (1-9) based on impact and confidence
export const getRiskScore = (impact: AssumptionImpact, confidence: AssumptionConfidence): number => {
  const impactScore = { high: 3, medium: 2, low: 1 };
  const confidenceScore = { low: 3, medium: 2, high: 1 };
  
  return impactScore[impact] * confidenceScore[confidence];
};

// Get risk category based on risk score
export const getRiskCategory = (score: number): 'high' | 'medium' | 'low' => {
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
};

// Get explanation for impact levels
export const getImpactExplanation = (impact: AssumptionImpact): string => {
  switch (impact) {
    case 'high':
      return 'If this assumption is wrong, the project will likely fail';
    case 'medium':
      return 'If this assumption is wrong, significant changes to the approach will be needed';
    case 'low':
      return 'If this assumption is wrong, minor adjustments will be needed';
    default:
      return '';
  }
};

// Get explanation for confidence levels
export const getConfidenceExplanation = (confidence: AssumptionConfidence): string => {
  switch (confidence) {
    case 'high':
      return 'We have strong evidence supporting this assumption';
    case 'medium':
      return 'We have some evidence, but more validation would be helpful';
    case 'low':
      return 'We have little to no evidence - this assumption needs testing';
    default:
      return '';
  }
}; 