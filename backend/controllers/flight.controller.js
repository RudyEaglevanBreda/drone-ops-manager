const Flight = require('../models/flight.model');
const WorkOrder = require('../models/workOrder.model');
const { ApiError } = require('../middleware/errorHandler');

const FlightController = {
  /**
   * Create a new flight
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async create(req, res, next) {
    try {
      const flightData = req.body;
      const userId = req.user.id;
      
      // Check if work order exists
      const workOrder = await WorkOrder.findById(flightData.workOrderId);
      if (!workOrder) {
        throw new ApiError('Work order not found', 404);
      }

      const newFlight = await Flight.create({
        ...flightData,
        pilotId: userId
      });

      res.status(201).json({
        success: true,
        data: newFlight
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get flights for a specific work order
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getFlightsByWorkOrder(req, res, next) {
    try {
      const { workOrderId } = req.params;
      
      const flights = await Flight.findByWorkOrder(workOrderId);

      res.status(200).json({
        success: true,
        count: flights.length,
        data: flights
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get flight by ID
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getFlightById(req, res, next) {
    try {
      const { id } = req.params;
      
      const flight = await Flight.findById(id);
      if (!flight) {
        throw new ApiError('Flight not found', 404);
      }

      res.status(200).json({
        success: true,
        data: flight
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update flight information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateFlight(req, res, next) {
    try {
      const { id } = req.params;
      const flightData = req.body;
      
      // Check if flight exists
      const flight = await Flight.findById(id);
      if (!flight) {
        throw new ApiError('Flight not found', 404);
      }

      const updatedFlight = await Flight.update(id, flightData);

      res.status(200).json({
        success: true,
        data: updatedFlight
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a flight
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async deleteFlight(req, res, next) {
    try {
      const { id } = req.params;
      
      // Check if flight exists
      const flight = await Flight.findById(id);
      if (!flight) {
        throw new ApiError('Flight not found', 404);
      }

      await Flight.delete(id);

      res.status(200).json({
        success: true,
        message: 'Flight deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = FlightController;
