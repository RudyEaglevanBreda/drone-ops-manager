import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Stepper, Step, StepLabel, 
  Paper, Divider, Alert, TextField, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Grid, Link, Chip, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LaunchIcon from '@mui/icons-material/Launch';
import DatePicker from '@mui/lab/DatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

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

const ExternalToolButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  }
}));

/**
 * Work Order Lifecycle Management Component
 * 
 * Displays the current work order status, available transitions,
 * and UI elements for progressing through the work order lifecycle.
 */
const WorkOrderLifecycle = ({ workOrder, onStatusUpdate, onFieldUpdate, onDocumentUpload }) => {
  const [transitions, setTransitions] = useState([]);
  const [externalTools, setExternalTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(workOrder?.scheduleddate ? new Date(workOrder.scheduleddate) : null);
  const [quoteAmount, setQuoteAmount] = useState(workOrder?.quoteamountwo || '');
  const [invoiceAmount, setInvoiceAmount] = useState(workOrder?.invoiceamountwo || '');
  const [servicesRequested, setServicesRequested] = useState(workOrder?.servicesrequestedwo || []);
  
  // Define all possible statuses for the stepper
  const mainStatuses = [
    'Planning',
    'Quoting',
    'Quote Sent',
    'Client Approved',
    'Scheduled',
    'Fieldwork In Progress',
    'Fieldwork Complete',
    'Data Processing',
    'Internal QA/Review',
    'Ready for Delivery',
    'Data Delivered',
    'Invoicing',
    'Invoice Sent',
    'Payment Pending',
    'Paid',
    'Completed'
  ];
  
  // Special statuses not shown in the stepper
  const specialStatuses = ['Client Rejected', 'On Hold', 'Cancelled'];
  
  // Calculate current step index for the stepper
  const currentStepIndex = mainStatuses.findIndex(status => status === workOrder?.workorderstatus);
  
  // Fetch available transitions when the work order changes
  useEffect(() => {
    if (workOrder?.workorderid) {
      fetchTransitions();
    }
  }, [workOrder]);
  
  // Fetch available transitions from the API
  const fetchTransitions = async () => {
    setLoading(true);
    try {
      // In a real app, replace with actual API call
      const response = await fetch(`/api/wo-lifecycle/workorder/${workOrder.workorderid}/transitions`);
      const data = await response.json();
      
      setTransitions(data.availableTransitions);
      setGuidance(data.currentGuidance);
      setExternalTools(data.externalTools || []);
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

  // Update work order status
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

  // Handle services requested update
  const handleServicesRequestedUpdate = async () => {
    try {
      await onFieldUpdate('servicesRequestedWO', servicesRequested);
      setDialogOpen(false);
      setCurrentAction(null);
      fetchTransitions(); // Refresh transitions after update
    } catch (error) {
      console.error('Error updating services requested:', error);
    }
  };

  // Handle scheduled date update
  const handleScheduledDateUpdate = async () => {
    if (!selectedDate) return;
    
    try {
      await onFieldUpdate('scheduledDate', selectedDate.toISOString().split('T')[0]);
      setDialogOpen(false);
      setCurrentAction(null);
      fetchTransitions(); // Refresh transitions after update
    } catch (error) {
      console.error('Error updating scheduled date:', error);
    }
  };

  // Handle quote amount update
  const handleQuoteUpdate = async () => {
    if (!quoteAmount) return;
    
    try {
      await onFieldUpdate('quoteAmountWO', quoteAmount);
      setDialogOpen(false);
      setCurrentAction(null);
      fetchTransitions(); // Refresh transitions after update
    } catch (error) {
      console.error('Error updating quote amount:', error);
    }
  };

  // Handle invoice amount update
  const handleInvoiceUpdate = async () => {
    if (!invoiceAmount) return;
    
    try {
      await onFieldUpdate('invoiceAmountWO', invoiceAmount);
      setDialogOpen(false);
      setCurrentAction(null);
      fetchTransitions(); // Refresh transitions after update
    } catch (error) {
      console.error('Error updating invoice amount:', error);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Upload document (operational KML, quote PDF, or invoice PDF)
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

  // Handle external tool click
  const handleExternalToolClick = (url) => {
    window.open(url, '_blank');
  };

  // Render the appropriate dialog content based on current action
  const renderDialogContent = () => {
    if (!currentAction) return null;
    
    const status = currentAction.status;
    
    // Dialog content for services requested and operational KML requirement
    if (status === 'Quoting') {
      return (
        <>
          <DialogTitle>Define Work Order Scope</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Services requested and operational KML are required to proceed to Quoting phase.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Services Requested:
            </Typography>
            <Grid container spacing={1}>
              {['High-Res Photos', 'Video Footage', 'Orthomosaic Map', '3D Model', 'Thermal Imaging', 'LiDAR Scan', 'Site Inspection'].map((service) => (
                <Grid item key={service}>
                  <Chip 
                    label={service}
                    onClick={() => {
                      if (servicesRequested.includes(service)) {
                        setServicesRequested(prev => prev.filter(s => s !== service));
                      } else {
                        setServicesRequested(prev => [...prev, service]);
                      }
                    }}
                    color={servicesRequested.includes(service) ? 'primary' : 'default'}
                  />
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Operational KML File:
              </Typography>
              <input
                accept=".kml,.kmz"
                style={{ display: 'none' }}
                id="operational-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="operational-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUploadIcon />}
                >
                  Select Operational KML
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
              {workOrder?.operationalkml_wo_path && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Current file: {workOrder.operationalkml_wo_path.split('/').pop()}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => handleServicesRequestedUpdate()}
              variant="contained" 
              color="primary"
              disabled={servicesRequested.length === 0}
            >
              Save Services
            </Button>
            <Button 
              onClick={() => handleDocumentUpload('operational')}
              variant="contained" 
              color="primary"
              disabled={!selectedFile}
            >
              Upload KML & Continue
            </Button>
          </DialogActions>
        </>
      );
    }
    
    // Dialog content for quote amount and quote PDF upload
    if (status === 'Quote Sent') {
      return (
        <>
          <DialogTitle>Prepare Quote</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Quote amount and quote PDF document are required to proceed to Quote Sent phase.
            </Typography>
            
            <TextField
              fullWidth
              label="Quote Amount"
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              margin="normal"
            />
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quote PDF Document:
              </Typography>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="quote-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="quote-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUploadIcon />}
                >
                  Select Quote PDF
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
              {workOrder?.quotepdf_path_wo && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Current file: {workOrder.quotepdf_path_wo.split('/').pop()}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleQuoteUpdate}
              variant="contained" 
              color="primary"
              disabled={!quoteAmount}
            >
              Save Quote Amount
            </Button>
            <Button 
              onClick={() => handleDocumentUpload('quote')}
              variant="contained" 
              color="primary"
              disabled={!selectedFile}
            >
              Upload Quote PDF
            </Button>
          </DialogActions>
        </>
      );
    }
    
    // Dialog content for scheduled date
    if (status === 'Scheduled') {
      return (
        <>
          <DialogTitle>Schedule Work Order</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              A scheduled date is required to proceed to Scheduled phase.
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Scheduled Date"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleScheduledDateUpdate}
              variant="contained" 
              color="primary"
              disabled={!selectedDate}
            >
              Save & Continue
            </Button>
          </DialogActions>
        </>
      );
    }
    
    // Dialog content for invoice amount and invoice PDF upload
    if (status === 'Invoice Sent') {
      return (
        <>
          <DialogTitle>Prepare Invoice</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Invoice amount and invoice PDF document are required to proceed to Invoice Sent phase.
            </Typography>
            
            <TextField
              fullWidth
              label="Invoice Amount"
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              margin="normal"
            />
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Invoice PDF Document:
              </Typography>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="invoice-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="invoice-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUploadIcon />}
                >
                  Select Invoice PDF
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
              {workOrder?.invoicepdf_path_wo && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Current file: {workOrder.invoicepdf_path_wo.split('/').pop()}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleInvoiceUpdate}
              variant="contained" 
              color="primary"
              disabled={!invoiceAmount}
            >
              Save Invoice Amount
            </Button>
            <Button 
              onClick={() => handleDocumentUpload('invoice')}
              variant="contained" 
              color="primary"
              disabled={!selectedFile}
            >
              Upload Invoice PDF
            </Button>
          </DialogActions>
        </>
      );
    }
    
    // Default dialog for other transitions
    return (
      <>
        <DialogTitle>Change Work Order Status</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to change the work order status from 
            <strong> {workOrder?.workorderstatus} </strong> to 
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
        Work Order Lifecycle Management
      </Typography>
      
      {/* Status Stepper - only show for main flow statuses */}
      <Stepper 
        activeStep={currentStepIndex !== -1 ? currentStepIndex : 0} 
        alternativeLabel
        sx={{ mb: 4 }}
      >
        {mainStatuses.map((label) => {
          const isCompleted = mainStatuses.indexOf(label) < currentStepIndex;
          const isCurrent = label === workOrder?.workorderstatus;
          
          return (
            <Step key={label} completed={isCompleted}>
              <StepLabel 
                optional={isCurrent ? <Typography variant="caption">Current</Typography> : null}
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      
      {/* Special status indicator for non-linear statuses */}
      {specialStatuses.includes(workOrder?.workorderstatus) && (
        <Alert 
          severity={workOrder?.workorderstatus === 'On Hold' ? 'warning' : 'error'}
          sx={{ mb: 3 }}
        >
          This work order is currently in a special state: <strong>{workOrder?.workorderstatus}</strong>
        </Alert>
      )}
      
      {/* Current Status and Guidance */}
      <StyledPaper elevation={2}>
        <Typography variant="h6" gutterBottom>
          Current Status: {workOrder?.workorderstatus}
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
        
        {/* External Tools Section */}
        {externalTools.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              External Tools:
            </Typography>
            {externalTools.map((tool) => (
              <Tooltip key={tool.name} title={tool.description}>
                <ExternalToolButton
                  variant="outlined"
                  endIcon={<LaunchIcon />}
                  onClick={() => handleExternalToolClick(tool.url)}
                >
                  {tool.name}
                </ExternalToolButton>
              </Tooltip>
            ))}
          </Box>
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
      
      {/* Work Order Details Summary */}
      <StyledPaper elevation={2}>
        <Typography variant="h6" gutterBottom>
          Work Order Details
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">Services Requested:</Typography>
            <Box mt={1}>
              {workOrder?.servicesrequestedwo?.length > 0 ? (
                workOrder.servicesrequestedwo.map((service) => (
                  <Chip key={service} label={service} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))
              ) : (
                <Typography variant="body2">None specified</Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">Scheduled Date:</Typography>
            <Typography variant="body1">
              {workOrder?.scheduleddate ? new Date(workOrder.scheduleddate).toLocaleDateString() : 'Not scheduled'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">Quote Amount:</Typography>
            <Typography variant="body1">
              {workOrder?.quoteamountwo ? `$${workOrder.quoteamountwo}` : 'Not quoted'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">Invoice Amount:</Typography>
            <Typography variant="body1">
              {workOrder?.invoiceamountwo ? `$${workOrder.invoiceamountwo}` : 'Not invoiced'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">Documents:</Typography>
            <Box mt={1}>
              {workOrder?.operationalkml_wo_path && (
                <Chip 
                  label="Operational KML" 
                  size="small" 
                  sx={{ mr: 0.5, mb: 0.5 }} 
                  onClick={() => {}} // In a real app, this would open the document
                />
              )}
              {workOrder?.quotepdf_path_wo && (
                <Chip 
                  label="Quote PDF" 
                  size="small" 
                  sx={{ mr: 0.5, mb: 0.5 }} 
                  onClick={() => {}} // In a real app, this would open the document
                />
              )}
              {workOrder?.invoicepdf_path_wo && (
                <Chip 
                  label="Invoice PDF" 
                  size="small" 
                  sx={{ mr: 0.5, mb: 0.5 }} 
                  onClick={() => {}} // In a real app, this would open the document
                />
              )}
            </Box>
          </Grid>
        </Grid>
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
  if (['Cancelled', 'Client Rejected'].includes(status)) {
    return 'error';
  } else if (status === 'On Hold') {
    return 'warning';
  } else if (['Completed', 'Paid', 'Client Approved'].includes(status)) {
    return 'success';
  }
  return 'primary';
}

// Helper function to check if a requirement dialog is available for this status
function isRequirementDialogAvailable(status) {
  return [
    'Quoting',        // For services and KML upload
    'Quote Sent',     // For quote amount and upload
    'Scheduled',      // For scheduled date
    'Invoice Sent'    // For invoice amount and upload
  ].includes(status);
}

export default WorkOrderLifecycle;
