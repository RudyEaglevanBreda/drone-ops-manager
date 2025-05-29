/**
 * Work Order Lifecycle Service
 * 
 * Provides functions for interacting with the work order lifecycle API endpoints
 */

const BASE_URL = '/api/wo-lifecycle';

const WorkOrderLifecycleService = {
  /**
   * Get available status transitions for a work order
   * @param {string} workOrderId - Work order ID
   * @returns {Promise} - Available transitions
   */
  async getAvailableTransitions(workOrderId) {
    try {
      const response = await fetch(`${BASE_URL}/workorder/${workOrderId}/transitions`, {
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
   * Update work order status
   * @param {string} workOrderId - Work order ID
   * @param {string} nextStatus - Next status
   * @returns {Promise} - Updated work order
   */
  async updateWorkOrderStatus(workOrderId, nextStatus) {
    try {
      const response = await fetch(`${BASE_URL}/workorder/${workOrderId}/status`, {
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
      console.error('Error updating work order status:', error);
      throw error;
    }
  },

  /**
   * Update field required for status transition
   * @param {string} workOrderId - Work order ID
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {Promise} - Updated work order
   */
  async updateTransitionField(workOrderId, field, value) {
    try {
      const response = await fetch(`${BASE_URL}/workorder/${workOrderId}/field`, {
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
   * @param {string} workOrderId - Work order ID
   * @param {string} documentType - Document type ('quote', 'operational', or 'invoice')
   * @param {File} file - File to upload
   * @returns {Promise} - Updated work order
   */
  async uploadTransitionDocument(workOrderId, documentType, file) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch(`${BASE_URL}/workorder/${workOrderId}/document/${documentType}`, {
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
   * Update quote information
   * @param {string} workOrderId - Work order ID
   * @param {Object} quoteData - Quote data
   * @returns {Promise} - Updated work order
   */
  async updateQuoteInfo(workOrderId, quoteData) {
    try {
      const response = await fetch(`${BASE_URL}/workorder/${workOrderId}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(quoteData)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating quote information:', error);
      throw error;
    }
  },

  /**
   * Update invoice information
   * @param {string} workOrderId - Work order ID
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise} - Updated work order
   */
  async updateInvoiceInfo(workOrderId, invoiceData) {
    try {
      const response = await fetch(`${BASE_URL}/workorder/${workOrderId}/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(invoiceData)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating invoice information:', error);
      throw error;
    }
  },

  /**
   * Get all possible work order statuses
   * @returns {Promise} - All work order statuses
   */
  async getAllWorkOrderStatuses() {
    try {
      const response = await fetch(`${BASE_URL}/statuses`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching work order statuses:', error);
      throw error;
    }
  }
};

export default WorkOrderLifecycleService;
