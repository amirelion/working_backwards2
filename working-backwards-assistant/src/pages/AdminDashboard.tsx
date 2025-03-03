import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import { UserProfile } from '../types/auth';
import UserManagementTable from '../components/UserManagementTable';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const { isAdmin } = useAuth();

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        email: doc.data().email || '',
        displayName: doc.data().displayName || '',
        photoURL: doc.data().photoURL || '',
        role: doc.data().role || 'free',
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLoginAt: doc.data().lastLoginAt?.toDate() || new Date(),
        sessionCount: doc.data().sessionCount || 0,
        maxSessions: doc.data().maxSessions || 3,
        trialStartDate: doc.data().trialStartDate?.toDate(),
        trialEndDate: doc.data().trialEndDate?.toDate(),
      })) as UserProfile[];
      
      console.log('Fetched users:', usersData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error loading user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminDashboard mounted, isAdmin:', isAdmin);
    fetchUsers();
  }, [isAdmin]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  console.log('Rendering AdminDashboard with users:', users);

  return (
    <ProtectedRoute requireAdmin>
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage user roles and permissions. Changes will take effect immediately.
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <UserManagementTable 
                users={users} 
                onUserUpdated={fetchUsers}
              />
            )}
          </Paper>
        </Box>
      </Container>
    </ProtectedRoute>
  );
} 