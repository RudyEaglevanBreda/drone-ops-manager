/**
 * Work Order Lifecycle Management Utility
 * 
 * Defines the work order status workflow, transitions, requirements, and guidance
 */

// All possible work order statuses
const WORKORDER_STATUSES = {
  PLANNING: 'Planning',
  QUOTING: 'Quoting',
  QUOTE_SENT: 'Quote Sent',
  CLIENT_APPROVED: 'Client Approved',
  CLIENT_REJECTED: 'Client Rejected',
  SCHEDULED: 'Scheduled',
  FIELDWORK_IN_PROGRESS: 'Fieldwork In Progress',
  FIELDWORK_COMPLETE: 'Fieldwork Complete',
  DATA_PROCESSING: 'Data Processing',
  INTERNAL_QA_REVIEW: 'Internal QA/Review',
  READY_FOR_DELIVERY: 'Ready for Delivery',
  DATA_DELIVERED: 'Data Delivered',
  INVOICING: 'Invoicing',
  INVOICE_SENT: 'Invoice Sent',
  PAYMENT_PENDING: 'Payment Pending',
  PAID: 'Paid',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled'
};

// Define the work order lifecycle flow - which statuses can transition to which
const statusTransitions = {
  [WORKORDER_STATUSES.PLANNING]: [
    WORKORDER_STATUSES.QUOTING,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.QUOTING]: [
    WORKORDER_STATUSES.QUOTE_SENT,
    WORKORDER_STATUSES.PLANNING,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.QUOTE_SENT]: [
    WORKORDER_STATUSES.CLIENT_APPROVED,
    WORKORDER_STATUSES.CLIENT_REJECTED,
    WORKORDER_STATUSES.QUOTING,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.CLIENT_REJECTED]: [
    WORKORDER_STATUSES.QUOTING,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.CLIENT_APPROVED]: [
    WORKORDER_STATUSES.SCHEDULED,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.SCHEDULED]: [
    WORKORDER_STATUSES.FIELDWORK_IN_PROGRESS,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.FIELDWORK_IN_PROGRESS]: [
    WORKORDER_STATUSES.FIELDWORK_COMPLETE,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.FIELDWORK_COMPLETE]: [
    WORKORDER_STATUSES.DATA_PROCESSING,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.DATA_PROCESSING]: [
    WORKORDER_STATUSES.INTERNAL_QA_REVIEW,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.INTERNAL_QA_REVIEW]: [
    WORKORDER_STATUSES.READY_FOR_DELIVERY,
    WORKORDER_STATUSES.DATA_PROCESSING,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.READY_FOR_DELIVERY]: [
    WORKORDER_STATUSES.DATA_DELIVERED,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.DATA_DELIVERED]: [
    WORKORDER_STATUSES.INVOICING,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.INVOICING]: [
    WORKORDER_STATUSES.INVOICE_SENT,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.INVOICE_SENT]: [
    WORKORDER_STATUSES.PAYMENT_PENDING,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.PAYMENT_PENDING]: [
    WORKORDER_STATUSES.PAID,
    WORKORDER_STATUSES.ON_HOLD,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.PAID]: [
    WORKORDER_STATUSES.COMPLETED
  ],
  [WORKORDER_STATUSES.COMPLETED]: [
    // End state - no transitions out
  ],
  [WORKORDER_STATUSES.ON_HOLD]: [
    // Can return to various states
    WORKORDER_STATUSES.PLANNING,
    WORKORDER_STATUSES.QUOTING,
    WORKORDER_STATUSES.QUOTE_SENT,
    WORKORDER_STATUSES.CLIENT_APPROVED,
    WORKORDER_STATUSES.SCHEDULED,
    WORKORDER_STATUSES.FIELDWORK_IN_PROGRESS,
    WORKORDER_STATUSES.FIELDWORK_COMPLETE,
    WORKORDER_STATUSES.DATA_PROCESSING,
    WORKORDER_STATUSES.INTERNAL_QA_REVIEW,
    WORKORDER_STATUSES.READY_FOR_DELIVERY,
    WORKORDER_STATUSES.DATA_DELIVERED,
    WORKORDER_STATUSES.INVOICING,
    WORKORDER_STATUSES.INVOICE_SENT,
    WORKORDER_STATUSES.PAYMENT_PENDING,
    WORKORDER_STATUSES.CANCELLED
  ],
  [WORKORDER_STATUSES.CANCELLED]: [
    // End state - no transitions out
  ]
};

