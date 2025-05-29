const express = require('express');
const router = express.Router();
const workOrderLifecycleController = require('../controllers/workOrderLifecycle.controller');
const { auth } = require('../middleware/auth.middleware');

// Get all possible work order statuses
router.get('/statuses', workOrderLifecycleController.getAllWorkOrderStatuses);

// Get available status transitions for a work order
router.get('/workorder/:id/transitions', auth, workOrderLifecycleController.getAvailableTransitions);

// Update work order status
router.post('/workorder/:id/status', auth, workOrderLifecycleController.updateWorkOrderStatus);

// Update field required for status transition
router.post('/workorder/:id/field', auth, workOrderLifecycleController.updateTransitionField);

// Upload document required for status transition
// Note: This route would typically use multer middleware for file uploads
router.post('/workorder/:id/document/:documentType', auth, workOrderLifecycleController.uploadTransitionDocument);

// Update quote information
router.post('/workorder/:id/quote', auth, workOrderLifecycleController.updateQuoteInfo);

// Update invoice information
router.post('/workorder/:id/invoice', auth, workOrderLifecycleController.updateInvoiceInfo);

module.exports = router;
