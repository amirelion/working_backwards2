export type AssumptionCategory = 'customer' | 'solution' | 'business' | 'market';
export type AssumptionImpact = 'high' | 'medium' | 'low';
export type AssumptionConfidence = 'high' | 'medium' | 'low';
export type AssumptionStatus = 'unvalidated' | 'in_progress' | 'validated' | 'invalidated' | 'partially_validated' | 'inconclusive';

// Enhanced Assumption type that extends the basic Assumption type
export interface EnhancedAssumption {
  id: string;
  statement: string;
  description: string;
  category: AssumptionCategory;
  impact: AssumptionImpact;
  confidence: AssumptionConfidence;
  priority: number;
  status: AssumptionStatus;
  relatedExperiments?: string[];
}

// Form state for new assumptions
export interface AssumptionFormState {
  statement: string;
  description: string;
  category: AssumptionCategory;
  impact: AssumptionImpact;
  confidence: AssumptionConfidence;
}

// Tab properties interface
export interface AssumptionTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

// Panel properties interface
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
} 