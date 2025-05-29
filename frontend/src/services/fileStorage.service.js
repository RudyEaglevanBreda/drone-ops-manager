/**
 * File Storage Service
 * 
 * Handles file uploads and Google Drive integrations on the frontend
 */

const BASE_URL = '/api/files';

const FileStorageService = {
  /**
   * Upload a file for a project
   * @param {string} projectId - Project ID
   * @param {string} documentType - Document type ('contract' or 'boundary')
   * @param {File} file - File object to upload
   * @returns {Promise<Object>} - Upload result
   */
  async uploadProjectFile(projectId, documentType, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${BASE_URL}/project/${projectId}/upload/${documentType}`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading project file:', error);
      throw error;
    }
  },
  
  /**
   * Upload a file for a work order
   * @param {string} workOrderId - Work Order ID
   * @param {string} documentType - Document type ('quote', 'invoice', 'operational', 'raw', or 'processed')
   * @param {File} file - File object to upload
   * @returns {Promise<Object>} - Upload result
   */
  async uploadWorkOrderFile(workOrderId, documentType, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${BASE_URL}/workorder/${workOrderId}/upload/${documentType}`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading work order file:', error);
      throw error;
    }
  },
  
  /**
   * Upload a zone reference KML file
   * @param {string} zoneId - Zone ID
   * @param {File} file - File object to upload
   * @returns {Promise<Object>} - Upload result
   */
  async uploadZoneFile(zoneId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${BASE_URL}/zone/${zoneId}/upload`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading zone file:', error);
      throw error;
    }
  },
  
  /**
   * Upload a flight data file
   * @param {string} flightId - Flight ID
   * @param {string} documentType - Document type ('raw' or 'processed')
   * @param {File} file - File object to upload
   * @returns {Promise<Object>} - Upload result
   */
  async uploadFlightFile(flightId, documentType, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${BASE_URL}/flight/${flightId}/upload/${documentType}`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading flight file:', error);
      throw error;
    }
  },
  
  /**
   * Get Google Drive folder information
   * @param {string} entityType - Entity type ('project' or 'workorder')
   * @param {string} entityId - Entity ID
   * @returns {Promise<Object>} - Folder information
   */
  async getDriveFolderInfo(entityType, entityId) {
    try {
      const response = await fetch(`${BASE_URL}/folder/${entityType}/${entityId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting Drive folder info:', error);
      throw error;
    }
  },
  
  /**
   * Generate a direct Drive URL from a webViewLink or ID
   * @param {string} linkOrId - Google Drive link or ID
   * @returns {string} - Direct Drive URL
   */
  generateDriveUrl(linkOrId) {
    // Check if it's already a URL
    if (linkOrId && linkOrId.startsWith('http')) {
      return linkOrId;
    }
    
    // If it's just an ID, construct a Drive URL
    if (linkOrId) {
      return `https://drive.google.com/file/d/${linkOrId}/view`;
    }
    
    return null;
  },
  
  /**
   * Generate a Drive folder URL
   * @param {string} folderId - Google Drive folder ID
   * @returns {string} - Drive folder URL
   */
  generateDriveFolderUrl(folderId) {
    if (!folderId) return null;
    
    return `https://drive.google.com/drive/folders/${folderId}`;
  }
};

export default FileStorageService;
