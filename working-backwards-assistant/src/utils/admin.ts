import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';
import { UserProfile } from '../types/auth';

export async function initializeAdminUser(user: any) {
  console.log('Initializing admin user:', user?.uid);
  if (!user) {
    console.log('No user provided to initializeAdminUser');
    return;
  }
  
  const adminUser: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    role: 'admin',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    sessionCount: 0,
    maxSessions: 999
  };

  try {
    console.log('Attempting to create admin user document:', adminUser);
    await setDoc(doc(db, 'users', user.uid), adminUser);
    console.log('Admin user initialized successfully');
  } catch (error) {
    console.error('Error initializing admin user:', error);
    console.error('Error details:', JSON.stringify(error));
  }
} 