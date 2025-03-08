import React from 'react';
import { Box, Typography } from '@mui/material';
import AssumptionItem from './AssumptionItem';
import { EnhancedAssumption } from '../types';

interface AssumptionsListProps {
  assumptions: EnhancedAssumption[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onLinkExperiments: (id: string) => void;
  disabled?: boolean;
}

const AssumptionsList: React.FC<AssumptionsListProps> = ({
  assumptions,
  onEdit,
  onDelete,
  onLinkExperiments,
  disabled = false,
}) => {
  if (assumptions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No assumptions found. Add your first assumption using the button above.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {assumptions.map((assumption) => (
        <AssumptionItem
          key={assumption.id}
          assumption={assumption}
          onEdit={onEdit}
          onDelete={onDelete}
          onLinkExperiments={onLinkExperiments}
          disabled={disabled}
        />
      ))}
    </Box>
  );
};

export default AssumptionsList; 