const Project = require('../models/project.model');
const Zone = require('../models/zone.model');
const WorkOrder = require('../models/workOrder.model');
const { ApiError } = require('../middleware/errorHandler');
const driveEventHandlers = require('../services/google/driveEventHandlers');

const ProjectController = {
  /**
   * Create a new project
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async create(req, res, next) {
    try {
      const projectData = req.body;
      const userId = req.user.id;

      const newProject = await Project.create(projectData, userId);
      
      // Trigger Google Drive folder creation asynchronously
      // We don't await this to avoid blocking the response
      driveEventHandlers.handleProjectCreated(newProject)
        .catch(err => console.error('Error in Drive folder creation:', err));
      
      res.status(201).json(newProject);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all projects with optional filtering
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getAllProjects(req, res, next) {
    try {
      // Extract filter parameters from query string
      const filters = {
        projectStatus: req.query.status,
        clientName: req.query.client,
        createdBy: req.query.createdBy
      };

      const projects = await Project.findAll(filters);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project by ID with related information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getProjectById(req, res, next) {
    try {
      const projectId = req.params.id;

      const project = await Project.findById(projectId);
      if (!project) {
        throw new ApiError('Project not found', 404);
      }

      // Get related data
      const zones = await Zone.findByProject(projectId);
      const workOrders = await WorkOrder.findByProject(projectId);
      const stats = await Project.getProjectStats(projectId);
      const financialSummary = await Project.getFinancialSummary(projectId);

      res.json({
        project,
        zones,
        workOrders,
        stats,
        financialSummary
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update project information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateProject(req, res, next) {
    try {
      const projectId = req.params.id;
      const projectData = req.body;

      // Check if project exists
      const existingProject = await Project.findById(projectId);
      if (!existingProject) {
        throw new ApiError('Project not found', 404);
      }

      const updatedProject = await Project.update(projectId, projectData);
      res.json(updatedProject);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a project
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async deleteProject(req, res, next) {
    try {
      const projectId = req.params.id;

      // Check if project exists
      const existingProject = await Project.findById(projectId);
      if (!existingProject) {
        throw new ApiError('Project not found', 404);
      }

      await Project.delete(projectId);
      res.json({ message: 'Project deleted successfully', projectId });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ProjectController;
