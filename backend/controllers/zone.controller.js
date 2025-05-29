const Zone = require('../models/zone.model');
const Project = require('../models/project.model');
const { ApiError } = require('../middleware/errorHandler');

const ZoneController = {
  /**
   * Create a new zone
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async create(req, res, next) {
    try {
      const zoneData = req.body;
      
      // Check if project exists
      const project = await Project.findById(zoneData.projectId);
      if (!project) {
        throw new ApiError('Project not found', 404);
      }

      const newZone = await Zone.create(zoneData);
      res.status(201).json(newZone);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all zones for a project
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getZonesByProject(req, res, next) {
    try {
      const projectId = req.params.projectId;
      
      // Check if project exists
      const project = await Project.findById(projectId);
      if (!project) {
        throw new ApiError('Project not found', 404);
      }

      const zones = await Zone.findByProject(projectId);
      res.json(zones);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get zone by ID
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getZoneById(req, res, next) {
    try {
      const zoneId = req.params.id;

      const zone = await Zone.findById(zoneId);
      if (!zone) {
        throw new ApiError('Zone not found', 404);
      }

      res.json(zone);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update zone information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async updateZone(req, res, next) {
    try {
      const zoneId = req.params.id;
      const zoneData = req.body;

      // Check if zone exists
      const existingZone = await Zone.findById(zoneId);
      if (!existingZone) {
        throw new ApiError('Zone not found', 404);
      }

      const updatedZone = await Zone.update(zoneId, zoneData);
      res.json(updatedZone);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a zone
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async deleteZone(req, res, next) {
    try {
      const zoneId = req.params.id;

      // Check if zone exists
      const existingZone = await Zone.findById(zoneId);
      if (!existingZone) {
        throw new ApiError('Zone not found', 404);
      }

      await Zone.delete(zoneId);
      res.json({ message: 'Zone deleted successfully', zoneId });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle zone active status
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async toggleZoneActive(req, res, next) {
    try {
      const zoneId = req.params.id;
      const { isActive } = req.body;

      // Check if zone exists
      const existingZone = await Zone.findById(zoneId);
      if (!existingZone) {
        throw new ApiError('Zone not found', 404);
      }

      const updatedZone = await Zone.toggleActive(zoneId, isActive);
      res.json(updatedZone);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ZoneController;
