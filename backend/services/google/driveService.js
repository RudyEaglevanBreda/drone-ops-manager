/**
 * Google Drive Service
 * 
 * Handles authentication and interactions with Google Drive API
 */

const { google } = require('googleapis');
const googleConfig = require('../../config/google.config');
const { ApiError } = require('../../middleware/errorHandler');

class GoogleDriveService {
  constructor() {
    this.driveClient = null;
    this.initialized = false;
    this.initializeClient();
  }

  /**
   * Initialize Google Drive API client
   */
  async initializeClient() {
    try {
      // Create JWT client using service account credentials
      const auth = new google.auth.JWT(
        googleConfig.credentials.client_email,
        null,
        googleConfig.credentials.private_key.replace(/\\n/g, '\n'),
        googleConfig.scopes
      );

      // Create Drive API client
      this.driveClient = google.drive({ version: 'v3', auth });
      this.initialized = true;
      console.log('Google Drive API client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Drive API client:', error);
      // Don't throw an error here, let the service handle errors when methods are called
    }
  }

  /**
   * Ensure the Drive client is initialized
   * @private
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new ApiError('Google Drive service is not initialized', 500);
    }
  }

  /**
   * Create a folder in Google Drive
   * @param {string} folderName - Name of the folder to create
   * @param {string} parentFolderId - ID of the parent folder (optional)
   * @returns {Promise<Object>} - Created folder metadata
   */
  async createFolder(folderName, parentFolderId = null) {
    this._ensureInitialized();

    try {
      // Prepare folder metadata
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };

      // If parent folder ID is provided, set it as the parent
      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      } else if (googleConfig.drive.rootFolderId) {
        // Otherwise, use the configured root folder if specified
        fileMetadata.parents = [googleConfig.drive.rootFolderId];
      }

      // Create the folder
      const response = await this.driveClient.files.create({
        resource: fileMetadata,
        fields: 'id, name, webViewLink'
      });

      console.log(`Folder created: ${folderName}, ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error(`Error creating folder ${folderName}:`, error);
      throw new ApiError(`Failed to create folder in Google Drive: ${error.message}`, 500);
    }
  }

  /**
   * Set permissions on a folder
   * @param {string} fileId - ID of the file or folder
   * @param {string} permissionType - Type of permission ('user', 'domain', 'anyone')
   * @param {string} role - Role ('reader', 'writer', 'commenter', 'owner')
   * @param {string} emailAddress - Email address for user permission (optional)
   * @param {string} domain - Domain for domain permission (optional)
   * @returns {Promise<Object>} - Permission metadata
   */
  async setPermission(fileId, permissionType, role, emailAddress = null, domain = null) {
    this._ensureInitialized();

    try {
      const permissionResource = {
        type: permissionType,
        role: role
      };

      // Add email or domain if provided
      if (emailAddress && permissionType === 'user') {
        permissionResource.emailAddress = emailAddress;
      }

      if (domain && permissionType === 'domain') {
        permissionResource.domain = domain;
      }

      const response = await this.driveClient.permissions.create({
        fileId: fileId,
        resource: permissionResource,
        fields: 'id'
      });

      console.log(`Permission set on file/folder ${fileId}`);
      return response.data;
    } catch (error) {
      console.error(`Error setting permission on ${fileId}:`, error);
      throw new ApiError(`Failed to set permissions in Google Drive: ${error.message}`, 500);
    }
  }

  /**
   * Upload a file to Google Drive
   * @param {string} fileName - Name of the file
   * @param {Buffer|Stream} fileContent - File content
   * @param {string} mimeType - MIME type of the file
   * @param {string} parentFolderId - ID of the parent folder
   * @returns {Promise<Object>} - Uploaded file metadata
   */
  async uploadFile(fileName, fileContent, mimeType, parentFolderId) {
    this._ensureInitialized();

    try {
      const fileMetadata = {
        name: fileName,
        parents: [parentFolderId]
      };

      const media = {
        mimeType: mimeType,
        body: fileContent
      };

      const response = await this.driveClient.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
      });

      console.log(`File uploaded: ${fileName}, ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error(`Error uploading file ${fileName}:`, error);
      throw new ApiError(`Failed to upload file to Google Drive: ${error.message}`, 500);
    }
  }

  /**
   * Get a file or folder by ID
   * @param {string} fileId - ID of the file or folder
   * @returns {Promise<Object>} - File metadata
   */
  async getFile(fileId) {
    this._ensureInitialized();

    try {
      const response = await this.driveClient.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, webViewLink, parents'
      });

      return response.data;
    } catch (error) {
      console.error(`Error getting file ${fileId}:`, error);
      throw new ApiError(`Failed to get file from Google Drive: ${error.message}`, 500);
    }
  }

  /**
   * List files in a folder
   * @param {string} folderId - ID of the folder
   * @param {string} query - Search query (optional)
   * @returns {Promise<Array>} - List of files
   */
  async listFiles(folderId, query = null) {
    this._ensureInitialized();

    try {
      let q = `'${folderId}' in parents and trashed = false`;
      if (query) {
        q += ` and ${query}`;
      }

      const response = await this.driveClient.files.list({
        q: q,
        fields: 'files(id, name, mimeType, webViewLink)'
      });

      return response.data.files;
    } catch (error) {
      console.error(`Error listing files in folder ${folderId}:`, error);
      throw new ApiError(`Failed to list files in Google Drive: ${error.message}`, 500);
    }
  }
}

// Export a singleton instance
module.exports = new GoogleDriveService();
