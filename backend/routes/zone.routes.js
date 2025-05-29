const express = require('express');
const router = express.Router();
const ZoneController = require('../controllers/zone.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Zone routes - all protected by authentication
router.use(authenticateToken);

// Get zones by project is implemented
router.get('/project/:projectId', ZoneController.getZonesByProject);
router.get('/:id', ZoneController.getZoneById);
router.post('/', ZoneController.create);
router.put('/:id', ZoneController.updateZone);
router.delete('/:id', ZoneController.deleteZone);

// Note: getAllZones is not implemented in the controller

module.exports = router;
