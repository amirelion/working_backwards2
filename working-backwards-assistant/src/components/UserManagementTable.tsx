import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  Box,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';
import { UserProfile, UserRole } from '../types/auth';

interface UserManagementTableProps {
  users: UserProfile[];
  onUserUpdated: () => void;
}

const ROLE_OPTIONS: UserRole[] = ['free', 'trial', 'premium', 'admin'];

export default function UserManagementTable({ users, onUserUpdated }: UserManagementTableProps) {
  const [pendingChanges, setPendingChanges] = useState<Record<string, UserRole>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    try {
      // Process all pending changes
      await Promise.all(
        Object.entries(pendingChanges).map(async ([userId, newRole]) => {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            role: newRole,
            // Update related fields based on role
            maxSessions: newRole === 'free' ? 3 : 999,
            ...(newRole === 'trial' && {
              trialStartDate: new Date(),
              trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
            })
          });
        })
      );

      setSnackbar({
        open: true,
        message: 'User roles updated successfully',
        severity: 'success'
      });
      setPendingChanges({});
      onUserUpdated(); // Refresh the users list
    } catch (error) {
      console.error('Error updating user roles:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update user roles',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Box>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Current Role</TableCell>
              <TableCell>New Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>
                  <Typography variant="body2">
                    {user.displayName || 'No name'}
                  </Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Select
                    value={pendingChanges[user.uid] || user.role}
                    onChange={(e: SelectChangeEvent<UserRole>) => 
                      handleRoleChange(user.uid, e.target.value as UserRole)
                    }
                    size="small"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {hasChanges && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 