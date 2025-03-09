import { store } from '../store/rootStore';

/**
 * Logs the current Redux state to the console
 * @param showFullState Whether to show the full state or just a summary
 */
export const logState = (showFullState = false) => {
  const state = store.getState();
  
  // Create a simplified summary of the state
  const summary = {
    assumptions: state.session.currentSession.assumptions.length,
    experiments: state.session.currentSession.experiments.length,
    updatedAt: state.session.currentSession.updatedAt,
    status: state.session.status
  };
  
  console.log('[debugUtils] Current Redux state summary:', summary);
  
  if (showFullState) {
    console.log('[debugUtils] Full Redux state:', state);
  }
};

/**
 * Logs detailed information about assumptions in the Redux store
 */
export const logAssumptions = () => {
  const state = store.getState();
  const assumptions = state.session.currentSession.assumptions;
  
  console.log(`[debugUtils] Current assumptions (${assumptions.length}):`);
  assumptions.forEach(assumption => {
    console.log(`[debugUtils] Assumption ${assumption.id}:`, {
      statement: assumption.statement.substring(0, 30) + (assumption.statement.length > 30 ? '...' : ''),
      category: assumption.category,
      impact: assumption.impact,
      confidence: assumption.confidence,
      status: assumption.status
    });
  });
}; 