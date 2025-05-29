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
  Delete as DeleteIcon,
  Map as MapIcon,
} from '@mui/icons-material';

const Zones = () => {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // This is a placeholder for demonstration
    const fetchZones = async () => {
      try {
        // Mock data for demonstration
        setZones([
          {
            id: 1,
            name: 'Downtown North',
            projectName: 'Downtown Inspection',
            status: 'active',
            area: '1.2 km²',
            workOrdersCount: 3,
            flightsCount: 8,
          },
          {
            id: 2,
            name: 'Downtown South',
            projectName: 'Downtown Inspection',
            status: 'completed',
            area: '0.8 km²',
            workOrdersCount: 2,
            flightsCount: 5,
          },
          {
            id: 3,
            name: 'Solar Array A',
            projectName: 'Solar Farm Survey',
            status: 'active',
            area: '3.5 km²',
            workOrdersCount: 4,
            flightsCount: 12,
          },
          {
            id: 4,
            name: 'Highway Section 1',
            projectName: 'Highway Infrastructure',
            status: 'planning',
            area: '5.0 km²',
            workOrdersCount: 0,
            flightsCount: 0,
          },
        ]);
      } catch (error) {
        console.error('Error fetching zones:', error);
      }
    };

    fetchZones();
  }, []);

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
          Zones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Zone
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell>Zone Name</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Area</TableCell>
              <TableCell align="center">Work Orders</TableCell>
              <TableCell align="center">Flights</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone.id} hover>
                <TableCell>{zone.name}</TableCell>
                <TableCell>{zone.projectName}</TableCell>
                <TableCell>
                  <Chip
                    label={zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                    color={getStatusColor(zone.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{zone.area}</TableCell>
                <TableCell align="center">{zone.workOrdersCount}</TableCell>
                <TableCell align="center">{zone.flightsCount}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="primary">
                    <MapIcon fontSize="small" />
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
    </Box>
  );
};

export default Zones;
