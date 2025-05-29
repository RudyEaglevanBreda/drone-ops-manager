const express = require('express');
const router = express.Router();
const projectLifecycleController = require('../controllers/projectLifecycle.controller');
const { auth } = require('../middleware/auth.middleware');

// Get all possible project statuses
router.get('/statuses', projectLifecycleController.getAllProjectStatuses);

// Get available status transitions for a project
router.get('/project/:id/transitions', auth, projectLifecycleController.getAvailableTransitions);

// Update project status
router.post('/project/:id/status', auth, projectLifecycleController.updateProjectStatus);

// Update field required for status transition
router.post('/project/:id/field', auth, projectLifecycleController.updateTransitionField);

// Upload document required for status transition
// Note: This route would typically use multer middleware for file uploads
router.post('/project/:id/document/:documentType', auth, projectLifecycleController.uploadTransitionDocument);

module.exports = router;
