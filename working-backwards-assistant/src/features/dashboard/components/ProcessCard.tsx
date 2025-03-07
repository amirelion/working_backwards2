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
  onMenuOpen 
}) => {
  return (
    <Card
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      <CardContent 
        sx={{ flexGrow: 1, cursor: 'pointer' }} 
        onClick={() => onOpenProcess(process.id)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h2" noWrap sx={{ maxWidth: '80%' }}>
            {process.title}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => onMenuOpen(e, process.id)}
            aria-label="process options"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Created: {format(process.createdAt, 'MMM d, yyyy')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UpdateIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Updated: {formatDistanceToNow(process.updatedAt, { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button
          size="small"
          startIcon={<LaunchIcon />}
          onClick={() => onOpenProcess(process.id)}
        >
          Open
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProcessCard; 