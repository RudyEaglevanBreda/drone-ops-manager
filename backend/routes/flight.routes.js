const express = require('express');
const router = express.Router();
const { getAllFlights, getFlightsByWorkOrder, getFlightById, createFlight, updateFlight, deleteFlight } = require('../controllers/flight.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Flight routes - all protected by authentication
router.use(authenticateToken);

router.get('/', getAllFlights);
router.get('/workorder/:workOrderId', getFlightsByWorkOrder);
router.get('/:id', getFlightById);
router.post('/', createFlight);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);

module.exports = router;
