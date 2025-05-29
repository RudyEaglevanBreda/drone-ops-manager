import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper, Grid, Chip, Button } from '@mui/material';
import { Edit as EditIcon, Map as MapIcon, Assignment as WorkOrderIcon } from '@mui/icons-material';

const ProjectDetails = () => {
  const { id } = useParams();
  const [tabValue, setTabValue] = React.useState(0);

  // In a real app, you would fetch project data based on ID
  const project = {
    id,
    name: 'Downtown Inspection',
    client: 'City Municipal',
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2025-07-15',
    description: 'Comprehensive inspection of downtown infrastructure using drone technology.',
    contactName: 'John Smith',
    contactEmail: 'john.smith@citymunicipal.gov',
    contactPhone: '(555) 123-4567',
    zonesCount: 12,
    workOrdersCount: 8,
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {project.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Client: {project.client}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />}>
          Edit Project
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Chip 
              label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              color="success"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Start Date
            </Typography>
            <Typography variant="body1">{project.startDate}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              End Date
            </Typography>
            <Typography variant="body1">{project.endDate}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body1">{project.contactName}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1">{project.description}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
          <Tab label="Overview" />
          <Tab icon={<MapIcon fontSize="small" />} label="Zones" />
          <Tab icon={<WorkOrderIcon fontSize="small" />} label="Work Orders" />
          <Tab label="Documents" />
        </Tabs>
      </Box>

      <Box p={1}>
        {tabValue === 0 && (
          <Typography>Project overview content would be displayed here.</Typography>
        )}
        {tabValue === 1 && (
          <Typography>Zones related to this project would be displayed here.</Typography>
        )}
        {tabValue === 2 && (
          <Typography>Work orders related to this project would be displayed here.</Typography>
        )}
        {tabValue === 3 && (
          <Typography>Project documents would be displayed here.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProjectDetails;
