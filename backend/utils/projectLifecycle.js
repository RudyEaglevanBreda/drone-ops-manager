/**
 * Project Lifecycle Management Utility
 * 
 * Defines the project status workflow, transitions, requirements, and guidance
 */

// All possible project statuses
const PROJECT_STATUSES = {
  PLANNING: 'Planning',
  DISCOVERY: 'Discovery/Meeting',
  PROPOSAL_DRAFTING: 'Proposal/Contract Drafting',
  PROPOSAL_SENT: 'Proposal/Contract Sent',
  CLIENT_AGREEMENT_PENDING: 'Client Agreement Pending',
  PROJECT_APPROVED: 'Project Approved',
  ACTIVE: 'Active - Ongoing',
  PROJECT_REVIEW: 'Project Review',
  ARCHIVING: 'Archiving',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  LOST: 'Lost',
  CANCELLED: 'Cancelled'
};

// Define the project lifecycle flow - which statuses can transition to which
const statusTransitions = {
  [PROJECT_STATUSES.PLANNING]: [
    PROJECT_STATUSES.DISCOVERY,
    PROJECT_STATUSES.CANCELLED,
    PROJECT_STATUSES.ON_HOLD,
    PROJECT_STATUSES.LOST
  ],
  [PROJECT_STATUSES.DISCOVERY]: [
    PROJECT_STATUSES.PROPOSAL_DRAFTING,
    PROJECT_STATUSES.PLANNING,
    PROJECT_STATUSES.CANCELLED,
    PROJECT_STATUSES.ON_HOLD,
    PROJECT_STATUSES.LOST
  ],
  [PROJECT_STATUSES.PROPOSAL_DRAFTING]: [
    PROJECT_STATUSES.PROPOSAL_SENT,
    PROJECT_STATUSES.DISCOVERY,
    PROJECT_STATUSES.CANCELLED,
    PROJECT_STATUSES.ON_HOLD,
    PROJECT_STATUSES.LOST
  ],
  [PROJECT_STATUSES.PROPOSAL_SENT]: [
    PROJECT_STATUSES.CLIENT_AGREEMENT_PENDING,
    PROJECT_STATUSES.PROPOSAL_DRAFTING,
    PROJECT_STATUSES.CANCELLED,
    PROJECT_STATUSES.ON_HOLD,
    PROJECT_STATUSES.LOST
  ],
  [PROJECT_STATUSES.CLIENT_AGREEMENT_PENDING]: [
    PROJECT_STATUSES.PROJECT_APPROVED,
    PROJECT_STATUSES.PROPOSAL_DRAFTING,
    PROJECT_STATUSES.CANCELLED,
    PROJECT_STATUSES.ON_HOLD,
    PROJECT_STATUSES.LOST
  ],
  [PROJECT_STATUSES.PROJECT_APPROVED]: [
    PROJECT_STATUSES.ACTIVE,
    PROJECT_STATUSES.CANCELLED,
    PROJECT_STATUSES.ON_HOLD
  ],
  [PROJECT_STATUSES.ACTIVE]: [
    PROJECT_STATUSES.PROJECT_REVIEW,
    PROJECT_STATUSES.CANCELLED,
    PROJECT_STATUSES.ON_HOLD
  ],
  [PROJECT_STATUSES.PROJECT_REVIEW]: [
    PROJECT_STATUSES.ARCHIVING,
    PROJECT_STATUSES.ACTIVE,
    PROJECT_STATUSES.CANCELLED,
    PROJECT_STATUSES.ON_HOLD
  ],
  [PROJECT_STATUSES.ARCHIVING]: [
    PROJECT_STATUSES.COMPLETED,
    PROJECT_STATUSES.PROJECT_REVIEW,
    PROJECT_STATUSES.CANCELLED
  ],
  [PROJECT_STATUSES.COMPLETED]: [
    PROJECT_STATUSES.ARCHIVING
  ],
  [PROJECT_STATUSES.ON_HOLD]: [
    // Can return to the previous status or be cancelled/lost
    PROJECT_STATUSES.PLANNING,
    PROJECT_STATUSES.DISCOVERY,
    PROJECT_STATUSES.PROPOSAL_DRAFTING,
    PROJECT_STATUSES.PROPOSAL_SENT,
    PROJECT_STATUSES.CLIENT_AGREEMENT_PENDING,
    PROJECT_STATUSES.PROJECT_APPROVED,
    PROJECT_STATUSES.ACTIVE,
    PROJECT_STATUSES.PROJECT_REVIEW,
    PROJECT_STATUSES.CANCELLED,
    PROJECT_STATUSES.LOST
  ],
  [PROJECT_STATUSES.LOST]: [
    // Cannot transition out of LOST state
  ],
  [PROJECT_STATUSES.CANCELLED]: [
    // Cannot transition out of CANCELLED state
  ]
};

