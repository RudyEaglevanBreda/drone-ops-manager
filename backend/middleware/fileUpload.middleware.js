/**
 * File Upload Middleware
 * 
 * Handles file uploads using Multer and prepares them for Google Drive storage
 */

const multer = require('multer');
const path = require('path');
const { ApiError } = require('./errorHandler');

// Configure memory storage for multer (files stored in memory before upload to Drive)
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const fileTypes = {
    'contract': ['.pdf'],
    'boundary': ['.kml', '.kmz'],
    'quote': ['.pdf'],
    'invoice': ['.pdf'],
    'operational': ['.kml', '.kmz'],
    'raw': ['.zip', '.tif', '.tiff', '.jpg', '.jpeg', '.png'],
    'processed': ['.zip', '.tif', '.tiff', '.jpg', '.jpeg', '.png'],
    'zone': ['.kml', '.kmz']
  };
  
  // Get document type from request params or body
  const documentType = req.params.documentType || req.body.documentType;
  
  if (!documentType) {
    return cb(new ApiError('Document type not specified', 400), false);
  }
  
  const allowedExtensions = fileTypes[documentType] || [];
  
  if (allowedExtensions.length === 0) {
    return cb(new ApiError(`Unsupported document type: ${documentType}`, 400), false);
  }
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    return cb(null, true);
  } else {
    return cb(new ApiError(`File type not allowed. Expected ${allowedExtensions.join(', ')}`, 400), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Helper function to get MIME type from file extension
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.kml': 'application/vnd.google-earth.kml+xml',
    '.kmz': 'application/vnd.google-earth.kmz',
    '.zip': 'application/zip',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

// Middleware to handle file upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds the limit (50MB)' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

module.exports = {
  upload,
  getMimeType,
  handleUploadError
};
