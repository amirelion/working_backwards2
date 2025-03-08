import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Typography,
  Divider,
} from '@mui/material';
import { Science as ScienceIcon } from '@mui/icons-material';
import { Experiment } from '../../../types';

interface ExperimentLinkerProps {
  open: boolean;
  onClose: () => void;
  assumptionId: string;
  assumptionStatement: string;
  experiments: Experiment[];
  linkedExperimentIds: string[];
  onLinkExperiments: (assumptionId: string, experimentIds: string[]) => void;
}

const ExperimentLinker: React.FC<ExperimentLinkerProps> = ({
  open,
  onClose,
  assumptionId,
  assumptionStatement,
  experiments,
  linkedExperimentIds,
  onLinkExperiments,
}) => {
  const [selectedExperiments, setSelectedExperiments] = useState<string[]>(linkedExperimentIds);
  
  const handleToggle = (experimentId: string) => {
    const currentIndex = selectedExperiments.indexOf(experimentId);
    const newSelected = [...selectedExperiments];
    
    if (currentIndex === -1) {
      newSelected.push(experimentId);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    
    setSelectedExperiments(newSelected);
  };
  
  const handleSave = () => {
    onLinkExperiments(assumptionId, selectedExperiments);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Link Experiments to Assumption</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          {assumptionStatement}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select experiments to link to this assumption. This will help you track how you're validating your key assumptions.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {experiments.length > 0 ? (
          <List>
            {experiments.map((experiment) => {
              const isSelected = selectedExperiments.indexOf(experiment.id) !== -1;
              
              return (
                <ListItem
                  key={experiment.id}
                  button
                  onClick={() => handleToggle(experiment.id)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    <ScienceIcon color={experiment.status === 'completed' ? 'success' : 'primary'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={experiment.name}
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.secondary">
                          Hypothesis: {experiment.hypothesis}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Status: {experiment.status}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body1" align="center" sx={{ py: 3 }}>
            No experiments available. Create experiments first to link them to this assumption.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Links
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExperimentLinker; 