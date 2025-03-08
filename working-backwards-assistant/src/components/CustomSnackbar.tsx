import React from 'react';
import { Alert, AlertProps, Slide, Snackbar, SlideProps } from '@mui/material';

interface CustomSnackbarProps extends Omit<AlertProps, 'children'> {
  open: boolean;
  message: string;
  onClose: () => void;
  autoHideDuration?: number | null;
}

export default function CustomSnackbar({ 
  open, 
  message, 
  onClose,
  severity = 'info',
  autoHideDuration = null,
  ...props 
}: CustomSnackbarProps) {
  if (!open) return null;

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
      TransitionComponent={Slide}
      TransitionProps={{ direction: "down" } as SlideProps}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        clickAwayListener: {
          mouseEvent: false,
          touchEvent: false
        }
      }}
    >
      <Alert
        {...props}
        severity={severity}
        onClose={onClose}
        variant="filled"
        sx={{
          boxShadow: 6,
          ...props.sx
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
} 