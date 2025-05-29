import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import { Person as PersonIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  // Call useAuth but we're not using any values from it yet
  const auth = useAuth();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // In a real app, this would come from the currentUser object
  // This is just for demonstration
  const [formData, setFormData] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 987-6543',
    company: 'Drone Solutions Ltd',
    role: 'Chief Pilot',
    licenseNumber: 'RP-12345-XYZ',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }, 3000);
    }, 1000);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your changes have been saved successfully.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                mb: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h6">{`${formData.firstName} ${formData.lastName}`}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formData.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formData.company}
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Upload Photo
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Drone License Number"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
