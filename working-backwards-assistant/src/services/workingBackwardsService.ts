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
  Timestamp, 
  serverTimestamp, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(processesCollection, processData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating process:', error);
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
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