const WorkOrder = require('../models/workOrder.model');
const workOrderLifecycle = require('../utils/workOrderLifecycle');
const { ApiError } = require('../middleware/errorHandler');

const WorkOrderLifecycleController = {
  /**
   * Get available status transitions for a work order
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getAvailableTransitions(req, res, next) {
    try {
      const workOrderId = req.params.id;

      // Get work order details
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new ApiError('Work order not found', 404);
      }

      // Get available next statuses
      const currentStatus = workOrder.workorderstatus;
      const availableStatuses = workOrderLifecycle.getAvailableNextStatuses(currentStatus);

      // For each available status, check if requirements are met
      const transitions = availableStatuses.map(status => {
        const validation = workOrderLifecycle.validateTransition(workOrder, status);
        return {
          status,
          requirementsMet: validation.valid,
          requirementsMessage: validation.message,
          buttonLabel: `Move to ${status}`,
          description: workOrderLifecycle.getStatusGuidance(status)
        };
      });

      // Get external tools for current status
      const externalTools = workOrderLifecycle.getExternalTools(currentStatus);

      res.json({
        currentStatus,
        currentGuidance: workOrderLifecycle.getStatusGuidance(currentStatus),
        availableTransitions: transitions,
        externalTools
      });
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
      const { nextStatus } = req.body;

      // Get work order details
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new ApiError('Work order not found', 404);
      }

      // Validate transition
      const validation = workOrderLifecycle.validateTransition(workOrder, nextStatus);
      if (!validation.valid) {
        throw new ApiError(validation.message, 400);
      }

      // Special handling for specific transitions
      if (nextStatus === workOrderLifecycle.WORKORDER_STATUSES.CLIENT_APPROVED) {
        // Update quote status to 'Accepted' when work order is approved
        await WorkOrder.updateQuote(workOrderId, { quoteStatusWO: 'Accepted' });
      } else if (nextStatus === workOrderLifecycle.WORKORDER_STATUSES.CLIENT_REJECTED) {
        // Update quote status to 'Rejected' when work order is rejected
        await WorkOrder.updateQuote(workOrderId, { quoteStatusWO: 'Rejected' });
      } else if (nextStatus === workOrderLifecycle.WORKORDER_STATUSES.PAID) {
        // Update invoice status to 'Paid' when work order is marked as paid
        await WorkOrder.updateInvoice(workOrderId, { invoiceStatusWO: 'Paid' });
      }

      // Update work order status
      const updatedWorkOrder = await WorkOrder.updateStatus(workOrderId, nextStatus);

      res.json({
        success: true,
        message: `Work order status updated to '${nextStatus}'`,
        workOrder: updatedWorkOrder,
        guidance: workOrderLifecycle.getStatusGuidance(nextStatus)
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all possible work order statuses
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getAllWorkOrderStatuses(req, res, next) {
    try {
      const statuses = workOrderLifecycle.getAllStatuses();
      const statusArray = Object.values(statuses);
      
      const statusDetails = statusArray.map(status => ({
        status,
        guidance: workOrderLifecycle.getStatusGuidance(status)
      }));

      res.json(statusDetails);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update work order field required for status transition
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateTransitionField(req, res, next) {
    try {
      const workOrderId = req.params.id;
      const { field, value } = req.body;

      // Get work order details
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new ApiError('Work order not found', 404);
      }

      // Validate field name (security check)
      const allowedFields = [
        'servicesRequestedWO', 
        'operationalKML_WO_Path', 
        'quoteAmountWO',
        'quotePDF_Path_WO',
        'scheduledDate',
        'invoiceAmountWO',
        'invoicePDF_Path_WO'
      ];
      
      if (!allowedFields.includes(field)) {
        throw new ApiError(`Field '${field}' cannot be updated through this endpoint`, 400);
      }

      // Update the specific field
      const updateData = {};
      updateData[field] = value;
      
      const updatedWorkOrder = await WorkOrder.update(workOrderId, updateData);

      // Get available transitions after update
      const currentStatus = updatedWorkOrder.workorderstatus;
      const availableStatuses = workOrderLifecycle.getAvailableNextStatuses(currentStatus);
      const transitions = availableStatuses.map(status => {
        const validation = workOrderLifecycle.validateTransition(updatedWorkOrder, status);
        return {
          status,
          requirementsMet: validation.valid,
          requirementsMessage: validation.message
        };
      });

      res.json({
        success: true,
        message: `Field '${field}' updated successfully`,
        workOrder: updatedWorkOrder,
        availableTransitions: transitions
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload document required for status transition
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async uploadTransitionDocument(req, res, next) {
    try {
      const workOrderId = req.params.id;
      const { documentType } = req.params;
      const filePath = req.file ? req.file.path : null;

      if (!filePath) {
        throw new ApiError('No file uploaded', 400);
      }

      // Map document type to work order field
      let fieldToUpdate;
      switch (documentType) {
        case 'quote':
          fieldToUpdate = 'quotePDF_Path_WO';
          break;
        case 'operational':
          fieldToUpdate = 'operationalKML_WO_Path';
          break;
        case 'invoice':
          fieldToUpdate = 'invoicePDF_Path_WO';
          break;
        default:
          throw new ApiError(`Invalid document type: ${documentType}`, 400);
      }

      // Update work order with the file path
      const updateData = {};
      updateData[fieldToUpdate] = filePath;
      
      const updatedWorkOrder = await WorkOrder.update(workOrderId, updateData);

      res.json({
        success: true,
        message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded successfully`,
        workOrder: updatedWorkOrder
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update quote information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateQuoteInfo(req, res, next) {
    try {
      const workOrderId = req.params.id;
      const quoteData = req.body;

      // Get work order details
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new ApiError('Work order not found', 404);
      }

      // Update quote info
      const updatedWorkOrder = await WorkOrder.updateQuote(workOrderId, quoteData);

      res.json({
        success: true,
        message: 'Quote information updated successfully',
        workOrder: updatedWorkOrder
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update invoice information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateInvoiceInfo(req, res, next) {
    try {
      const workOrderId = req.params.id;
      const invoiceData = req.body;

      // Get work order details
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new ApiError('Work order not found', 404);
      }

      // Update invoice info
      const updatedWorkOrder = await WorkOrder.updateInvoice(workOrderId, invoiceData);

      res.json({
        success: true,
        message: 'Invoice information updated successfully',
        workOrder: updatedWorkOrder
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = WorkOrderLifecycleController;
