import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Grid, Box, Tabs, Tab, 
  Button, Divider, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';

// Components
import ProjectLifecycle from '../components/projects/ProjectLifecycle';
import FileUploader from '../components/common/FileUploader';
import DriveLinks from '../components/common/DriveLinks';

// Services
import ProjectLifecycleService from '../services/projectLifecycle.service';
import FileStorageService from '../services/fileStorage.service';

// Mock service function for demo purposes - replace with actual API calls
const fetchProjectById = async (id) => {
  // This would be replaced with an actual API call
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  // In a real implementation, this would fetch data from the backend API
  // The response would include project, zones, workOrders, stats, and financialSummary
  return {
    project: {
      projectid: id,
      projectname: 'Riverside Drone Survey',
      clientname: 'Riverside Development Corp',
      projectdescription: 'Aerial survey of the riverside development area for construction planning',
      projectstatus: 'Planning', // This would come from the API
      meetingnotes: '',
      contractdocumentpdf_path: '',
      projectboundarykml_path: '',
      projectfolderid_drive: '',
      projectfoldername_drive: 'Riverside-Survey-2025',
      creationdate: '2025-05-25T10:30:00',
      lastmodified: '2025-05-29T09:15:00'
    },
    zones: [],
    workOrders: [],
    stats: {
      zoneCount: 2,
      workOrderCount: 3,
      flightCount: 5
    },
    financialSummary: {
      totalInvoiced: '7500.00',
      totalPaid: '5000.00',
      totalOutstanding: '2500.00'
    }
  };
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
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

// Project Detail Page component
const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [financialSummary, setFinancialSummary] = useState({
    totalInvoiced: '0.00',
    totalPaid: '0.00',
    totalOutstanding: '0.00'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Fetch project data on component mount
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const response = await fetchProjectById(id);
        setProject(response.project);
        setFinancialSummary(response.financialSummary);
        // We could also set zones, workOrders, and stats here if needed
      } catch (err) {
        setError('Failed to load project details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle status update from lifecycle component
  const handleStatusUpdate = async (nextStatus) => {
    try {
      // This would be an actual API call in a real app
      // const result = await ProjectLifecycleService.updateProjectStatus(id, nextStatus);
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setProject(prev => ({
        ...prev,
        projectstatus: nextStatus
      }));
      
      setNotification({
        open: true,
        message: `Project status updated to ${nextStatus}`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to update project status',
        severity: 'error'
      });
      console.error(err);
    }
  };

  // Handle field update from lifecycle component
  const handleFieldUpdate = async (field, value) => {
    try {
      // This would be an actual API call in a real app
      // const result = await ProjectLifecycleService.updateTransitionField(id, field, value);
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state - convert camelCase field to lowercase for DB column
      const dbField = field.toLowerCase();
      setProject(prev => ({
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
      const result = await FileStorageService.uploadProjectFile(id, documentType, file);
      
      // Update local state with the returned file path
      const fieldMap = {
        'contract': 'contractdocumentpdf_path',
        'boundary': 'projectboundarykml_path'
      };
      
      const field = fieldMap[documentType];
      setProject(prev => ({
        ...prev,
        [field]: result.filePath || result.webViewLink || `uploads/${documentType}/${file.name}`
      }));
      
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
          Loading project details...
        </Typography>
      </Container>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Project Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {project.projectname}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Client: {project.clientname}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(project.creationdate).toLocaleDateString()}
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Last modified: {new Date(project.lastmodified).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button variant="outlined" sx={{ mr: 1 }} onClick={() => navigate('/projects')}>
              Back to List
            </Button>
            <Button variant="contained" color="primary">
              Edit Project
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
          <Tab label="Overview" id="project-tab-0" />
          <Tab label="Lifecycle" id="project-tab-1" />
          <Tab label="Zones" id="project-tab-2" />
          <Tab label="Work Orders" id="project-tab-3" />
          <Tab label="Documents" id="project-tab-4" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Project Description</Typography>
            <Typography variant="body1" paragraph>
              {project.projectdescription || 'No description provided.'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Project Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Client</Typography>
                  <Typography variant="body1">{project.clientname}</Typography>
                  
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Created On</Typography>
                  <Typography variant="body1">
                    {new Date(project.creationdate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Typography variant="body1">{project.projectstatus}</Typography>
                  
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Last Modified</Typography>
                  <Typography variant="body1">
                    {new Date(project.lastmodified).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Description</Typography>
                  <Typography variant="body1">{project.projectdescription}</Typography>
                </Grid>
                
                {/* Google Drive Files & Folders Section */}
                <Grid item xs={12}>
                  <DriveLinks 
                    entityType="project" 
                    entityId={id} 
                    title="Project Files & Folders" 
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Statistics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="h4" align="center">{project.stats?.zoneCount || 0}</Typography>
                  <Typography variant="body2" align="center" color="text.secondary">Zones</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" align="center">{project.stats?.workOrderCount || 0}</Typography>
                  <Typography variant="body2" align="center" color="text.secondary">Work Orders</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" align="center">{project.stats?.flightCount || 0}</Typography>
                  <Typography variant="body2" align="center" color="text.secondary">Flights</Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Financial Summary</Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">Total Invoiced:</Typography>
                      <Typography variant="h6" color="primary">${financialSummary.totalInvoiced}</Typography>
                    </Box>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">Total Paid:</Typography>
                      <Typography variant="h6" color="success.main">${financialSummary.totalPaid}</Typography>
                    </Box>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">Outstanding Balance:</Typography>
                      <Typography variant="h6" color="warning.main">${financialSummary.totalOutstanding}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Lifecycle Management Tab */}
      <TabPanel value={tabValue} index={1}>
        <ProjectLifecycle 
          project={project}
          onStatusUpdate={handleStatusUpdate}
          onFieldUpdate={handleFieldUpdate}
          onDocumentUpload={handleDocumentUpload}
        />
      </TabPanel>

      {/* Zones Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="body1">
          Zone management content will be displayed here.
        </Typography>
      </TabPanel>

      {/* Work Orders Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="body1">
          Work orders content will be displayed here.
        </Typography>
      </TabPanel>

      {/* Documents Tab */}
      <TabPanel value={tabValue} index={4}>
        <Typography variant="body1">
          Documents and files content will be displayed here.
        </Typography>
      </TabPanel>

      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectDetailPage;
