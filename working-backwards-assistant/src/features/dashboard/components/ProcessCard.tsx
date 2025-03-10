import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  IconButton, 
  Divider, 
  Button
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  Update as UpdateIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { ProcessCardProps } from '../types';

/**
 * Component for displaying a single process card in the dashboard grid
 */
const ProcessCard: React.FC<ProcessCardProps> = ({ 
  process, 
  onOpenProcess, 
  onMenuOpen,
  isBeingDeleted = false 
}) => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
    && window.matchMedia 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Define animation durations based on user preferences
  const transitionDuration = prefersReducedMotion ? '0.2s' : '0.8s';
  const opacityDuration = prefersReducedMotion ? '0.3s' : '1.2s';
  
  return (
    <Card
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: `transform ${transitionDuration}, box-shadow ${transitionDuration}, opacity ${opacityDuration}, background-color ${transitionDuration}`,
        '&:hover': {
          transform: isBeingDeleted ? 'none' : 'translateY(-4px)',
          boxShadow: isBeingDeleted ? undefined : '0 4px 20px rgba(0,0,0,0.1)',
        },
        opacity: isBeingDeleted ? 0 : 1,
        transform: isBeingDeleted ? 'scale(0.95)' : 'scale(1)',
        pointerEvents: isBeingDeleted ? 'none' : 'auto',
        backgroundColor: isBeingDeleted ? 'rgba(255, 200, 200, 0.8)' : 'inherit',
        borderColor: isBeingDeleted ? '#ff6b6b' : 'inherit',
        borderWidth: isBeingDeleted ? 1 : 0,
        borderStyle: isBeingDeleted ? 'solid' : 'none'
      }}
      role="article"
      aria-label={`Process: ${process.title}`}
      aria-busy={isBeingDeleted}
    >
      <CardContent 
        sx={{ flexGrow: 1, cursor: isBeingDeleted ? 'default' : 'pointer' }} 
        onClick={() => !isBeingDeleted && onOpenProcess(process.id)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h2" noWrap sx={{ maxWidth: '80%' }}>
            {process.title}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => !isBeingDeleted && onMenuOpen(e, process.id)}
            aria-label="process options"
            disabled={isBeingDeleted}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Created: {process.createdAt ? format(new Date(process.createdAt), 'MMM d, yyyy') : 'Unknown date'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UpdateIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Updated: {process.updatedAt ? formatDistanceToNow(new Date(process.updatedAt), { addSuffix: true }) : 'Unknown'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button
          size="small"
          startIcon={<LaunchIcon />}
          onClick={() => !isBeingDeleted && onOpenProcess(process.id)}
          disabled={isBeingDeleted}
        >
          Open
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProcessCard; 