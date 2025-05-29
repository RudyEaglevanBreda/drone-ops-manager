import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Link,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import FileStorageService from '../../services/fileStorage.service';

const FolderLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[100],
  textDecoration: 'none',
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  }
}));

/**
 * Component to display Google Drive links for an entity
 * @param {Object} props - Component props
 * @param {string} props.entityType - Entity type ('project' or 'workorder')
 * @param {string} props.entityId - Entity ID
 * @param {string} props.title - Title for the Drive links section
 */
const DriveLinks = ({
  entityType,
  entityId,
  title = 'Google Drive Folders'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [folderInfo, setFolderInfo] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    // Skip if no entity ID
    if (!entityId) {
      setLoading(false);
      return;
    }

    const fetchFolderInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await FileStorageService.getDriveFolderInfo(
          entityType.toLowerCase(), // Ensure lowercase for API compatibility
          entityId
        );

        setFolderInfo(result);
      } catch (err) {
        console.error('Error fetching Drive folder info:', err);
        setError(err.message || 'Error fetching Google Drive folders');
      } finally {
        setLoading(false);
      }
    };

    fetchFolderInfo();
  }, [entityType, entityId, refreshCounter]);

  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading Drive folders...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mt: 2, mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // If no folder info or no folders found
  if (!folderInfo || !folderInfo.folders || folderInfo.folders.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        No Google Drive folders found. They may still be creating.
        <Button color="inherit" size="small" onClick={handleRefresh} sx={{ ml: 1 }}>
          Refresh
        </Button>
      </Alert>
    );
  }

  // Organize folders by category for better display
  const mainFolder = folderInfo.mainFolder;
  const subFolders = folderInfo.folders.filter(folder => folder.id !== mainFolder?.id);

  return (
    <Paper elevation={0} sx={{ p: 2, mt: 2, mb: 2, backgroundColor: 'background.paper' }}>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      
      <Divider sx={{ mb: 2 }} />

      {/* Main folder */}
      {mainFolder && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Main Folder
          </Typography>
          <Tooltip title="Open in Google Drive" placement="top">
            <FolderLink 
              href={FileStorageService.generateDriveFolderUrl(mainFolder.id)} 
              target="_blank"
              rel="noopener noreferrer"
            >
              <FolderIcon />
              <Typography variant="body2">{mainFolder.name}</Typography>
            </FolderLink>
          </Tooltip>
        </Box>
      )}

      {/* Sub folders */}
      {subFolders.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Sub Folders
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1 
          }}>
            {subFolders.map((folder) => (
              <Tooltip key={folder.id} title="Open in Google Drive" placement="top">
                <FolderLink 
                  href={FileStorageService.generateDriveFolderUrl(folder.id)} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FolderIcon />
                  <Typography variant="body2">{folder.name}</Typography>
                </FolderLink>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}

      <Button 
        size="small" 
        onClick={handleRefresh} 
        sx={{ mt: 2 }}
      >
        Refresh Folders
      </Button>
    </Paper>
  );
};

export default DriveLinks;
