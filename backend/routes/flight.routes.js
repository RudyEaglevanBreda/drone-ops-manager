const express = require('express');
const router = express.Router();
const FlightController = require('../controllers/flight.controller');
const { auth } = require('../middleware/auth.middleware');

// Flight routes - all protected by authentication
router.use(auth);

// router.get('/', FlightController.getAllFlights); // Not implemented yet
router.get('/workorder/:workOrderId', FlightController.getFlightsByWorkOrder);
router.get('/:id', FlightController.getFlightById);
router.post('/', FlightController.create);
router.put('/:id', FlightController.updateFlight);
router.delete('/:id', FlightController.deleteFlight);

module.exports = router;