// Define requirements for each status transition
const transitionRequirements = {
  [`${PROJECT_STATUSES.PLANNING}_${PROJECT_STATUSES.DISCOVERY}`]: {
    requiredFields: ['projectName', 'clientName'],
    message: 'Project and client names are required to proceed to Discovery/Meeting phase.'
  },
  [`${PROJECT_STATUSES.DISCOVERY}_${PROJECT_STATUSES.PROPOSAL_DRAFTING}`]: {
    requiredFields: ['meetingNotes'],
    message: 'Meeting notes are required to proceed to Proposal/Contract Drafting phase.'
  },
  [`${PROJECT_STATUSES.PROPOSAL_DRAFTING}_${PROJECT_STATUSES.PROPOSAL_SENT}`]: {
    requiredFields: ['contractDocumentPDF_Path'],
    message: 'Contract document must be uploaded to proceed to Proposal/Contract Sent phase.'
  },
  [`${PROJECT_STATUSES.PROPOSAL_SENT}_${PROJECT_STATUSES.CLIENT_AGREEMENT_PENDING}`]: {
    requiredFields: [],
    message: ''
  },
  [`${PROJECT_STATUSES.CLIENT_AGREEMENT_PENDING}_${PROJECT_STATUSES.PROJECT_APPROVED}`]: {
    requiredFields: [],
    message: ''
  },
  [`${PROJECT_STATUSES.PROJECT_APPROVED}_${PROJECT_STATUSES.ACTIVE}`]: {
    requiredFields: ['projectBoundaryKML_Path'],
    message: 'Project boundary KML file must be uploaded to proceed to Active phase.'
  },
  [`${PROJECT_STATUSES.ACTIVE}_${PROJECT_STATUSES.PROJECT_REVIEW}`]: {
    // Custom validation function could be added here to check if all work orders are completed
    requiredFields: [],
    message: ''
  },
  [`${PROJECT_STATUSES.PROJECT_REVIEW}_${PROJECT_STATUSES.ARCHIVING}`]: {
    requiredFields: [],
    message: ''
  },
  [`${PROJECT_STATUSES.ARCHIVING}_${PROJECT_STATUSES.COMPLETED}`]: {
    requiredFields: [],
    message: ''
  }
};

// Define guidance text for each status
const statusGuidance = {
  [PROJECT_STATUSES.PLANNING]: 'Initial project planning stage. Define project scope, objectives, and target client. Once details are finalized, move to Discovery/Meeting phase.',
  [PROJECT_STATUSES.DISCOVERY]: 'Schedule and conduct initial client meetings. Document requirements, expectations, and any special considerations. Complete meeting notes before progressing.',
  [PROJECT_STATUSES.PROPOSAL_DRAFTING]: 'Draft a detailed proposal and contract for the client. Include scope, timeline, deliverables, and pricing. Upload the final contract before proceeding.',
  [PROJECT_STATUSES.PROPOSAL_SENT]: 'Contract has been sent to the client. Follow up as needed and update status when client responds.',
  [PROJECT_STATUSES.CLIENT_AGREEMENT_PENDING]: 'Client is reviewing the proposal. Stay in contact and address any questions or concerns.',
  [PROJECT_STATUSES.PROJECT_APPROVED]: 'Client has approved the project. Prepare for execution by uploading the project boundary file.',
  [PROJECT_STATUSES.ACTIVE]: 'Project is in active execution. Create work orders, assign resources, and track progress.',
  [PROJECT_STATUSES.PROJECT_REVIEW]: 'All work orders are complete. Review deliverables, gather feedback, and prepare final documentation.',
  [PROJECT_STATUSES.ARCHIVING]: 'Organize and archive all project materials. Ensure all client deliverables have been provided.',
  [PROJECT_STATUSES.COMPLETED]: 'Project is successfully completed and closed. No further actions required.',
  [PROJECT_STATUSES.ON_HOLD]: 'Project temporarily paused. Document the reason and expected resumption date.',
  [PROJECT_STATUSES.LOST]: 'Client has decided not to proceed. Document reasons if known for future reference.',
  [PROJECT_STATUSES.CANCELLED]: 'Project cancelled. Document reasons and lessons learned.'
};

// Export the constants and utility functions
module.exports = {
  PROJECT_STATUSES,
  
  /**
   * Get available next statuses for the current status
   * @param {string} currentStatus - Current project status
   * @returns {Array} - Available next statuses
   */
  getAvailableNextStatuses(currentStatus) {
    return statusTransitions[currentStatus] || [];
  },
  
  /**
   * Check if a status transition is valid
   * @param {string} currentStatus - Current project status
   * @param {string} nextStatus - Target status to transition to
   * @returns {boolean} - Whether the transition is valid
   */
  isValidTransition(currentStatus, nextStatus) {
    const availableStatuses = statusTransitions[currentStatus] || [];
    return availableStatuses.includes(nextStatus);
  },
  
  /**
   * Get requirements for a status transition
   * @param {string} currentStatus - Current project status
   * @param {string} nextStatus - Target status to transition to
   * @returns {Object} - Requirements for the transition
   */
  getTransitionRequirements(currentStatus, nextStatus) {
    const key = `${currentStatus}_${nextStatus}`;
    return transitionRequirements[key] || { requiredFields: [], message: '' };
  },
  
  /**
   * Check if a project meets the requirements for a status transition
   * @param {Object} project - Project data
   * @param {string} nextStatus - Target status to transition to
   * @returns {Object} - { valid: boolean, message: string }
   */
  validateTransition(project, nextStatus) {
    const currentStatus = project.projectstatus;
    
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
      const value = project[field.toLowerCase()];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
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
   * @param {string} status - Project status
   * @returns {string} - Guidance text
   */
  getStatusGuidance(status) {
    return statusGuidance[status] || 'No guidance available for this status.';
  },
  
  /**
   * Get all statuses
   * @returns {Object} - All project statuses
   */
  getAllStatuses() {
    return PROJECT_STATUSES;
  }
};
