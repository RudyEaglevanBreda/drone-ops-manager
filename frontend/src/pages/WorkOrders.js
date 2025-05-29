import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  FlightTakeoff as FlightIcon,
} from '@mui/icons-material';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // This is a placeholder for demonstration
    const fetchWorkOrders = async () => {
      try {
        // Mock data for demonstration
        setWorkOrders([
          {
            id: 1,
            title: 'Building Facade Inspection',
            projectName: 'Downtown Inspection',
            zoneName: 'Downtown North',
            status: 'in-progress',
            priority: 'high',
            dueDate: '2025-06-15',
            flightsCount: 2,
          },
          {
            id: 2,
            title: 'Traffic Signal Assessment',
            projectName: 'Downtown Inspection',
            zoneName: 'Downtown South',
            status: 'completed',
            priority: 'medium',
            dueDate: '2025-05-20',
            flightsCount: 1,
          },
          {
            id: 3,
            title: 'Solar Panel Efficiency Analysis',
            projectName: 'Solar Farm Survey',
            zoneName: 'Solar Array A',
            status: 'pending',
            priority: 'high',
            dueDate: '2025-06-30',
            flightsCount: 0,
          },
          {
            id: 4,
            title: 'Bridge Structural Assessment',
            projectName: 'Highway Infrastructure',
            zoneName: 'Highway Section 1',
            status: 'scheduled',
            priority: 'critical',
            dueDate: '2025-07-10',
            flightsCount: 0,
          },
        ]);
      } catch (error) {
        console.error('Error fetching work orders:', error);
      }
    };

    fetchWorkOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'scheduled':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'info';
      case 'medium':
        return 'success';
      case 'high':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Work Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Work Order
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell>Title</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="center">Flights</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workOrders.map((workOrder) => (
              <TableRow key={workOrder.id} hover>
                <TableCell>{workOrder.title}</TableCell>
                <TableCell>{workOrder.projectName}</TableCell>
                <TableCell>{workOrder.zoneName}</TableCell>
                <TableCell>
                  <Chip
                    label={workOrder.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    color={getStatusColor(workOrder.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                    color={getPriorityColor(workOrder.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{workOrder.dueDate}</TableCell>
                <TableCell align="center">{workOrder.flightsCount}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="primary">
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary"
                    disabled={workOrder.status === 'completed'}
                  >
                    <FlightIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WorkOrders;
