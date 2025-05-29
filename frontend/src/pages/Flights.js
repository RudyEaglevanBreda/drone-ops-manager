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
  Download as DownloadIcon,
} from '@mui/icons-material';

const Flights = () => {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // This is a placeholder for demonstration
    const fetchFlights = async () => {
      try {
        // Mock data for demonstration
        setFlights([
          {
            id: 1,
            name: 'BLD-NORTH-01',
            workOrderTitle: 'Building Facade Inspection',
            projectName: 'Downtown Inspection',
            zoneName: 'Downtown North',
            date: '2025-05-15',
            duration: '42 mins',
            status: 'completed',
            pilot: 'Alex Johnson',
            imagesCount: 86,
          },
          {
            id: 2,
            name: 'BLD-NORTH-02',
            workOrderTitle: 'Building Facade Inspection',
            projectName: 'Downtown Inspection',
            zoneName: 'Downtown North',
            date: '2025-05-18',
            duration: '38 mins',
            status: 'completed',
            pilot: 'Alex Johnson',
            imagesCount: 72,
          },
          {
            id: 3,
            name: 'TRF-SOUTH-01',
            workOrderTitle: 'Traffic Signal Assessment',
            projectName: 'Downtown Inspection',
            zoneName: 'Downtown South',
            date: '2025-05-20',
            duration: '25 mins',
            status: 'completed',
            pilot: 'Maria Garcia',
            imagesCount: 43,
          },
          {
            id: 4,
            name: 'SOL-ARY-A-01',
            workOrderTitle: 'Solar Panel Efficiency Analysis',
            projectName: 'Solar Farm Survey',
            zoneName: 'Solar Array A',
            date: '2025-06-10',
            duration: '',
            status: 'scheduled',
            pilot: 'David Smith',
            imagesCount: 0,
          },
        ]);
      } catch (error) {
        console.error('Error fetching flights:', error);
      }
    };

    fetchFlights();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Flights
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Schedule Flight
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell>Flight ID</TableCell>
              <TableCell>Work Order</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Pilot</TableCell>
              <TableCell align="center">Images</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flights.map((flight) => (
              <TableRow key={flight.id} hover>
                <TableCell>{flight.name}</TableCell>
                <TableCell>{flight.workOrderTitle}</TableCell>
                <TableCell>{flight.projectName}</TableCell>
                <TableCell>{flight.zoneName}</TableCell>
                <TableCell>{flight.date}</TableCell>
                <TableCell>{flight.duration}</TableCell>
                <TableCell>
                  <Chip
                    label={flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                    color={getStatusColor(flight.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{flight.pilot}</TableCell>
                <TableCell align="center">{flight.imagesCount}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="primary">
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary"
                    disabled={flight.status === 'scheduled' || flight.imagesCount === 0}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary"
                    disabled={flight.status === 'completed'}
                  >
                    <EditIcon fontSize="small" />
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

export default Flights;
