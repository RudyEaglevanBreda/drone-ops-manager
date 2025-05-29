import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Stepper, Step, StepLabel, 
  Paper, Divider, Alert, TextField, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Custom styled components
const ActionButton = styled(Button)(({ theme, disabled }) => ({
  margin: theme.spacing(1),
  opacity: disabled ? 0.5 : 1,
  position: 'relative',
  '&::after': disabled ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1
  } : {}
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  backgroundColor: theme.palette.background.default
}));

const GuidanceBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.info.light,
  color: theme.palette.info.contrastText,
  borderRadius: theme.shape.borderRadius
}));

/**
 * Project Lifecycle Management Component
 * 
 * Displays the current project status, available transitions,
 * and UI elements for progressing through the project lifecycle.
 */
const ProjectLifecycle = ({ project, onStatusUpdate, onFieldUpdate, onDocumentUpload }) => {
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState(project?.meetingnotes || '');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Define all possible statuses for the stepper
  const allStatuses = [
    'Planning',
    'Discovery/Meeting',
    'Proposal/Contract Drafting',
    'Proposal/Contract Sent',
    'Client Agreement Pending',
    'Project Approved',
    'Active - Ongoing',
    'Project Review',
    'Archiving',
    'Completed'
  ];
  
  // Calculate current step index for the stepper
  const currentStepIndex = allStatuses.findIndex(status => status === project?.projectstatus);
  
  // Fetch available transitions when the project changes
  useEffect(() => {
    if (project?.projectid) {
      fetchTransitions();
    }
  }, [project]);
  
  // Fetch available transitions from the API
  const fetchTransitions = async () => {
    setLoading(true);
    try {
      // In a real app, replace with actual API call
      const response = await fetch(`/api/lifecycle/project/${project.projectid}/transitions`);
      const data = await response.json();
      
      setTransitions(data.availableTransitions);
      setGuidance(data.currentGuidance);
    } catch (error) {
      console.error('Error fetching transitions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on a transition action button
  const handleTransitionClick = (transition) => {
    // If transition has special requirements, open dialog
    if (!transition.requirementsMet) {
      setCurrentAction(transition);
      setDialogOpen(true);
    } else {
      // Otherwise, directly update the status
      handleStatusUpdate(transition.status);
    }
  };

  // Update project status
  const handleStatusUpdate = async (nextStatus) => {
    setLoading(true);
    try {
      await onStatusUpdate(nextStatus);
      setDialogOpen(false);
      setCurrentAction(null);
      fetchTransitions(); // Refresh transitions after update
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update meeting notes field
  const handleMeetingNotesUpdate = async () => {
    try {
      await onFieldUpdate('meetingNotes', meetingNotes);
      setDialogOpen(false);
      setCurrentAction(null);
      fetchTransitions(); // Refresh transitions after update
    } catch (error) {
      console.error('Error updating meeting notes:', error);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Upload document (contract or boundary KML)
  const handleDocumentUpload = async (documentType) => {
    if (!selectedFile) return;
    
    try {
      await onDocumentUpload(documentType, selectedFile);
      setDialogOpen(false);
      setCurrentAction(null);
      setSelectedFile(null);
      fetchTransitions(); // Refresh transitions after upload
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  // Render the appropriate dialog content based on current action
  const renderDialogContent = () => {
    if (!currentAction) return null;
    
    const status = currentAction.status;
    
    // Dialog content for meeting notes requirement
    if (status === 'Proposal/Contract Drafting') {
      return (
        <>
          <DialogTitle>Meeting Notes Required</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Meeting notes are required to progress to the Proposal/Contract Drafting phase.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Meeting Notes"
              variant="outlined"
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleMeetingNotesUpdate}
              variant="contained" 
              color="primary"
              disabled={!meetingNotes.trim()}
            >
              Save & Continue
            </Button>
          </DialogActions>
        </>
      );
    }
    
    // Dialog content for contract document upload
    if (status === 'Proposal/Contract Sent') {
      return (
        <>
          <DialogTitle>Upload Contract Document</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              A contract document (PDF) is required to progress to the Proposal/Contract Sent phase.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="contract-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="contract-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUploadIcon />}
                >
                  Select Contract PDF
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => handleDocumentUpload('contract')}
              variant="contained" 
              color="primary"
              disabled={!selectedFile}
            >
              Upload & Continue
            </Button>
          </DialogActions>
        </>
      );
    }
    
    // Dialog content for project boundary upload
    if (status === 'Active - Ongoing') {
      return (
        <>
          <DialogTitle>Upload Project Boundary KML</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              A project boundary KML file is required to progress to the Active phase.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <input
                accept=".kml,.kmz"
                style={{ display: 'none' }}
                id="boundary-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="boundary-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUploadIcon />}
                >
                  Select Boundary KML
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => handleDocumentUpload('boundary')}
              variant="contained" 
              color="primary"
              disabled={!selectedFile}
            >
              Upload & Continue
            </Button>
          </DialogActions>
        </>
      );
    }
    
    // Default dialog for other transitions
    return (
      <>
        <DialogTitle>Change Project Status</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to change the project status from 
            <strong> {project?.projectstatus} </strong> to 
            <strong> {currentAction.status}</strong>?
          </Typography>
          
          {currentAction.requirementsMessage && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {currentAction.requirementsMessage}
            </Alert>
          )}
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {currentAction.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleStatusUpdate(currentAction.status)}
            variant="contained" 
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </>
    );
  };

  // Return the component JSX
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Project Lifecycle Management
      </Typography>
      
      {/* Status Stepper */}
      <Stepper 
        activeStep={currentStepIndex !== -1 ? currentStepIndex : 0} 
        alternativeLabel
        sx={{ mb: 4 }}
      >
        {allStatuses.map((label) => {
          const isCompleted = allStatuses.indexOf(label) < currentStepIndex;
          const isCurrent = label === project?.projectstatus;
          
          return (
            <Step key={label} completed={isCompleted}>
              <StepLabel 
                error={['On Hold', 'Lost', 'Cancelled'].includes(project?.projectstatus) && isCurrent}
                optional={isCurrent ? <Typography variant="caption">Current</Typography> : null}
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      
      {/* Current Status and Guidance */}
      <StyledPaper elevation={2}>
        <Typography variant="h6" gutterBottom>
          Current Status: {project?.projectstatus}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <GuidanceBox>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Guidance for Current Phase:
          </Typography>
          <Typography variant="body1">
            {guidance}
          </Typography>
        </GuidanceBox>
        
        {/* Show special states if project is on hold, lost, or cancelled */}
        {['On Hold', 'Lost', 'Cancelled'].includes(project?.projectstatus) && (
          <Alert severity={project?.projectstatus === 'On Hold' ? 'warning' : 'error'} sx={{ mt: 2 }}>
            This project is currently <strong>{project?.projectstatus}</strong>.
            {project?.projectstatus === 'On Hold' && ' You can resume it by selecting an action below.'}
          </Alert>
        )}
      </StyledPaper>
      
      {/* Available Actions */}
      <StyledPaper elevation={2}>
        <Typography variant="h6" gutterBottom>
          Available Actions
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : transitions.length > 0 ? (
          <Box display="flex" flexWrap="wrap" mt={2}>
            {transitions.map((transition) => (
              <ActionButton
                key={transition.status}
                variant="contained"
                color={getButtonColor(transition.status)}
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleTransitionClick(transition)}
                disabled={!transition.requirementsMet && !isRequirementDialogAvailable(transition.status)}
              >
                {transition.buttonLabel}
              </ActionButton>
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No available actions for the current status.
          </Typography>
        )}
      </StyledPaper>
      
      {/* Dialog for transitions with requirements */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {renderDialogContent()}
      </Dialog>
    </Box>
  );
};

// Helper function to determine button color based on status
function getButtonColor(status) {
  if (['Cancelled', 'Lost'].includes(status)) {
    return 'error';
  } else if (status === 'On Hold') {
    return 'warning';
  } else if (['Completed', 'Project Approved', 'Active - Ongoing'].includes(status)) {
    return 'success';
  }
  return 'primary';
}

// Helper function to check if a requirement dialog is available for this status
function isRequirementDialogAvailable(status) {
  return [
    'Proposal/Contract Drafting', // For meeting notes
    'Proposal/Contract Sent',     // For contract upload
    'Active - Ongoing'            // For boundary KML upload
  ].includes(status);
}

export default ProjectLifecycle;
