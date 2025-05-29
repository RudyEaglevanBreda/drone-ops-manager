import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Stack } from '@mui/material';
import {
  Business as ProjectIcon,
  Place as ZoneIcon,
  Assignment as WorkOrderIcon,
  FlightTakeoff as FlightIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 1,
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    zones: 0,
    workOrders: 0,
    flights: 0,
  });

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // This is a placeholder for demonstration
    const fetchStats = async () => {
      try {
        // Mock data for demonstration
        setStats({
          projects: 12,
          zones: 48,
          workOrders: 36,
          flights: 124,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome to your Drone Operations command center
      </Typography>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Projects"
            value={stats.projects}
            icon={<ProjectIcon color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Zones"
            value={stats.zones}
            icon={<ZoneIcon color="success" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Work Orders"
            value={stats.workOrders}
            icon={<WorkOrderIcon color="warning" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Flights"
            value={stats.flights}
            icon={<FlightIcon color="info" />}
            color="info"
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" component="h2" gutterBottom>
          Recent Activity
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography>Flight completed for Project XYZ - Zone A</Typography>
            <Typography>New work order created for Project ABC</Typography>
            <Typography>Zone mapping updated for Downtown Project</Typography>
            <Typography>New client project onboarded: Citywide Survey</Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
