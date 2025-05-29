import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Grid, Box, Tabs, Tab, 
  Button, Divider, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';

// Components
import WorkOrderLifecycle from '../components/workOrders/WorkOrderLifecycle';
import FileUploader from '../components/common/FileUploader';
import DriveLinks from '../components/common/DriveLinks';

// Services
import FileStorageService from '../services/fileStorage.service';

// Mock service function for demo purposes - replace with actual API calls
const fetchWorkOrderById = async (id) => {
  // This would be replaced with an actual API call
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  return {
    workorderid: id,
    workordername: 'Riverside Site Survey',
    projectid: 'PRJ12345',
    zoneid: 'ZONE789',
    workorderdescription: 'Detailed aerial survey of riverside construction site',
    operationalstatus: 'Planning', // This would come from the API
    quotepdf_path: '',
    invoicepdf_path: '',
    quotetotalamount: null,
    invoicetotalamount: null,
    workorderfolderid_drive: '',
    workorderfoldername_drive: 'Riverside-Site-Survey-2025',
    creationdate: '2025-05-25T10:30:00',
    lastmodified: '2025-05-29T09:15:00'
  };
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workorder-tabpanel-${index}`}
      aria-labelledby={`workorder-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Work Order Detail Page component
const WorkOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Fetch work order data on component mount
  useEffect(() => {
    const loadWorkOrder = async () => {
      try {
        setLoading(true);
        const data = await fetchWorkOrderById(id);
        setWorkOrder(data);
      } catch (err) {
        setError('Failed to load work order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrder();
  }, [id]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle status update from lifecycle component
  const handleStatusUpdate = async (nextStatus) => {
    try {
      // This would be an actual API call in a real app
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setWorkOrder(prev => ({
        ...prev,
        operationalstatus: nextStatus
      }));
      
      setNotification({
        open: true,
        message: `Work order status updated to ${nextStatus}`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to update work order status',
        severity: 'error'
      });
      console.error(err);
    }
  };

  // Handle field update from lifecycle component
  const handleFieldUpdate = async (field, value) => {
    try {
      // This would be an actual API call in a real app
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state - convert camelCase field to lowercase for DB column
      const dbField = field.toLowerCase();
      setWorkOrder(prev => ({
        ...prev,
        [dbField]: value
      }));
      
      setNotification({
        open: true,
        message: `${field} updated successfully`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to update ${field}`,
        severity: 'error'
      });
      console.error(err);
    }
  };

  // Handle document upload from lifecycle component
  const handleDocumentUpload = async (documentType, file) => {
    try {
      // Use our FileStorageService to upload the file
      const result = await FileStorageService.uploadWorkOrderFile(id, documentType, file);
      
      // Update local state with the returned file path
      const fieldMap = {
        'quote': 'quotepdf_path',
        'invoice': 'invoicepdf_path',
        'operational': 'operationaldocument_path'
      };
      
      const field = fieldMap[documentType];
      if (field) {
        setWorkOrder(prev => ({
          ...prev,
          [field]: result.filePath || result.webViewLink || `uploads/${documentType}/${file.name}`
        }));
      }
      
      setNotification({
        open: true,
        message: `${documentType} document uploaded successfully`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to upload ${documentType} document`,
        severity: 'error'
      });
      console.error(err);
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading work order details...
        </Typography>
      </Container>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/workorders')}>
          Back to Work Orders
        </Button>
      </Container>
    );
  }

  // Render work order details if available
  if (workOrder) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Notification snackbar */}
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {workOrder.workordername}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/workorders')}>
            Back to Work Orders
          </Button>
        </Box>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Details" id="workorder-tab-0" aria-controls="workorder-tabpanel-0" />
            <Tab label="Workflow" id="workorder-tab-1" aria-controls="workorder-tabpanel-1" />
            <Tab label="Files" id="workorder-tab-2" aria-controls="workorder-tabpanel-2" />
          </Tabs>
          
          {/* Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Work Order Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Project</Typography>
                  <Typography variant="body1">{workOrder.projectid}</Typography>
                  
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Zone</Typography>
                  <Typography variant="body1">{workOrder.zoneid}</Typography>
                  
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Created On</Typography>
                  <Typography variant="body1">
                    {new Date(workOrder.creationdate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Typography variant="body1">{workOrder.operationalstatus}</Typography>
                  
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Last Modified</Typography>
                  <Typography variant="body1">
                    {new Date(workOrder.lastmodified).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Description</Typography>
                  <Typography variant="body1">{workOrder.workorderdescription}</Typography>
                </Grid>
                
                {/* Google Drive Files & Folders Section */}
                <Grid item xs={12}>
                  <DriveLinks 
                    entityType="workorder" 
                    entityId={id} 
                    title="Work Order Files & Folders" 
                  />
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>
          
          {/* Workflow Tab */}
          <TabPanel value={tabValue} index={1}>
            <WorkOrderLifecycle 
              workOrder={workOrder}
              onStatusUpdate={handleStatusUpdate}
              onFieldUpdate={handleFieldUpdate}
              onDocumentUpload={handleDocumentUpload}
            />
          </TabPanel>
          
          {/* Files Tab */}
          <TabPanel value={tabValue} index={2}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>File Management</Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Quote Document</Typography>
                {workOrder.quotepdf_path ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">
                      Quote document uploaded
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      component="a" 
                      href={workOrder.quotepdf_path} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No quote document uploaded
                    </Typography>
                    <FileUploader 
                      entityType="workorder" 
                      entityId={id} 
                      documentType="quote" 
                      uploadFunction={FileStorageService.uploadWorkOrderFile}
                      onUploadSuccess={(result) => {
                        setWorkOrder(prev => ({
                          ...prev,
                          quotepdf_path: result.filePath || result.webViewLink
                        }));
                      }}
                      acceptedFileTypes={['.pdf', '.docx']}
                      buttonLabel="Upload Quote"
                      title="Upload Quote Document"
                      buttonVariant="outlined"
                      buttonSize="small"
                    />
                  </Box>
                )}
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Invoice Document</Typography>
                {workOrder.invoicepdf_path ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">
                      Invoice document uploaded
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      component="a" 
                      href={workOrder.invoicepdf_path} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No invoice document uploaded
                    </Typography>
                    <FileUploader 
                      entityType="workorder" 
                      entityId={id} 
                      documentType="invoice" 
                      uploadFunction={FileStorageService.uploadWorkOrderFile}
                      onUploadSuccess={(result) => {
                        setWorkOrder(prev => ({
                          ...prev,
                          invoicepdf_path: result.filePath || result.webViewLink
                        }));
                      }}
                      acceptedFileTypes={['.pdf', '.docx']}
                      buttonLabel="Upload Invoice"
                      title="Upload Invoice Document"
                      buttonVariant="outlined"
                      buttonSize="small"
                    />
                  </Box>
                )}
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Operational Documents</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FileUploader 
                    entityType="workorder" 
                    entityId={id} 
                    documentType="operational" 
                    uploadFunction={FileStorageService.uploadWorkOrderFile}
                    acceptedFileTypes={['.pdf', '.docx', '.xlsx', '.zip']}
                    buttonLabel="Upload Operational Document"
                    title="Upload Operational Document"
                    buttonVariant="outlined"
                    buttonSize="small"
                  />
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>Raw Data Files</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FileUploader 
                    entityType="workorder" 
                    entityId={id} 
                    documentType="raw" 
                    uploadFunction={FileStorageService.uploadWorkOrderFile}
                    acceptedFileTypes={['.jpg', '.png', '.tiff', '.xyz', '.las', '.laz', '.zip']}
                    buttonLabel="Upload Raw Data"
                    title="Upload Raw Data Files"
                    buttonVariant="outlined"
                    buttonSize="small"
                  />
                </Box>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Processed Data Files</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FileUploader 
                    entityType="workorder" 
                    entityId={id} 
                    documentType="processed" 
                    uploadFunction={FileStorageService.uploadWorkOrderFile}
                    acceptedFileTypes={['.jpg', '.png', '.tiff', '.pdf', '.dwg', '.dxf', '.shp', '.zip']}
                    buttonLabel="Upload Processed Data"
                    title="Upload Processed Data Files"
                    buttonVariant="outlined"
                    buttonSize="small"
                  />
                </Box>
              </Box>
            </Paper>
          </TabPanel>
        </Paper>
      </Container>
    );
  }

  // Fallback if no workOrder and no error (shouldn't happen)
  return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <Typography>No work order information available.</Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/workorders')}>
        Back to Work Orders
      </Button>
    </Container>
  );
};

export default WorkOrderDetailPage;