// Define requirements for each status transition
const transitionRequirements = {
  [`${WORKORDER_STATUSES.PLANNING}_${WORKORDER_STATUSES.QUOTING}`]: {
    requiredFields: ['servicesRequestedWO', 'operationalKML_WO_Path'],
    message: 'Services requested and operational KML file must be provided to proceed to Quoting phase.'
  },
  [`${WORKORDER_STATUSES.QUOTING}_${WORKORDER_STATUSES.QUOTE_SENT}`]: {
    requiredFields: ['quoteAmountWO', 'quotePDF_Path_WO'],
    message: 'Quote amount and quote PDF document must be provided to proceed to Quote Sent phase.'
  },
  [`${WORKORDER_STATUSES.QUOTE_SENT}_${WORKORDER_STATUSES.CLIENT_APPROVED}`]: {
    requiredFields: [],
    message: ''
  },
  [`${WORKORDER_STATUSES.CLIENT_APPROVED}_${WORKORDER_STATUSES.SCHEDULED}`]: {
    requiredFields: ['scheduledDate'],
    message: 'Scheduled date must be provided to proceed to Scheduled phase.'
  },
  [`${WORKORDER_STATUSES.DATA_DELIVERED}_${WORKORDER_STATUSES.INVOICING}`]: {
    requiredFields: [],
    message: ''
  },
  [`${WORKORDER_STATUSES.INVOICING}_${WORKORDER_STATUSES.INVOICE_SENT}`]: {
    requiredFields: ['invoiceAmountWO', 'invoicePDF_Path_WO'],
    message: 'Invoice amount and invoice PDF document must be provided to proceed to Invoice Sent phase.'
  }
  // Other transitions don't have specific field requirements
};

// Define guidance text for each status
const statusGuidance = {
  [WORKORDER_STATUSES.PLANNING]: 'Define the scope of work, including services needed and operational area. Outline specific requirements for the drone operation.',
  [WORKORDER_STATUSES.QUOTING]: 'Calculate costs based on services requested, flight time, equipment, and personnel. Prepare a quote document to send to the client.',
  [WORKORDER_STATUSES.QUOTE_SENT]: 'Quote has been sent to the client. Follow up as needed and update status when client responds.',
  [WORKORDER_STATUSES.CLIENT_REJECTED]: 'Client has rejected the quote. Consider revising and resubmitting or cancelling the work order.',
  [WORKORDER_STATUSES.CLIENT_APPROVED]: 'Client has approved the quote. Proceed with scheduling the fieldwork.',
  [WORKORDER_STATUSES.SCHEDULED]: 'Work order is scheduled. Prepare equipment, personnel, and confirm weather conditions for the planned date.',
  [WORKORDER_STATUSES.FIELDWORK_IN_PROGRESS]: 'Drone operations are currently in progress. Monitor progress and address any issues that arise.',
  [WORKORDER_STATUSES.FIELDWORK_COMPLETE]: 'Fieldwork has been completed. Organize raw data and prepare for processing.',
  [WORKORDER_STATUSES.DATA_PROCESSING]: 'Raw data is being processed. Generate deliverables according to client requirements.',
  [WORKORDER_STATUSES.INTERNAL_QA_REVIEW]: 'Reviewing processed data for quality assurance. Ensure all deliverables meet quality standards.',
  [WORKORDER_STATUSES.READY_FOR_DELIVERY]: 'Data is ready for delivery to client. Prepare delivery package and documentation.',
  [WORKORDER_STATUSES.DATA_DELIVERED]: 'Deliverables have been provided to the client. Prepare for invoicing.',
  [WORKORDER_STATUSES.INVOICING]: 'Generate an invoice for completed work. Include all relevant details and payment terms.',
  [WORKORDER_STATUSES.INVOICE_SENT]: 'Invoice has been sent to client. Monitor for payment.',
  [WORKORDER_STATUSES.PAYMENT_PENDING]: 'Payment is pending. Follow up with client if payment is delayed.',
  [WORKORDER_STATUSES.PAID]: 'Payment has been received. Finalize work order documentation.',
  [WORKORDER_STATUSES.COMPLETED]: 'Work order is complete. No further action required.',
  [WORKORDER_STATUSES.ON_HOLD]: 'Work order is temporarily on hold. Document the reason and expected resumption date.',
  [WORKORDER_STATUSES.CANCELLED]: 'Work order has been cancelled. Document the reason for cancellation.'
};

