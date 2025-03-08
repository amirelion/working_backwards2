import { AssumptionStatus } from '../types';

// Get color for status
export const getStatusColor = (status: AssumptionStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'validated':
      return 'success';
    case 'invalidated':
      return 'error';
    case 'in_progress':
      return 'info';
    case 'partially_validated':
      return 'warning';
    case 'inconclusive':
      return 'secondary';
    case 'unvalidated':
    default:
      return 'default';
  }
};

// Get human-readable label for status
export const getStatusLabel = (status: AssumptionStatus): string => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'partially_validated':
      return 'Partially Validated';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// Get description for status
export const getStatusDescription = (status: AssumptionStatus): string => {
  switch (status) {
    case 'unvalidated':
      return 'This assumption has not been tested yet';
    case 'in_progress':
      return 'Testing for this assumption is currently underway';
    case 'validated':
      return 'Testing has confirmed this assumption is true';
    case 'invalidated':
      return 'Testing has proven this assumption is false';
    case 'partially_validated':
      return 'There is some evidence supporting this assumption, but more testing is needed';
    case 'inconclusive':
      return 'Testing results were unclear or contradictory';
    default:
      return '';
  }
}; 