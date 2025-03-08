import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { EnhancedAssumption } from '../types';
import { getCategoryColor, getCategoryIcon } from '../utils/categoryUtils';

interface RiskMatrixProps {
  assumptions: EnhancedAssumption[];
  onAssumptionClick: (id: string) => void;
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ 
  assumptions, 
  onAssumptionClick 
}) => {
  const theme = useTheme();
  
  // Map impacts and confidences to coordinates
  const getXCoordinate = (confidence: string) => {
    switch (confidence) {
      case 'low': return 15;
      case 'medium': return 50;
      case 'high': return 85;
      default: return 50;
    }
  };
  
  const getYCoordinate = (impact: string) => {
    switch (impact) {
      case 'low': return 85;
      case 'medium': return 50;
      case 'high': return 15;
      default: return 50;
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Assumption Risk Matrix
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Visualize assumptions based on impact and confidence. High impact + low confidence assumptions are the riskiest and should be prioritized for testing.
      </Typography>
      
      <Box 
        sx={{ 
          position: 'relative', 
          height: 400, 
          border: '1px solid', 
          borderColor: 'divider',
          my: 2,
          mx: 'auto',
          maxWidth: 500,
          bgcolor: 'background.default'
        }}
      >
        {/* X-axis (Confidence) */}
        <Typography 
          variant="subtitle2" 
          sx={{ 
            position: 'absolute', 
            bottom: -30, 
            left: '50%', 
            transform: 'translateX(-50%)' 
          }}
        >
          Confidence
        </Typography>
        <Typography variant="caption" sx={{ position: 'absolute', bottom: -10, left: '10%' }}>
          Low
        </Typography>
        <Typography variant="caption" sx={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)' }}>
          Medium
        </Typography>
        <Typography variant="caption" sx={{ position: 'absolute', bottom: -10, right: '10%' }}>
          High
        </Typography>
        
        {/* Y-axis (Impact) */}
        <Typography 
          variant="subtitle2" 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: -40, 
            transform: 'translateY(-50%) rotate(-90deg)' 
          }}
        >
          Impact
        </Typography>
        <Typography variant="caption" sx={{ position: 'absolute', top: '10%', left: -10 }}>
          High
        </Typography>
        <Typography variant="caption" sx={{ position: 'absolute', top: '50%', left: -10, transform: 'translateY(-50%)' }}>
          Medium
        </Typography>
        <Typography variant="caption" sx={{ position: 'absolute', bottom: '10%', left: -10 }}>
          Low
        </Typography>
        
        {/* Risk quadrants */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '50%',
          bgcolor: 'error.light',
          opacity: 0.2
        }} />
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '50%',
          height: '50%',
          bgcolor: 'warning.light',
          opacity: 0.2
        }} />
        <Box sx={{ 
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '50%',
          height: '50%',
          bgcolor: 'warning.light',
          opacity: 0.2
        }} />
        <Box sx={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '50%',
          height: '50%',
          bgcolor: 'success.light',
          opacity: 0.2
        }} />
        
        {/* Plotted assumptions */}
        {assumptions.map((assumption) => {
          const x = getXCoordinate(assumption.confidence);
          const y = getYCoordinate(assumption.impact);
          const CategoryIcon = getCategoryIcon(assumption.category);
          
          return (
            <Box
              key={assumption.id}
              sx={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                width: 50,
                height: 50,
                bgcolor: theme.palette[getCategoryColor(assumption.category)].main,
                color: theme.palette[getCategoryColor(assumption.category)].contrastText,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.1)',
                  boxShadow: 4
                }
              }}
              onClick={() => onAssumptionClick(assumption.id)}
              title={assumption.statement}
            >
              <CategoryIcon />
            </Box>
          );
        })}
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>
        Click on any assumption bubble to view details
      </Typography>
    </Paper>
  );
};

export default RiskMatrix; 