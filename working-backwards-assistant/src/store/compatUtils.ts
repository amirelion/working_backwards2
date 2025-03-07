import { RootState } from './index';
import { Session } from '../types';

/**
 * Compatibility utilities to help transition from the old Redux state structure
 * to the new structure without breaking existing components
 */

/**
 * Legacy selector for getting session as a top-level object.
 * This maintains backward compatibility with components using the old state structure.
 */
export const legacySelectSession = (state: RootState): Session => state.session.currentSession;

/**
 * Legacy selector creator that maintains backward compatibility with the old selector pattern
 * @param selector A function that extracts a specific piece of the session
 */
export function createLegacySelector<T>(selector: (session: Session) => T) {
  return (state: RootState): T => selector(state.session.currentSession);
}

// Export commonly used selectors for backward compatibility
export const backwardCompatSelectors = {
  // These make state.session appear to have the same shape as before for existing components
  session: legacySelectSession,
  
  // These extract specific properties from the session for direct access
  workingBackwardsResponses: (state: RootState) => state.session.currentSession.workingBackwardsResponses,
  prfaq: (state: RootState) => state.session.currentSession.prfaq,
  assumptions: (state: RootState) => state.session.currentSession.assumptions,
  experiments: (state: RootState) => state.session.currentSession.experiments,
}; 