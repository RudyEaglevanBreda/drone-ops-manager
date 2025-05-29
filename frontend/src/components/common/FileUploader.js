import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const VisuallyHiddenInput = styled('input')({  
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FileInfo = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[100],
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

/**
 * Reusable file uploader component
 * @param {Object} props - Component props
 * @param {string} props.entityType - Entity type (project, workorder, zone, flight)
 * @param {string} props.entityId - Entity ID
 * @param {string} props.documentType - Document type (contract, boundary, quote, etc.)
 * @param {Function} props.onUploadSuccess - Callback function after successful upload
 * @param {Function} props.uploadFunction - Function to call for file upload
 * @param {Array} props.acceptedFileTypes - Array of accepted file extensions (.pdf, .kml, etc.)
 * @param {string} props.buttonLabel - Label for the upload button
 * @param {string} props.title - Title for the upload dialog
 */
const FileUploader = ({
  entityType,
  entityId,
  documentType,
  onUploadSuccess,
  uploadFunction,
  acceptedFileTypes = [],
  buttonLabel = 'Upload File',
  title = 'Upload File',
  buttonVariant = 'contained',
  buttonColor = 'primary',
  buttonSize = 'medium',
  dialogWidth = 'sm',
  fullWidth = true
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // File selection handler
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    // Validate file type if acceptedFileTypes are provided
    if (acceptedFileTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!acceptedFileTypes.includes(fileExtension)) {
        setError(`Invalid file type. Please select one of the following: ${acceptedFileTypes.join(', ')}`);
        setSelectedFile(null);
        return;
      }
    }
    
    setSelectedFile(file);
    setError(null);
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(false);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        // Increase progress by random amount between 5-15%, max 95%
        const newProgress = Math.min(prev + Math.random() * 10 + 5, 95);
        return newProgress;
      });
    }, 500);
    
    try {
      // Call the appropriate upload function based on entity type
      const result = await uploadFunction(entityId, documentType, selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      
      // Call the success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      // Close dialog after short delay
      setTimeout(() => {
        setDialogOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Error uploading file');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Open dialog handler
  const handleOpenDialog = () => {
    setDialogOpen(true);
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
  };

  // Close dialog handler
  const handleCloseDialog = () => {
    if (uploading) return; // Prevent closing while uploading
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        component="span"
        variant={buttonVariant}
        color={buttonColor}
        size={buttonSize}
        startIcon={<CloudUploadIcon />}
        onClick={handleOpenDialog}
      >
        {buttonLabel}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth={dialogWidth}
        fullWidth={fullWidth}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              icon={<CheckCircleIcon fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              File uploaded successfully!
            </Alert>
          )}
          
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {acceptedFileTypes.length > 0 ? (
                <>Accepted file types: {acceptedFileTypes.join(', ')}</>
              ) : (
                'Select a file to upload'
              )}
            </Typography>
            
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileIcon />}
              disabled={uploading}
              sx={{ mt: 1 }}
            >
              Select File
              <VisuallyHiddenInput 
                type="file" 
                onChange={handleFileChange}
                accept={acceptedFileTypes.join(',')}
              />
            </Button>
          </Box>
          
          {selectedFile && (
            <FileInfo>
              <AttachFileIcon color="primary" fontSize="small" />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </Typography>
            </FileInfo>
          )}
          
          {uploadProgress > 0 && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                color={success ? "success" : "primary"}
              />
              <Typography 
                variant="body2" 
                color="text.secondary"
                align="center"
                sx={{ mt: 0.5 }}
              >
                {success ? 'Upload complete!' : `Uploading... ${Math.round(uploadProgress)}%`}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={!selectedFile || uploading || success}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileUploader;
