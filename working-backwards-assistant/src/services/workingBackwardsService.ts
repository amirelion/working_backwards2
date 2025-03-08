import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';
import { WorkingBackwardsProcess, WorkingBackwardsProcessSummary } from '../types/workingBackwards';

// Collection reference
const processesCollection = collection(db, 'workingBackwardsProcesses');

/**
 * Create a new Working Backwards process
 */
export const createProcess = async (userId: string, title: string, initialThoughts: string = ''): Promise<string> => {
  try {
    const processData = {
      userId,
      title,
      initialThoughts,
      workingBackwardsQuestions: {
        customer: '',
        problem: '',
        benefit: '',
        validation: '',
        experience: '',
        aiSuggestions: {}
      },
      prfaq: {
        title: '',
        pressRelease: {
          introduction: '',
          problemStatement: '',
          solution: '',
          stakeholderQuote: '',
          customerJourney: '',
          customerQuote: '',
          callToAction: ''
        },
        customerFaqs: [],
        stakeholderFaqs: []
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(processesCollection, processData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating process:', error);
    throw new Error(`Failed to create process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get all Working Backwards processes for a user
 */
export const getUserProcesses = async (userId: string): Promise<WorkingBackwardsProcessSummary[]> => {
  try {
    // Using only a single where clause to avoid requiring a composite index
    const q = query(
      processesCollection, 
      where('userId', '==', userId)
      // Removed the orderBy clause that was causing the index requirement
    );
    
    const querySnapshot = await getDocs(q);
    const processes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    });
    
    // Sort the results in memory instead of using orderBy in the query
    return processes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error getting user processes:', error);
    throw new Error(`Failed to get user processes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get a specific Working Backwards process by ID
 */
export const getProcessById = async (processId: string): Promise<WorkingBackwardsProcess | null> => {
  try {
    const docRef = doc(processesCollection, processId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        initialThoughts: data.initialThoughts || '',
        workingBackwardsQuestions: data.workingBackwardsQuestions || {
          customer: '',
          problem: '',
          benefit: '',
          validation: '',
          experience: '',
          aiSuggestions: {}
        },
        prfaq: data.prfaq,
        assumptions: data.assumptions,
        experiments: data.experiments,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting process:', error);
    throw new Error(`Failed to get process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Update a Working Backwards process
 */
export const updateProcess = async (processId: string, processData: Partial<WorkingBackwardsProcess>): Promise<void> => {
  try {
    const docRef = doc(processesCollection, processId);
    
    // Remove id and userId from update data
    const { id, userId, createdAt, ...updateData } = processData as any;
    
    // Add server timestamp for updatedAt
    updateData.updatedAt = serverTimestamp();
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating process:', error);
    throw new Error(`Failed to update process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Update specific fields of a Working Backwards process
 * This is more efficient than updating the entire process
 */
export const updateProcessFields = async (
  processId: string, 
  fields: Record<string, any>
): Promise<void> => {
  try {
    const docRef = doc(processesCollection, processId);
    
    // Add server timestamp for updatedAt
    fields.updatedAt = serverTimestamp();
    
    await updateDoc(docRef, fields);
  } catch (error) {
    console.error('Error updating process fields:', error);
    throw new Error(`Failed to update process fields: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Batch update multiple processes
 */
export const batchUpdateProcesses = async (
  updates: Array<{ id: string; data: Partial<WorkingBackwardsProcess> }>
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      const docRef = doc(processesCollection, id);
      
      // Remove id and userId from update data
      const { id: _, userId, createdAt, ...updateData } = data as any;
      
      // Add server timestamp for updatedAt
      updateData.updatedAt = serverTimestamp();
      
      batch.update(docRef, updateData);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error batch updating processes:', error);
    throw new Error(`Failed to batch update processes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Rename a Working Backwards process
 */
export const renameProcess = async (processId: string, newTitle: string): Promise<void> => {
  try {
    await updateProcessFields(processId, { title: newTitle });
  } catch (error) {
    console.error('Error renaming process:', error);
    throw new Error(`Failed to rename process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a Working Backwards process
 */
export const deleteProcess = async (processId: string): Promise<void> => {
  try {
    const docRef = doc(processesCollection, processId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting process:', error);
    throw new Error(`Failed to delete process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Subscribe to real-time updates for a user's processes
 */
export const subscribeToUserProcesses = (
  userId: string, 
  onUpdate: (processes: WorkingBackwardsProcessSummary[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    processesCollection,
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const processes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
      
      // Sort the results in memory
      processes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      onUpdate(processes);
    },
    (error) => {
      console.error('Error in processes subscription:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Subscribe to real-time updates for a specific process
 */
export const subscribeToProcess = (
  processId: string,
  onUpdate: (process: WorkingBackwardsProcess | null) => void,
  onError?: (error: Error) => void
) => {
  const docRef = doc(processesCollection, processId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onUpdate({
          id: docSnap.id,
          userId: data.userId,
          title: data.title,
          initialThoughts: data.initialThoughts || '',
          workingBackwardsQuestions: data.workingBackwardsQuestions || {
            customer: '',
            problem: '',
            benefit: '',
            validation: '',
            experience: '',
            aiSuggestions: {}
          },
          prfaq: data.prfaq,
          assumptions: data.assumptions,
          experiments: data.experiments,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error('Error in process subscription:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Duplicate a Working Backwards process
 */
export const duplicateProcess = async (processId: string, newTitle?: string): Promise<string> => {
  try {
    // Get the original process
    const originalProcess = await getProcessById(processId);
    
    if (!originalProcess) {
      throw new Error('Process not found');
    }
    
    // Create a new process with the same data
    const processData = {
      userId: originalProcess.userId,
      title: newTitle || `${originalProcess.title} (Copy)`,
      initialThoughts: originalProcess.initialThoughts,
      workingBackwardsQuestions: originalProcess.workingBackwardsQuestions,
      prfaq: originalProcess.prfaq,
      assumptions: originalProcess.assumptions,
      experiments: originalProcess.experiments,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(processesCollection, processData);
    return docRef.id;
  } catch (error) {
    console.error('Error duplicating process:', error);
    throw new Error(`Failed to duplicate process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Archive a Working Backwards process
 * This doesn't delete the process, but marks it as archived
 */
export const archiveProcess = async (processId: string): Promise<void> => {
  try {
    await updateProcessFields(processId, { archived: true });
  } catch (error) {
    console.error('Error archiving process:', error);
    throw new Error(`Failed to archive process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Unarchive a Working Backwards process
 */
export const unarchiveProcess = async (processId: string): Promise<void> => {
  try {
    await updateProcessFields(processId, { archived: false });
  } catch (error) {
    console.error('Error unarchiving process:', error);
    throw new Error(`Failed to unarchive process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 