// Define external tools for certain statuses
const externalTools = {
  [WORKORDER_STATUSES.QUOTING]: [
    {
      name: 'QuickBooks',
      description: 'Create quote in QuickBooks',
      url: 'https://quickbooks.intuit.com'
    }
  ],
  [WORKORDER_STATUSES.INVOICING]: [
    {
      name: 'QuickBooks',
      description: 'Create invoice in QuickBooks',
      url: 'https://quickbooks.intuit.com'
    }
  ]
};

// Export the constants and utility functions
module.exports = {
  WORKORDER_STATUSES,
  
  /**
   * Get available next statuses for the current status
   * @param {string} currentStatus - Current work order status
   * @returns {Array} - Available next statuses
   */
  getAvailableNextStatuses(currentStatus) {
    return statusTransitions[currentStatus] || [];
  },
  
  /**
   * Check if a status transition is valid
   * @param {string} currentStatus - Current work order status
   * @param {string} nextStatus - Target status to transition to
   * @returns {boolean} - Whether the transition is valid
   */
  isValidTransition(currentStatus, nextStatus) {
    const availableStatuses = statusTransitions[currentStatus] || [];
    return availableStatuses.includes(nextStatus);
  },
  
  /**
   * Get requirements for a status transition
   * @param {string} currentStatus - Current work order status
   * @param {string} nextStatus - Target status to transition to
   * @returns {Object} - Requirements for the transition
   */
  getTransitionRequirements(currentStatus, nextStatus) {
    const key = `${currentStatus}_${nextStatus}`;
    return transitionRequirements[key] || { requiredFields: [], message: '' };
  },
  
  /**
   * Check if a work order meets the requirements for a status transition
   * @param {Object} workOrder - Work order data
   * @param {string} nextStatus - Target status to transition to
   * @returns {Object} - { valid: boolean, message: string }
   */
  validateTransition(workOrder, nextStatus) {
    const currentStatus = workOrder.workorderstatus;
    
    // Check if the transition is valid
    if (!this.isValidTransition(currentStatus, nextStatus)) {
      return { 
        valid: false, 
        message: `Cannot transition from '${currentStatus}' to '${nextStatus}'` 
      };
    }
    
    // Get requirements for the transition
    const requirements = this.getTransitionRequirements(currentStatus, nextStatus);
    
    // Check if all required fields are present and non-empty
    for (const field of requirements.requiredFields) {
      // Convert camelCase to snake_case for database fields if needed
      const value = workOrder[field.toLowerCase()];
      if (!value || (typeof value === 'string' && value.trim() === '') || 
          (Array.isArray(value) && value.length === 0)) {
        return { 
          valid: false, 
          message: requirements.message || `Field '${field}' is required for this transition` 
        };
      }
    }
    
    return { valid: true, message: '' };
  },
  
  /**
   * Get guidance text for a specific status
   * @param {string} status - Work order status
   * @returns {string} - Guidance text
   */
  getStatusGuidance(status) {
    return statusGuidance[status] || 'No guidance available for this status.';
  },
  
  /**
   * Get external tools for a specific status
   * @param {string} status - Work order status
   * @returns {Array} - External tools
   */
  getExternalTools(status) {
    return externalTools[status] || [];
  },
  
  /**
   * Get all statuses
   * @returns {Object} - All work order statuses
   */
  getAllStatuses() {
    return WORKORDER_STATUSES;
  }
};
