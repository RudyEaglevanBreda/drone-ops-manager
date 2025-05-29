import React from 'react';
import { Box, Typography, Paper, SvgIcon } from '@mui/material';
import { useNetwork } from '../../context/NetworkContext';

// Custom offline icon
const OfflineIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M24 8.98C20.93 5.9 16.69 4 12 4C7.31 4 3.07 5.9 0 8.98L12 21L24 8.98zM2.92 9.07C5.51 7.08 8.67 6 12 6s6.49 1.08 9.08 3.07l-9.08 9.08-9.08-9.08z" />
    <path d="M12 18l6.36-6.36C17.07 10.33 15.54 10 14 10c-4.41 0-8 3.59-8 8 0 1.54.33 3.07.64 4.36L12 18z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </SvgIcon>
);

const OfflineIndicator = () => {
  const { online, syncing, lastSyncResult, sync } = useNetwork();

  if (online) return null; // Don't show anything when online

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'warning.main',
        color: 'warning.contrastText',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 1,
      }}
    >
      <Box display="flex" alignItems="center">
        <OfflineIcon sx={{ mr: 1 }} />
        <Typography variant="body2" fontWeight="bold">
          You are currently offline. Changes will be synchronized when you reconnect.
        </Typography>
      </Box>
    </Paper>
  );
};

export default OfflineIndicator;
