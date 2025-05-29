/**
 * Google Drive Event Handlers
 * 
 * Connects database events with Google Drive folder automation
 */

const folderAutomationService = require('./folderAutomationService');
const Project = require('../../models/project.model');
const { ApiError } = require('../../middleware/errorHandler');

const DriveEventHandlers = {
  /**
   * Handle project creation event
   * @param {Object} project - Newly created project
   * @returns {Promise<void>}
   */
  async handleProjectCreated(project) {
    try {
      console.log(`Project created event for ${project.projectid}. Creating Google Drive folders...`);
      await folderAutomationService.createProjectFolderStructure(project);
      console.log(`Google Drive folders created successfully for project ${project.projectid}`);
    } catch (error) {
      console.error(`Error creating Google Drive folders for project ${project.projectid}:`, error);
      // Note: We're not throwing here to prevent the failure from affecting the main application flow
      // Instead, we log the error and might want to implement a retry mechanism or queue
    }
  },

  /**
   * Handle work order creation event
   * @param {Object} workOrder - Newly created work order
   * @returns {Promise<void>}
   */
  async handleWorkOrderCreated(workOrder) {
    try {
      // Get the parent project to access its Google Drive folder ID
      const project = await Project.findById(workOrder.projectid);
      if (!project) {
        throw new Error(`Parent project ${workOrder.projectid} not found`);
      }

      console.log(`Work Order created event for ${workOrder.workorderid}. Creating Google Drive folders...`);
      await folderAutomationService.createWorkOrderFolderStructure(workOrder, project);
      console.log(`Google Drive folders created successfully for work order ${workOrder.workorderid}`);
    } catch (error) {
      console.error(`Error creating Google Drive folders for work order ${workOrder.workorderid}:`, error);
      // Note: We're not throwing here to prevent the failure from affecting the main application flow
    }
  },

  /**
   * Handle document upload for a project
   * @param {Object} project - Project object
   * @param {string} documentType - Type of document ('contract' or 'boundary')
   * @param {Object} fileData - File data object with buffer and metadata
   * @returns {Promise<Object>} - Uploaded file metadata
   */
  async handleProjectDocumentUpload(project, documentType, fileData) {
    try {
      if (!project.projectfolderid_drive) {
        throw new ApiError('Project does not have a Google Drive folder', 400);
      }

      let subfolderPattern, fileName, mimeType;

      // Determine the appropriate subfolder and file details based on document type
      switch (documentType) {
        case 'contract':
          subfolderPattern = '01_Contracts_Agreements';
          fileName = `${project.projectid}_Contract_${new Date().toISOString().split('T')[0]}.pdf`;
          mimeType = 'application/pdf';
          break;
        case 'boundary':
          subfolderPattern = '02_Site_Boundary_KML';
          fileName = `${project.projectid}_Boundary_${new Date().toISOString().split('T')[0]}.kml`;
          mimeType = 'application/vnd.google-earth.kml+xml';
          break;
        default:
          throw new ApiError(`Unsupported document type: ${documentType}`, 400);
      }

      console.log(`Uploading ${documentType} document for project ${project.projectid}...`);
      const uploadedFile = await folderAutomationService.uploadFileToSubfolder(
        project.projectfolderid_drive,
        subfolderPattern,
        fileName,
        fileData.buffer,
        mimeType
      );

      console.log(`Document uploaded successfully to Google Drive: ${uploadedFile.name}`);
      return uploadedFile;
    } catch (error) {
      console.error(`Error uploading ${documentType} document for project ${project.projectid}:`, error);
      throw new ApiError(`Failed to upload document to Google Drive: ${error.message}`, 500);
    }
  },

  /**
   * Handle document upload for a work order
   * @param {Object} workOrder - Work Order object
   * @param {string} documentType - Type of document ('quote', 'invoice', or 'operational')
   * @param {Object} fileData - File data object with buffer and metadata
   * @returns {Promise<Object>} - Uploaded file metadata
   */
  async handleWorkOrderDocumentUpload(workOrder, documentType, fileData) {
    try {
      if (!workOrder.workorderfolderid_drive) {
        throw new ApiError('Work Order does not have a Google Drive folder', 400);
      }

      let subfolderPattern, fileName, mimeType;

      // Determine the appropriate subfolder and file details based on document type
      switch (documentType) {
        case 'quote':
          subfolderPattern = '01_Quote_WO';
          fileName = `${workOrder.workorderid}_Quote_${new Date().toISOString().split('T')[0]}.pdf`;
          mimeType = 'application/pdf';
          break;
        case 'invoice':
          subfolderPattern = '02_Invoice_WO';
          fileName = `${workOrder.workorderid}_Invoice_${new Date().toISOString().split('T')[0]}.pdf`;
          mimeType = 'application/pdf';
          break;
        case 'operational':
          subfolderPattern = '03_Operational_Flight_Plans_WO';
          fileName = `${workOrder.workorderid}_FlightPlan_${new Date().toISOString().split('T')[0]}.kml`;
          mimeType = 'application/vnd.google-earth.kml+xml';
          break;
        case 'rawData':
          subfolderPattern = '04_Raw_Flight_Data_WO';
          fileName = fileData.originalname || `${workOrder.workorderid}_RawData_${new Date().toISOString().split('T')[0]}.zip`;
          mimeType = fileData.mimetype || 'application/zip';
          break;
        case 'deliverable':
          subfolderPattern = '05_Processed_Deliverables_WO';
          fileName = fileData.originalname || `${workOrder.workorderid}_Deliverable_${new Date().toISOString().split('T')[0]}.zip`;
          mimeType = fileData.mimetype || 'application/zip';
          break;
        default:
          throw new ApiError(`Unsupported document type: ${documentType}`, 400);
      }

      console.log(`Uploading ${documentType} document for work order ${workOrder.workorderid}...`);
      const uploadedFile = await folderAutomationService.uploadFileToSubfolder(
        workOrder.workorderfolderid_drive,
        subfolderPattern,
        fileName,
        fileData.buffer,
        mimeType
      );

      console.log(`Document uploaded successfully to Google Drive: ${uploadedFile.name}`);
      return uploadedFile;
    } catch (error) {
      console.error(`Error uploading ${documentType} document for work order ${workOrder.workorderid}:`, error);
      throw new ApiError(`Failed to upload document to Google Drive: ${error.message}`, 500);
    }
  }
};

module.exports = DriveEventHandlers;
