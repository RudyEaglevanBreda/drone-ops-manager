import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    status: 'active',
    startDate: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // This is a placeholder for demonstration
    const fetchProjects = async () => {
      try {
        // Mock data for demonstration
        setProjects([
          {
            id: 1,
            name: 'Downtown Inspection',
            client: 'City Municipal',
            status: 'active',
            startDate: '2025-01-15',
            endDate: '2025-07-15',
            zonesCount: 12,
            workOrdersCount: 8,
          },
          {
            id: 2,
            name: 'Solar Farm Survey',
            client: 'GreenEnergy Co.',
            status: 'completed',
            startDate: '2024-11-01',
            endDate: '2025-03-20',
            zonesCount: 6,
            workOrdersCount: 15,
          },
          {
            id: 3,
            name: 'Highway Infrastructure',
            client: 'State DOT',
            status: 'planning',
            startDate: '2025-06-01',
            endDate: '2025-12-31',
            zonesCount: 10,
            workOrdersCount: 0,
          },
        ]);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form data
    setFormData({
      name: '',
      client: '',
      status: 'active',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    // In a real app, you would submit this data to your API
    console.log('Form submitted:', formData);
    
    // Add mock project to list (would normally come from API response)
    const newProject = {
      id: projects.length + 1,
      ...formData,
      zonesCount: 0,
      workOrdersCount: 0,
    };
    
    setProjects([...projects, newProject]);
    handleClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'planning':
        return 'info';
      case 'completed':
        return 'default';
      case 'on-hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          New Project
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell>Project Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="center">Zones</TableCell>
              <TableCell align="center">Work Orders</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.client}</TableCell>
                <TableCell>
                  <Chip
                    label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{project.startDate}</TableCell>
                <TableCell>{project.endDate}</TableCell>
                <TableCell align="center">{project.zonesCount}</TableCell>
                <TableCell align="center">{project.workOrdersCount}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Project Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on-hold">On Hold</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.client}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
