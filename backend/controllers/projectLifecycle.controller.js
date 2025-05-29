const Project = require('../models/project.model');
const projectLifecycle = require('../utils/projectLifecycle');
const { ApiError } = require('../middleware/errorHandler');

const ProjectLifecycleController = {
  /**
   * Get available status transitions for a project
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getAvailableTransitions(req, res, next) {
    try {
      const projectId = req.params.id;

      // Get project details
      const project = await Project.findById(projectId);
      if (!project) {
        throw new ApiError('Project not found', 404);
      }

      // Get available next statuses
      const currentStatus = project.projectstatus;
      const availableStatuses = projectLifecycle.getAvailableNextStatuses(currentStatus);

      // For each available status, check if requirements are met
      const transitions = availableStatuses.map(status => {
        const validation = projectLifecycle.validateTransition(project, status);
        return {
          status,
          requirementsMet: validation.valid,
          requirementsMessage: validation.message,
          buttonLabel: `Move to ${status}`,
          description: projectLifecycle.getStatusGuidance(status)
        };
      });

      res.json({
        currentStatus,
        currentGuidance: projectLifecycle.getStatusGuidance(currentStatus),
        availableTransitions: transitions
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update project status
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateProjectStatus(req, res, next) {
    try {
      const projectId = req.params.id;
      const { nextStatus } = req.body;

      // Get project details
      const project = await Project.findById(projectId);
      if (!project) {
        throw new ApiError('Project not found', 404);
      }

      // Validate transition
      const validation = projectLifecycle.validateTransition(project, nextStatus);
      if (!validation.valid) {
        throw new ApiError(validation.message, 400);
      }

      // Update project status
      const updatedProject = await Project.update(projectId, { projectStatus: nextStatus });

      res.json({
        success: true,
        message: `Project status updated to '${nextStatus}'`,
        project: updatedProject,
        guidance: projectLifecycle.getStatusGuidance(nextStatus)
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all possible project statuses
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getAllProjectStatuses(req, res, next) {
    try {
      const statuses = projectLifecycle.getAllStatuses();
      const statusArray = Object.values(statuses);
      
      const statusDetails = statusArray.map(status => ({
        status,
        guidance: projectLifecycle.getStatusGuidance(status)
      }));

      res.json(statusDetails);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update project field required for status transition
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateTransitionField(req, res, next) {
    try {
      const projectId = req.params.id;
      const { field, value } = req.body;

      // Get project details
      const project = await Project.findById(projectId);
      if (!project) {
        throw new ApiError('Project not found', 404);
      }

      // Validate field name (security check)
      const allowedFields = ['meetingNotes', 'contractDocumentPDF_Path', 'projectBoundaryKML_Path'];
      if (!allowedFields.includes(field)) {
        throw new ApiError(`Field '${field}' cannot be updated through this endpoint`, 400);
      }

      // Update the specific field
      const updateData = {};
      updateData[field] = value;
      
      const updatedProject = await Project.update(projectId, updateData);

      // Get available transitions after update
      const currentStatus = updatedProject.projectstatus;
      const availableStatuses = projectLifecycle.getAvailableNextStatuses(currentStatus);
      const transitions = availableStatuses.map(status => {
        const validation = projectLifecycle.validateTransition(updatedProject, status);
        return {
          status,
          requirementsMet: validation.valid,
          requirementsMessage: validation.message
        };
      });

      res.json({
        success: true,
        message: `Field '${field}' updated successfully`,
        project: updatedProject,
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
      const projectId = req.params.id;
      const { documentType } = req.params;
      const filePath = req.file ? req.file.path : null;

      if (!filePath) {
        throw new ApiError('No file uploaded', 400);
      }

      // Map document type to project field
      let fieldToUpdate;
      switch (documentType) {
        case 'contract':
          fieldToUpdate = 'contractDocumentPDF_Path';
          break;
        case 'boundary':
          fieldToUpdate = 'projectBoundaryKML_Path';
          break;
        default:
          throw new ApiError(`Invalid document type: ${documentType}`, 400);
      }

      // Update project with the file path
      const updateData = {};
      updateData[fieldToUpdate] = filePath;
      
      const updatedProject = await Project.update(projectId, updateData);

      res.json({
        success: true,
        message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded successfully`,
        project: updatedProject
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ProjectLifecycleController;
