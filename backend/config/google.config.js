/**
 * Google API Configuration
 * 
 * This file contains configuration settings for Google API integration.
 * In a production environment, these values should be stored as environment variables.
 */

module.exports = {
  // Google API credentials
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL || 'service-account-email@example.iam.gserviceaccount.com',
    private_key: process.env.GOOGLE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n',
    client_id: process.env.GOOGLE_CLIENT_ID || 'your-client-id.apps.googleusercontent.com'
  },
  
  // Google Drive settings
  drive: {
    // Root folder where all project folders will be created
    // Leave empty to create folders at the root of the service account's Drive
    rootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '',
    
    // Default permissions for created folders
    // Options: 'private', 'domainReadable', 'domainWritable', 'public'
    defaultFolderPermission: process.env.GOOGLE_DRIVE_DEFAULT_PERMISSION || 'private',
    
    // Domain for domain-wide permissions (if applicable)
    domain: process.env.GOOGLE_WORKSPACE_DOMAIN || 'yourdomain.com'
  },
  
  // Scopes required for Google Drive API
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file'
  ]
};
