import { Session } from '../types';
import { SessionState } from '../features/session/types';

const SESSION_STORAGE_KEY = 'working_backwards_session';

// Save session to localStorage - can handle both Session and SessionState
export const saveSession = (sessionData: Session | SessionState): void => {
  try {
    // If the input is a SessionState, extract the currentSession
    const session = 'currentSession' in sessionData 
      ? sessionData.currentSession 
      : sessionData;
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session to localStorage:', error);
  }
};

// Load session from localStorage
export const loadSession = (): Session | null => {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData) as Session;
    }
    return null;
  } catch (error) {
    console.error('Error loading session from localStorage:', error);
    return null;
  }
};

// Clear session from localStorage
export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing session from localStorage:', error);
  }
};

// Export session as JSON file
export const exportSessionAsJson = (session: Session): void => {
  try {
    const dataStr = JSON.stringify(session, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `working-backwards-${session.id.slice(0, 8)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error('Error exporting session as JSON:', error);
  }
};

// Import session from JSON file
export const importSessionFromJson = (file: File): Promise<Session> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const session = JSON.parse(result) as Session;
          resolve(session);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

const sessionStorage = {
  saveSession,
  loadSession,
  clearSession,
  exportSessionAsJson,
  importSessionFromJson,
};

export default sessionStorage; 