const express = require('express');
const router = express.Router();
const { getAllWorkOrders, getWorkOrdersByProject, getWorkOrderById, createWorkOrder, updateWorkOrder, deleteWorkOrder } = require('../controllers/workOrder.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Work Order routes - all protected by authentication
router.use(authenticateToken);

router.get('/', getAllWorkOrders);
router.get('/project/:projectId', getWorkOrdersByProject);
router.get('/:id', getWorkOrderById);
router.post('/', createWorkOrder);
router.put('/:id', updateWorkOrder);
router.delete('/:id', deleteWorkOrder);

module.exports = router;
