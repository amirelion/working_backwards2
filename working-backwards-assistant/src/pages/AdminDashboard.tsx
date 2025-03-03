import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
} from '@mui/material';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check if there are any admin users
        const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
        const adminSnapshot = await getDocs(adminQuery);
        
        if (adminSnapshot.empty) {
          setError('Access denied. No admin users found.');
          navigate('/');
          return;
        }

        // Fetch all users for the admin dashboard
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error('Error checking admin access:', err);
        setError('Error accessing admin dashboard');
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box p={4}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Users ({users.length})
        </Typography>
        
        {users.map(user => (
          <Paper key={user.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {user.email} ({user.role})
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </Paper>
        ))}
      </Box>
    </Container>
  );
} 