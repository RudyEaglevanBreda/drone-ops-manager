const express = require('express');
const router = express.Router();
const WorkOrderController = require('../controllers/workOrder.controller');
const { auth } = require('../middleware/auth.middleware');

// Work Order routes - all protected by authentication
router.use(auth);

router.get('/', WorkOrderController.getAllWorkOrders);
router.get('/project/:projectId', WorkOrderController.getWorkOrdersByProject);
router.get('/:id', WorkOrderController.getWorkOrderById);
router.post('/', WorkOrderController.create);
router.put('/:id', WorkOrderController.updateWorkOrder);
router.delete('/:id', WorkOrderController.deleteWorkOrder);

module.exports = router;
