import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';
import { WorkingBackwardsProcess } from '../types/workingBackwards';
import * as workingBackwardsService from './workingBackwardsService';

// Constants
const MIN_SAVE_DELAY = 300; // ms
const MIN_DELETE_ANIMATION_TIME = 500; // ms

// Cache for throttling saves
const saveCache = {
  lastSaveTime: 0,
  pendingSave: false,
};

/**
 * Save the current process with throttling to prevent excessive Firestore writes
 */
export const saveProcess = async (
  processId: string,
  data: Partial<WorkingBackwardsProcess>
): Promise<void> => {
  console.log('[saveService] saveProcess called with processId:', processId);
  console.log('[saveService] data to save:', {
    ...data,
    assumptions: data.assumptions ? `${data.assumptions.length} assumptions` : 'none',
    experiments: data.experiments ? `${data.experiments.length} experiments` : 'none'
  });
  
  // If we just saved recently, delay this save to prevent excessive writes
  const now = Date.now();
  const timeSinceLastSave = now - saveCache.lastSaveTime;
  
  try {
    if (timeSinceLastSave < MIN_SAVE_DELAY) {
      // If already has a pending save, don't queue another one
      if (saveCache.pendingSave) {
        console.log('[saveService] Save already pending, skipping this save request');
        return;
      }
      
      console.log('[saveService] Throttling save, will save after delay');
      // Queue a save after delay
      saveCache.pendingSave = true;
      
      await new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
          try {
            await performSave(processId, data);
            saveCache.pendingSave = false;
            resolve();
          } catch (error) {
            console.error('[saveService] Error in delayed save:', error);
            saveCache.pendingSave = false;
            reject(error);
          }
        }, MIN_SAVE_DELAY - timeSinceLastSave);
      });
    } else {
      // Can save immediately
      console.log('[saveService] Saving immediately');
      await performSave(processId, data);
    }
    
    // Force update the lastSaveTime to prevent immediate re-saves
    saveCache.lastSaveTime = Date.now();
    console.log('[saveService] Save operation completed successfully at:', new Date().toISOString());
    return;
  } catch (error) {
    console.error('[saveService] Save operation failed:', error);
    throw error;
  }
};

/**
 * Perform the actual save operation
 */
const performSave = async (
  processId: string,
  data: Partial<WorkingBackwardsProcess>
): Promise<void> => {
  console.log('[saveService] performSave executing for processId:', processId);
  
  try {
    // Get reference to the process document
    const docRef = doc(db, 'workingBackwardsProcesses', processId);
    
    // Filter out keys that shouldn't be updated
    const { id, userId, createdAt, ...updateData } = data as any;
    
    // Add server timestamp for updatedAt
    updateData.updatedAt = serverTimestamp();
    
    console.log('[saveService] Final data being written to Firestore:', {
      ...updateData,
      prfaq: updateData.prfaq ? {
        title: updateData.prfaq.title,
        pressRelease: Object.keys(updateData.prfaq.pressRelease || {}).join(', '),
        customerFaqs: updateData.prfaq.customerFaqs?.length || 0,
        stakeholderFaqs: updateData.prfaq.stakeholderFaqs?.length || 0,
      } : 'none',
      assumptions: updateData.assumptions ? `${updateData.assumptions.length} assumptions` : 'none',
      experiments: updateData.experiments ? `${updateData.experiments.length} experiments` : 'none'
    });
    
    // Check explicitly for assumptions and experiments
    if (updateData.assumptions?.length > 0) {
      console.log('[saveService] Sample of assumptions being saved to Firestore:', 
        updateData.assumptions.slice(0, 2).map((a: { id: string; statement?: string; status?: string }) => ({ 
          id: a.id, 
          statement: a.statement?.substring(0, 20) + '...' || '',
          status: a.status || 'unvalidated' 
        }))
      );
    } else {
      console.warn('[saveService] No assumptions in update data!');
    }
    
    // Update the document
    await updateDoc(docRef, updateData);
    
    // Update cache
    saveCache.lastSaveTime = Date.now();
    
    console.log('[saveService] Process saved successfully:', processId);
  } catch (error) {
    console.error('[saveService] Error saving process:', error);
    throw new Error(`Failed to save process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a process with animation timing
 */
export const deleteProcessWithAnimation = async (processId: string): Promise<void> => {
  const startTime = Date.now();
  
  try {
    // Perform the actual deletion
    await workingBackwardsService.deleteProcess(processId);
    
    // Calculate elapsed time
    const elapsedTime = Date.now() - startTime;
    
    // If deletion was faster than our minimum animation time, wait to give UI feedback
    if (elapsedTime < MIN_DELETE_ANIMATION_TIME) {
      await new Promise(resolve => setTimeout(resolve, MIN_DELETE_ANIMATION_TIME - elapsedTime));
    }
  } catch (error) {
    console.error('Error deleting process:', error);
    throw new Error(`Failed to delete process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if the process data structure is valid
 */
export const validateProcessData = (data: Partial<WorkingBackwardsProcess>): boolean => {
  // Basic validation to ensure we don't save corrupted data
  // Check that required fields are present and have the right type
  
  // Return false if no data
  if (!data) return false;
  
  // Checks for specific parts of the data structure
  const hasValidAssumptions = !data.assumptions || Array.isArray(data.assumptions);
  const hasValidExperiments = !data.experiments || Array.isArray(data.experiments);
  
  return hasValidAssumptions && hasValidExperiments;
}; 