import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';
import { Box, Typography, Paper } from '@mui/material';

export default function TestPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        console.log('Fetching users from Firestore...');
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Found users:', usersData);
        setUsers(usersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users from Firestore');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Box p={4}>
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Firestore Users Test Page
      </Typography>
      
      {users.length === 0 ? (
        <Typography>No users found in the collection</Typography>
      ) : (
        users.map(user => (
          <Paper key={user.id} sx={{ p: 2, mb: 2 }}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </Paper>
        ))
      )}
    </Box>
  );
} 