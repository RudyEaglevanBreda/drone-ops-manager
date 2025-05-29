/**
 * Project Lifecycle Service
 * 
 * Provides functions for interacting with the project lifecycle API endpoints
 */

const BASE_URL = '/api/lifecycle';

const ProjectLifecycleService = {
  /**
   * Get available status transitions for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} - Available transitions
   */
  async getAvailableTransitions(projectId) {
    try {
      const response = await fetch(`${BASE_URL}/project/${projectId}/transitions`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching available transitions:', error);
      throw error;
    }
  },

  /**
   * Update project status
   * @param {string} projectId - Project ID
   * @param {string} nextStatus - Next status
   * @returns {Promise} - Updated project
   */
  async updateProjectStatus(projectId, nextStatus) {
    try {
      const response = await fetch(`${BASE_URL}/project/${projectId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ nextStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  },

  /**
   * Update field required for status transition
   * @param {string} projectId - Project ID
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {Promise} - Updated project
   */
  async updateTransitionField(projectId, field, value) {
    try {
      const response = await fetch(`${BASE_URL}/project/${projectId}/field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ field, value })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating transition field:', error);
      throw error;
    }
  },

  /**
   * Upload document required for status transition
   * @param {string} projectId - Project ID
   * @param {string} documentType - Document type ('contract' or 'boundary')
   * @param {File} file - File to upload
   * @returns {Promise} - Updated project
   */
  async uploadTransitionDocument(projectId, documentType, file) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch(`${BASE_URL}/project/${projectId}/document/${documentType}`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  /**
   * Get all possible project statuses
   * @returns {Promise} - All project statuses
   */
  async getAllProjectStatuses() {
    try {
      const response = await fetch(`${BASE_URL}/statuses`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching project statuses:', error);
      throw error;
    }
  }
};

export default ProjectLifecycleService;
