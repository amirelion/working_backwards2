import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';
import { useAuth } from '../hooks/useAuth';

export default function DebugProfile() {
  const { currentUser, loading, error: authError } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('DebugProfile: auth state:', {
      hasCurrentUser: !!currentUser,
      userEmail: currentUser?.email,
      loading,
      authError
    });

    async function fetchUserData() {
      if (!currentUser) {
        console.log('DebugProfile: No current user');
        setUserData(null);
        return;
      }

      try {
        console.log('DebugProfile: Fetching user document for:', currentUser.uid);
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          console.log('DebugProfile: Found user document:', userDoc.data());
          setUserData(userDoc.data());
          setError(null);
        } else {
          console.log('DebugProfile: No user document found');
          setError('No user document found');
        }
      } catch (err) {
        console.error('DebugProfile: Error fetching user document:', err);
        setError('Error fetching user data');
      }
    }

    fetchUserData();
  }, [currentUser, loading, authError]);

  if (loading) {
    return <div className="p-4">Loading authentication...</div>;
  }

  if (!currentUser) {
    return <div className="p-4">Please sign in to view debug info</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Debug Info</h2>
      <div className="mb-4">
        <h3 className="font-semibold">Auth User:</h3>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          }, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold">Firestore User Document:</h3>
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(userData, null, 2)}
          </pre>
        )}
      </div>

      {authError && (
        <div className="mt-4">
          <h3 className="font-semibold text-red-600">Auth Error:</h3>
          <div className="text-red-600">{authError}</div>
        </div>
      )}
    </div>
  );
} 