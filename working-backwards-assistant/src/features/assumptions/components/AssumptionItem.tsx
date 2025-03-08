import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LinkOutlined as LinkIcon,
} from '@mui/icons-material';
import { EnhancedAssumption } from '../types';
import { getCategoryColor, getCategoryIcon } from '../utils/categoryUtils';
import { getImpactColor, getConfidenceColor } from '../utils/riskUtils';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';

interface AssumptionItemProps {
  assumption: EnhancedAssumption;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onLinkExperiments: (id: string) => void;
  disabled?: boolean;
}

const AssumptionItem: React.FC<AssumptionItemProps> = ({
  assumption,
  onEdit,
  onDelete,
  onLinkExperiments,
  disabled = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const CategoryIcon = getCategoryIcon(assumption.category);
  
  // Safely access relatedExperiments with default empty array
  const relatedExperiments = assumption.relatedExperiments || [];

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<CategoryIcon fontSize="small" />}
            label={assumption.category.charAt(0).toUpperCase() + assumption.category.slice(1)}
            color={getCategoryColor(assumption.category)}
            size="small"
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            {assumption.statement}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Link to experiments">
            <IconButton 
              size="small" 
              onClick={() => onLinkExperiments(assumption.id)}
              disabled={disabled}
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton 
            size="small" 
            onClick={() => onEdit(assumption.id)}
            disabled={disabled}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onDelete(assumption.id)}
            disabled={disabled}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', mt: 1, gap: 2 }}>
        <Chip
          label={`Impact: ${assumption.impact.toUpperCase()}`}
          color={getImpactColor(assumption.impact)}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`Confidence: ${assumption.confidence.toUpperCase()}`}
          color={getConfidenceColor(assumption.confidence)}
          size="small"
          variant="outlined"
        />
        <Chip
          label={getStatusLabel(assumption.status)}
          color={getStatusColor(assumption.status)}
          size="small"
        />
        {relatedExperiments.length > 0 && (
          <Chip
            icon={<LinkIcon />}
            label={`${relatedExperiments.length} Experiments`}
            color="info"
            size="small"
            variant="outlined"
          />
        )}
      </Box>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
          {assumption.description ? (
            <Typography variant="body2">
              {assumption.description}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No detailed description provided.
            </Typography>
          )}
          
          {relatedExperiments.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Related Experiments:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {relatedExperiments.map(expId => (
                  <Chip
                    key={expId}
                    label={`Experiment ${expId}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => {/* Navigate to experiment */}}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AssumptionItem; 