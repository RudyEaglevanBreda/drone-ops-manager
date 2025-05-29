/**
 * Google Drive Folder Automation Service
 * 
 * Handles automatic creation of folder structures for Projects and Work Orders
 */

const driveService = require('./driveService');
const Project = require('../../models/project.model');
const WorkOrder = require('../../models/workOrder.model');
const { ApiError } = require('../../middleware/errorHandler');

class FolderAutomationService {
  /**
   * Create Project folder structure in Google Drive
   * @param {Object} project - Project object with ID and name
   * @returns {Promise<Object>} - Created folder metadata
   */
  async createProjectFolderStructure(project) {
    try {
      // Validate input
      if (!project || !project.projectid || !project.projectname) {
        throw new ApiError('Project ID and name are required', 400);
      }

      // Create main project folder
      const folderName = `${project.projectid} - ${project.projectname}`;
      const mainFolder = await driveService.createFolder(folderName);

      // Create standard subfolders
      const subfolders = [
        '01_Contracts_Agreements',
        '02_Site_Boundary_KML',
        '03_Zone_Reference_KMLs',
        '04_Project_Wide_Deliverables',
        '05_Client_Shared'
      ];

      // Create each subfolder
      const createdSubfolders = [];
      for (const subfolder of subfolders) {
        const folder = await driveService.createFolder(subfolder, mainFolder.id);
        createdSubfolders.push(folder);
      }

      // Update the project record with folder information
      await Project.update(project.projectid, {
        projectFolderID_Drive: mainFolder.id,
        projectFolderName_Drive: folderName
      });

      return {
        mainFolder,
        subfolders: createdSubfolders
      };
    } catch (error) {
      console.error('Error creating project folder structure:', error);
      throw new ApiError(`Failed to create project folder structure: ${error.message}`, 500);
    }
  }

  /**
   * Create Work Order folder structure in Google Drive
   * @param {Object} workOrder - Work Order object
   * @param {Object} project - Project object with Google Drive folder ID
   * @returns {Promise<Object>} - Created folder metadata
   */
  async createWorkOrderFolderStructure(workOrder, project) {
    try {
      // Validate input
      if (!workOrder || !workOrder.workorderid || !workOrder.workordername) {
        throw new ApiError('Work Order ID and name are required', 400);
      }

      if (!project || !project.projectfolderid_drive) {
        throw new ApiError('Project with Google Drive folder ID is required', 400);
      }

      // Format date for folder naming
      let datePrefix = '';
      if (workOrder.scheduleddate) {
        const scheduledDate = new Date(workOrder.scheduleddate);
        datePrefix = `${scheduledDate.getFullYear()}-${String(scheduledDate.getMonth() + 1).padStart(2, '0')}-${String(scheduledDate.getDate()).padStart(2, '0')} - `;
      }

      // Create work order folder name
      const folderName = `${datePrefix}${workOrder.workordername}`;
      
      // Create work order folder in the project folder
      const workOrderFolder = await driveService.createFolder(folderName, project.projectfolderid_drive);

      // Create standard subfolders for work order
      const subfolders = [
        '01_Quote_WO',
        '02_Invoice_WO',
        '03_Operational_Flight_Plans_WO',
        '04_Raw_Flight_Data_WO',
        '05_Processed_Deliverables_WO',
        '06_WorkOrder_Reports_WO'
      ];

      // Create each subfolder
      const createdSubfolders = [];
      for (const subfolder of subfolders) {
        const folder = await driveService.createFolder(subfolder, workOrderFolder.id);
        createdSubfolders.push(folder);
      }

      // Update the work order record with folder information
      await WorkOrder.update(workOrder.workorderid, {
        workOrderFolderID_Drive: workOrderFolder.id,
        workOrderFolderName_Drive: folderName
      });

      return {
        workOrderFolder,
        subfolders: createdSubfolders
      };
    } catch (error) {
      console.error('Error creating work order folder structure:', error);
      throw new ApiError(`Failed to create work order folder structure: ${error.message}`, 500);
    }
  }

  /**
   * Get subfolder information for a project or work order
   * @param {string} folderId - Google Drive folder ID
   * @returns {Promise<Array>} - List of subfolders
   */
  async getSubfolders(folderId) {
    try {
      // List folders (filter out non-folder items)
      const folders = await driveService.listFiles(folderId, "mimeType = 'application/vnd.google-apps.folder'");
      return folders;
    } catch (error) {
      console.error('Error getting subfolders:', error);
      throw new ApiError(`Failed to get subfolders: ${error.message}`, 500);
    }
  }

  /**
   * Get specific subfolder for a project or work order by name pattern
   * @param {string} parentFolderId - Google Drive parent folder ID
   * @param {string} namePattern - Subfolder name pattern to match
   * @returns {Promise<Object>} - Subfolder metadata or null if not found
   */
  async getSubfolderByPattern(parentFolderId, namePattern) {
    try {
      const folders = await this.getSubfolders(parentFolderId);
      return folders.find(folder => folder.name.startsWith(namePattern)) || null;
    } catch (error) {
      console.error('Error getting subfolder by pattern:', error);
      throw new ApiError(`Failed to get subfolder by pattern: ${error.message}`, 500);
    }
  }

  /**
   * Upload a file to the appropriate subfolder
   * @param {string} parentFolderId - Google Drive parent folder ID (Project or Work Order)
   * @param {string} subfolderPattern - Subfolder name pattern
   * @param {string} fileName - Name of the file to upload
   * @param {Buffer|Stream} fileContent - File content
   * @param {string} mimeType - MIME type of the file
   * @returns {Promise<Object>} - Uploaded file metadata
   */
  async uploadFileToSubfolder(parentFolderId, subfolderPattern, fileName, fileContent, mimeType) {
    try {
      // Find the appropriate subfolder
      const subfolder = await this.getSubfolderByPattern(parentFolderId, subfolderPattern);
      if (!subfolder) {
        throw new ApiError(`Subfolder matching pattern '${subfolderPattern}' not found`, 404);
      }

      // Upload the file to the subfolder
      const uploadedFile = await driveService.uploadFile(fileName, fileContent, mimeType, subfolder.id);
      return uploadedFile;
    } catch (error) {
      console.error('Error uploading file to subfolder:', error);
      throw new ApiError(`Failed to upload file to subfolder: ${error.message}`, 500);
    }
  }
}

// Export a singleton instance
module.exports = new FolderAutomationService();
