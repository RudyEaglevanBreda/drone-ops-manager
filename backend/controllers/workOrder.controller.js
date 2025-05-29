const WorkOrder = require('../models/workOrder.model');
const Project = require('../models/project.model');
const Zone = require('../models/zone.model');
const Flight = require('../models/flight.model');
const { ApiError } = require('../middleware/errorHandler');
const driveEventHandlers = require('../services/google/driveEventHandlers');

const WorkOrderController = {
  /**
   * Create a new work order
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async create(req, res, next) {
    try {
      const workOrderData = req.body;
      const userId = req.user.id;
      
      // Check if project exists
      const project = await Project.findById(workOrderData.projectId);
      if (!project) {
        throw new ApiError('Project not found', 404);
      }
      
      // Check if zone exists (if zoneId is provided)
      if (workOrderData.zoneId) {
        const zone = await Zone.findById(workOrderData.zoneId);
        if (!zone) {
          throw new ApiError('Zone not found', 404);
        }
        
        // Ensure zone belongs to the specified project
        if (zone.projectid !== workOrderData.projectId) {
          throw new ApiError('Zone does not belong to the specified project', 400);
        }
      }

      const newWorkOrder = await WorkOrder.create(workOrderData, userId);
      
      // Trigger Google Drive folder creation asynchronously
      // We don't await this to avoid blocking the response
      driveEventHandlers.handleWorkOrderCreated(newWorkOrder)
        .catch(err => console.error('Error in Drive folder creation for work order:', err));
      
      res.status(201).json(newWorkOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all work orders with optional filtering
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getAllWorkOrders(req, res, next) {
    try {
      // Extract filter parameters from query string
      const filters = {
        projectId: req.query.projectId,
        zoneId: req.query.zoneId,
        workOrderStatus: req.query.status,
        scheduledDateStart: req.query.startDate,
        scheduledDateEnd: req.query.endDate
      };

      const workOrders = await WorkOrder.findAll(filters);
      res.json(workOrders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get work orders for a specific project
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getWorkOrdersByProject(req, res, next) {
    try {
      const projectId = req.params.projectId;
      
      // Check if project exists
      const project = await Project.findById(projectId);
      if (!project) {
        throw new ApiError('Project not found', 404);
      }

      const workOrders = await WorkOrder.findByProject(projectId);
      res.json(workOrders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get work order by ID with related information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getWorkOrderById(req, res, next) {
    try {
      const workOrderId = req.params.id;

      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new ApiError('Work order not found', 404);
      }

      // Get related flights
      const flights = await Flight.findByWorkOrder(workOrderId);
      const flightStats = await Flight.getWorkOrderFlightStats(workOrderId);

      res.json({
        workOrder,
        flights,
        flightStats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update work order information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateWorkOrder(req, res, next) {
    try {
      const workOrderId = req.params.id;
      const workOrderData = req.body;

      // Check if work order exists
      const existingWorkOrder = await WorkOrder.findById(workOrderId);
      if (!existingWorkOrder) {
        throw new ApiError('Work order not found', 404);
      }
      
      // If zoneId is being updated, verify it exists and belongs to the project
      if (workOrderData.zoneId && workOrderData.zoneId !== existingWorkOrder.zoneid) {
        const zone = await Zone.findById(workOrderData.zoneId);
        if (!zone) {
          throw new ApiError('Zone not found', 404);
        }
        
        if (zone.projectid !== existingWorkOrder.projectid) {
          throw new ApiError('Zone does not belong to the work order\'s project', 400);
        }
      }

      const updatedWorkOrder = await WorkOrder.update(workOrderId, workOrderData);
      res.json(updatedWorkOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a work order
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async deleteWorkOrder(req, res, next) {
    try {
      const workOrderId = req.params.id;

      // Check if work order exists
      const existingWorkOrder = await WorkOrder.findById(workOrderId);
      if (!existingWorkOrder) {
        throw new ApiError('Work order not found', 404);
      }

      await WorkOrder.delete(workOrderId);
      res.json({ message: 'Work order deleted successfully', workOrderId });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update work order status
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateWorkOrderStatus(req, res, next) {
    try {
      const workOrderId = req.params.id;
      const { status } = req.body;

      // Check if work order exists
      const existingWorkOrder = await WorkOrder.findById(workOrderId);
      if (!existingWorkOrder) {
        throw new ApiError('Work order not found', 404);
      }

      const updatedWorkOrder = await WorkOrder.updateStatus(workOrderId, status);
      res.json(updatedWorkOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update quote information for a work order
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateQuote(req, res, next) {
    try {
      const workOrderId = req.params.id;
      const quoteData = req.body;

      // Check if work order exists
      const existingWorkOrder = await WorkOrder.findById(workOrderId);
      if (!existingWorkOrder) {
        throw new ApiError('Work order not found', 404);
      }

      const updatedWorkOrder = await WorkOrder.updateQuote(workOrderId, quoteData);
      res.json(updatedWorkOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update invoice information for a work order
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateInvoice(req, res, next) {
    try {
      const workOrderId = req.params.id;
      const invoiceData = req.body;

      // Check if work order exists
      const existingWorkOrder = await WorkOrder.findById(workOrderId);
      if (!existingWorkOrder) {
        throw new ApiError('Work order not found', 404);
      }

      const updatedWorkOrder = await WorkOrder.updateInvoice(workOrderId, invoiceData);
      res.json(updatedWorkOrder);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = WorkOrderController;
