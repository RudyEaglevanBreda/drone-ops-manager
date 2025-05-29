/**
 * File Storage Controller
 * 
 * Handles file uploads and Google Drive integration
 */

const path = require('path');
const { ApiError } = require('../middleware/errorHandler');
const Project = require('../models/project.model');
const WorkOrder = require('../models/workOrder.model');
const Zone = require('../models/zone.model');
const Flight = require('../models/flight.model');
const driveService = require('../services/google/driveService');
const folderAutomationService = require('../services/google/folderAutomationService');
const { getMimeType } = require('../middleware/fileUpload.middleware');

const FileStorageController = {
  /**
   * Upload a file for a Project
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async uploadProjectFile(req, res, next) {
    try {
      // Get project ID and document type from request
      const projectId = req.params.id;
      const documentType = req.params.documentType;
      
      // Check if file was uploaded
      if (!req.file) {
        throw new ApiError('No file uploaded', 400);
      }
      
      // Get the project
      const project = await Project.findById(projectId);
      if (!project) {
        throw new ApiError('Project not found', 404);
      }
      
      // Check if project has a Google Drive folder
      if (!project.projectfolderid_drive) {
        throw new ApiError('Project does not have a Google Drive folder', 400);
      }
      
      // Determine subfolder pattern and field to update based on document type
      let subfolderPattern, fieldToUpdate;
      
      switch (documentType) {
        case 'contract':
          subfolderPattern = '01_Contracts_Agreements';
          fieldToUpdate = 'contractDocumentPDF_Path';
          break;
        case 'boundary':
          subfolderPattern = '02_Site_Boundary_KML';
          fieldToUpdate = 'projectBoundaryKML_Path';
          break;
        default:
          throw new ApiError(`Unsupported document type: ${documentType}`, 400);
      }
      
      // Prepare the file
      const file = req.file;
      const fileName = `${project.projectid}_${documentType}_${Date.now()}${path.extname(file.originalname)}`;
      const mimeType = getMimeType(file.originalname);
      
      // Upload file to Google Drive
      // First find the appropriate subfolder
      const subfolders = await driveService.listFiles(
        project.projectfolderid_drive, 
        "mimeType = 'application/vnd.google-apps.folder'"
      );
      
      const targetSubfolder = subfolders.find(folder => folder.name.startsWith(subfolderPattern));
      
      if (!targetSubfolder) {
        throw new ApiError(`Subfolder ${subfolderPattern} not found`, 404);
      }
      
      // Upload the file to the subfolder
      const uploadedFile = await driveService.uploadFile(
        fileName,
        file.buffer,
        mimeType,
        targetSubfolder.id
      );
      
      // Update the project with the file web view link
      const updateData = {};
      updateData[fieldToUpdate] = uploadedFile.webViewLink;
      
      await Project.update(projectId, updateData);
      
      // Get updated project
      const updatedProject = await Project.findById(projectId);
      
      res.json({
        success: true,
        message: `${documentType} file uploaded successfully`,
        file: uploadedFile,
        project: updatedProject
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Upload a file for a Work Order
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async uploadWorkOrderFile(req, res, next) {
    try {
      // Get work order ID and document type from request
      const workOrderId = req.params.id;
      const documentType = req.params.documentType;
      
      // Check if file was uploaded
      if (!req.file) {
        throw new ApiError('No file uploaded', 400);
      }
      
      // Get the work order
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new ApiError('Work order not found', 404);
      }
      
      // Check if work order has a Google Drive folder
      if (!workOrder.workorderfolderid_drive) {
        throw new ApiError('Work order does not have a Google Drive folder', 400);
      }
      
      // Determine subfolder pattern and field to update based on document type
      let subfolderPattern, fieldToUpdate;
      
      switch (documentType) {
        case 'quote':
          subfolderPattern = '01_Quote_WO';
          fieldToUpdate = 'quotePDF_Path_WO';
          break;
        case 'invoice':
          subfolderPattern = '02_Invoice_WO';
          fieldToUpdate = 'invoicePDF_Path_WO';
          break;
        case 'operational':
          subfolderPattern = '03_Operational_Flight_Plans_WO';
          fieldToUpdate = 'operationalKML_WO_Path';
          break;
        case 'raw':
          subfolderPattern = '04_Raw_Flight_Data_WO';
          fieldToUpdate = 'rawDataLink_Path';
          break;
        case 'processed':
          subfolderPattern = '05_Processed_Deliverables_WO';
          fieldToUpdate = 'processedDataLink_Path';
          break;
        default:
          throw new ApiError(`Unsupported document type: ${documentType}`, 400);
      }
      
      // Prepare the file
      const file = req.file;
      const fileName = `${workOrder.workorderid}_${documentType}_${Date.now()}${path.extname(file.originalname)}`;
      const mimeType = getMimeType(file.originalname);
      
      // Upload file to Google Drive
      // First find the appropriate subfolder
      const subfolders = await driveService.listFiles(
        workOrder.workorderfolderid_drive, 
        "mimeType = 'application/vnd.google-apps.folder'"
      );
      
      const targetSubfolder = subfolders.find(folder => folder.name.startsWith(subfolderPattern));
      
      if (!targetSubfolder) {
        throw new ApiError(`Subfolder ${subfolderPattern} not found`, 404);
      }
      
      // Upload the file to the subfolder
      const uploadedFile = await driveService.uploadFile(
        fileName,
        file.buffer,
        mimeType,
        targetSubfolder.id
      );
      
      // Update the work order with the file web view link
      const updateData = {};
      updateData[fieldToUpdate] = uploadedFile.webViewLink;
      
      await WorkOrder.update(workOrderId, updateData);
      
      // Get updated work order
      const updatedWorkOrder = await WorkOrder.findById(workOrderId);
      
      res.json({
        success: true,
        message: `${documentType} file uploaded successfully`,
        file: uploadedFile,
        workOrder: updatedWorkOrder
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Upload a zone reference KML file
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async uploadZoneFile(req, res, next) {
    try {
      // Get zone ID from request
      const zoneId = req.params.id;
      
      // Check if file was uploaded
      if (!req.file) {
        throw new ApiError('No file uploaded', 400);
      }
      
      // Get the zone
      const zone = await Zone.findById(zoneId);
      if (!zone) {
        throw new ApiError('Zone not found', 404);
      }
      
      // Get the parent project
      const project = await Project.findById(zone.projectid);
      if (!project) {
        throw new ApiError('Parent project not found', 404);
      }
      
      // Check if project has a Google Drive folder
      if (!project.projectfolderid_drive) {
        throw new ApiError('Project does not have a Google Drive folder', 400);
      }
      
      // Prepare the file
      const file = req.file;
      const fileName = `Zone_${zone.zoneid}_${zone.zonename}_${Date.now()}${path.extname(file.originalname)}`;
      const mimeType = getMimeType(file.originalname);
      
      // Find the Zone Reference KMLs folder
      const subfolders = await driveService.listFiles(
        project.projectfolderid_drive, 
        "mimeType = 'application/vnd.google-apps.folder'"
      );
      
      const targetSubfolder = subfolders.find(folder => folder.name.startsWith('03_Zone_Reference_KMLs'));
      
      if (!targetSubfolder) {
        throw new ApiError('Zone Reference KMLs folder not found', 404);
      }
      
      // Upload the file to the subfolder
      const uploadedFile = await driveService.uploadFile(
        fileName,
        file.buffer,
        mimeType,
        targetSubfolder.id
      );
      
      // Update the zone with the file web view link
      await Zone.update(zoneId, { zoneReferenceKML_Path: uploadedFile.webViewLink });
      
      // Get updated zone
      const updatedZone = await Zone.findById(zoneId);
      
      res.json({
        success: true,
        message: 'Zone reference KML file uploaded successfully',
        file: uploadedFile,
        zone: updatedZone
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Upload a flight data file
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async uploadFlightFile(req, res, next) {
    try {
      // Get flight ID and document type from request
      const flightId = req.params.id;
      const documentType = req.params.documentType;
      
      // Check if file was uploaded
      if (!req.file) {
        throw new ApiError('No file uploaded', 400);
      }
      
      // Get the flight
      const flight = await Flight.findById(flightId);
      if (!flight) {
        throw new ApiError('Flight not found', 404);
      }
      
      // Get the parent work order
      const workOrder = await WorkOrder.findById(flight.workorderid);
      if (!workOrder) {
        throw new ApiError('Parent work order not found', 404);
      }
      
      // Check if work order has a Google Drive folder
      if (!workOrder.workorderfolderid_drive) {
        throw new ApiError('Work order does not have a Google Drive folder', 400);
      }
      
      // Determine subfolder pattern and field to update based on document type
      let subfolderPattern, fieldToUpdate;
      
      switch (documentType) {
        case 'raw':
          subfolderPattern = '04_Raw_Flight_Data_WO';
          fieldToUpdate = 'rawDataLink_Path';
          break;
        case 'processed':
          subfolderPattern = '05_Processed_Deliverables_WO';
          fieldToUpdate = 'processedDataLink_Path';
          break;
        default:
          throw new ApiError(`Unsupported document type: ${documentType}`, 400);
      }
      
      // Prepare the file
      const file = req.file;
      const fileName = `Flight_${flight.flightid}_${documentType}_${Date.now()}${path.extname(file.originalname)}`;
      const mimeType = getMimeType(file.originalname);
      
      // Find the appropriate subfolder
      const subfolders = await driveService.listFiles(
        workOrder.workorderfolderid_drive, 
        "mimeType = 'application/vnd.google-apps.folder'"
      );
      
      const targetSubfolder = subfolders.find(folder => folder.name.startsWith(subfolderPattern));
      
      if (!targetSubfolder) {
        throw new ApiError(`Subfolder ${subfolderPattern} not found`, 404);
      }
      
      // Upload the file to the subfolder
      const uploadedFile = await driveService.uploadFile(
        fileName,
        file.buffer,
        mimeType,
        targetSubfolder.id
      );
      
      // Update the flight with the file web view link
      const updateData = {};
      updateData[fieldToUpdate] = uploadedFile.webViewLink;
      
      await Flight.update(flightId, updateData);
      
      // Get updated flight
      const updatedFlight = await Flight.findById(flightId);
      
      res.json({
        success: true,
        message: `${documentType} flight data file uploaded successfully`,
        file: uploadedFile,
        flight: updatedFlight
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get Google Drive folder information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getDriveFolderInfo(req, res, next) {
    try {
      const { type, id } = req.params;
      
      let entity, folderId;
      
      // Get the entity and its folder ID based on type
      switch (type) {
        case 'project':
          entity = await Project.findById(id);
          if (!entity) {
            throw new ApiError('Project not found', 404);
          }
          folderId = entity.projectfolderid_drive;
          break;
        case 'workorder':
          entity = await WorkOrder.findById(id);
          if (!entity) {
            throw new ApiError('Work order not found', 404);
          }
          folderId = entity.workorderfolderid_drive;
          break;
        default:
          throw new ApiError(`Unsupported entity type: ${type}`, 400);
      }
      
      if (!folderId) {
        throw new ApiError(`${type} does not have a Google Drive folder`, 400);
      }
      
      // Get folder details from Google Drive
      const folderDetails = await driveService.getFile(folderId);
      
      // Get subfolders
      const subfolders = await driveService.listFiles(
        folderId,
        "mimeType = 'application/vnd.google-apps.folder'"
      );
      
      res.json({
        success: true,
        folder: folderDetails,
        subfolders: subfolders
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = FileStorageController;
