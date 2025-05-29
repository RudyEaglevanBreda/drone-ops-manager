const express = require('express');
const router = express.Router();
const { getAllZones, getZonesByProject, getZoneById, createZone, updateZone, deleteZone } = require('../controllers/zone.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Zone routes - all protected by authentication
router.use(authenticateToken);

router.get('/', getAllZones);
router.get('/project/:projectId', getZonesByProject);
router.get('/:id', getZoneById);
router.post('/', createZone);
router.put('/:id', updateZone);
router.delete('/:id', deleteZone);

module.exports = router;
