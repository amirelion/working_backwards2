import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  Paper,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { AssumptionCategory, AssumptionImpact, AssumptionConfidence } from '../types';
// We'll fix the unused import warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getCategoryIcon, getCategoryColor } from '../utils/categoryUtils';

interface AssumptionFormProps {
  statement: string;
  description: string;
  category: AssumptionCategory;
  impact: AssumptionImpact;
  confidence: AssumptionConfidence;
  onStatementChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: AssumptionCategory) => void;
  onImpactChange: (value: AssumptionImpact) => void;
  onConfidenceChange: (value: AssumptionConfidence) => void;
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

const AssumptionForm: React.FC<AssumptionFormProps> = ({
  statement,
  description,
  category,
  impact,
  confidence,
  onStatementChange,
  onDescriptionChange,
  onCategoryChange,
  onImpactChange,
  onConfidenceChange,
  onSave,
  onCancel,
  loading = false,
  isEdit = false,
}) => {
  // Fixing the unused variable warning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const CategoryIcon = getCategoryIcon(category);
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Assumption' : 'Add New Assumption'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Assumption Statement"
            value={statement}
            onChange={(e) => onStatementChange(e.target.value)}
            placeholder="What must be true for your innovation to succeed?"
            disabled={loading}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              label="Category"
              onChange={(e) => onCategoryChange(e.target.value as AssumptionCategory)}
              disabled={loading}
            >
              <MenuItem value="customer">Customer Assumptions</MenuItem>
              <MenuItem value="solution">Solution Assumptions</MenuItem>
              <MenuItem value="business">Business Model Assumptions</MenuItem>
              <MenuItem value="market">Market Assumptions</MenuItem>
            </Select>
            <FormHelperText>
              Categorize your assumption to help organize your thinking
            </FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="impact-label">Impact if Wrong</InputLabel>
            <Select
              labelId="impact-label"
              value={impact}
              label="Impact if Wrong"
              onChange={(e) => onImpactChange(e.target.value as AssumptionImpact)}
              disabled={loading}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
            <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="High impact assumptions, if wrong, could cause project failure">
                <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
              </Tooltip>
              How critical is this to success?
            </FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="confidence-label">Confidence Level</InputLabel>
            <Select
              labelId="confidence-label"
              value={confidence}
              label="Confidence Level"
              onChange={(e) => onConfidenceChange(e.target.value as AssumptionConfidence)}
              disabled={loading}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
            <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Low confidence means you need to test this assumption">
                <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
              </Tooltip>
              How certain are you that this is true?
            </FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Detailed Description
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Provide additional context and details about this assumption..."
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onSave}
              disabled={loading || !statement.trim()}
            >
              {loading ? <CircularProgress size={24} /> : (isEdit ? 'Update' : 'Add Assumption')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AssumptionForm; 