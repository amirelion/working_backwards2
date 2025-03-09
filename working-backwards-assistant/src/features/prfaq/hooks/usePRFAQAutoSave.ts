import { useEffect, useRef, useState, useCallback } from 'react';
import { isEqual } from 'lodash';
import { PRFAQState } from '../../../store/prfaqSlice';
import { useCurrentProcess } from '../../../hooks/useCurrentProcess';
import { useProcessSync } from '../../../hooks/useProcessSync';

/**
 * Custom hook to manage auto-save functionality for the PRFAQ component
 * 
 * Features:
 * - Tracks changes by comparing current state with last saved state
 * - Debounces saves with a 5-second delay
 * - Pauses auto-save during AI generation
 * - Resumes auto-save after generation completes
 * - Provides manual save functionality
 */
export const usePRFAQAutoSave = (
  prfaq: PRFAQState,
  isGenerating: boolean,
  currentProcessId: string | null
) => {
  const { saveCurrentProcess } = useCurrentProcess();
  const { setIsModified } = useProcessSync();
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedState = useRef<PRFAQState | null>(null);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Function to check if there are actual changes - wrapped in useCallback to use in dependencies
  const hasChanges = useCallback(() => {
    if (!lastSavedState.current) return true;
    return !isEqual(prfaq, lastSavedState.current);
  }, [prfaq, lastSavedState]);
  
  // Schedule auto-save with debounce - wrapped in useCallback to use in dependencies
  const scheduleAutoSave = useCallback(() => {
    // Clear any existing timeout
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
      autoSaveTimeout.current = null;
    }
    
    // Only schedule if there are changes and we have a process ID
    if (hasChanges() && currentProcessId) {
      setIsModified(true);
      
      // Set new timeout (5 seconds)
      autoSaveTimeout.current = setTimeout(async () => {
        if (hasChanges() && currentProcessId) {
          try {
            setIsSaving(true);
            await saveCurrentProcess();
            // Update last saved state after successful save
            lastSavedState.current = JSON.parse(JSON.stringify(prfaq));
          } catch (error) {
            console.error('Auto-save failed:', error);
          } finally {
            setIsSaving(false);
          }
        } else {
          setIsModified(false);
        }
      }, 5000);
    }
  }, [hasChanges, currentProcessId, prfaq, saveCurrentProcess, setIsModified]);
  
  // Manual save function
  const saveNow = async () => {
    if (hasChanges() && currentProcessId) {
      try {
        setIsSaving(true);
        await saveCurrentProcess();
        // Update last saved state after successful save
        lastSavedState.current = JSON.parse(JSON.stringify(prfaq));
        return true;
      } catch (error) {
        console.error('Manual save failed:', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    }
    return false;
  };
  
  // Effect to handle auto-save based on state changes
  useEffect(() => {
    // Don't auto-save if AI is generating content
    if (!isGenerating) {
      scheduleAutoSave();
    }
    
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
        autoSaveTimeout.current = null;
      }
    };
  }, [prfaq, isGenerating, currentProcessId, scheduleAutoSave]);
  
  // Effect to save after generation completes
  useEffect(() => {
    // When generation finishes, schedule a save if we have changes
    if (!isGenerating && lastSavedState.current && hasChanges()) {
      scheduleAutoSave();
    }
  }, [isGenerating, hasChanges, scheduleAutoSave]);
  
  // Initialize lastSavedState on first render or when process ID changes
  useEffect(() => {
    if (currentProcessId) {
      lastSavedState.current = JSON.parse(JSON.stringify(prfaq));
    }
  }, [currentProcessId, prfaq]);
  
  return {
    isSaving,
    saveNow,
    hasUnsavedChanges: hasChanges
  };
};

export default usePRFAQAutoSave; 