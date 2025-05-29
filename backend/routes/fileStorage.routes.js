/**
 * File Storage Routes
 * 
 * Routes for file uploads and Google Drive integration
 */

const express = require('express');
const router = express.Router();
const fileStorageController = require('../controllers/fileStorage.controller');
const { upload, handleUploadError } = require('../middleware/fileUpload.middleware');
const { auth } = require('../middleware/auth.middleware');

// Project file uploads
router.post('/project/:id/upload/:documentType', 
  auth, 
  upload.single('file'),
  handleUploadError,
  fileStorageController.uploadProjectFile
);

// Work Order file uploads
router.post('/workorder/:id/upload/:documentType', 
  auth, 
  upload.single('file'),
  handleUploadError,
  fileStorageController.uploadWorkOrderFile
);

// Zone file uploads
router.post('/zone/:id/upload', 
  auth, 
  upload.single('file'),
  handleUploadError,
  fileStorageController.uploadZoneFile
);

// Flight file uploads
router.post('/flight/:id/upload/:documentType', 
  auth, 
  upload.single('file'),
  handleUploadError,
  fileStorageController.uploadFlightFile
);

// Get Drive folder information
router.get('/folder/:type/:id', 
  auth, 
  fileStorageController.getDriveFolderInfo
);

module.exports = router;
