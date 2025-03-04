import React from 'react';
import { Alert, AlertProps, Slide } from '@mui/material';

interface CustomSnackbarProps extends Omit<AlertProps, 'children'> {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function CustomSnackbar({ 
  open, 
  message, 
  onClose,
  severity = 'info',
  ...props 
}: CustomSnackbarProps) {
  if (!open) return null;

  return (
    <Slide direction="down" in={open} mountOnEnter unmountOnExit>
      <Alert
        {...props}
        severity={severity}
        onClose={onClose}
        sx={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          minWidth: '300px',
          maxWidth: '80%',
          boxShadow: 6,
          ...props.sx
        }}
      >
        {message}
      </Alert>
    </Slide>
  );
} 