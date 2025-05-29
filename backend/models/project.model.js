const db = require('../config/db-selector');
const { v4: uuidv4 } = require('uuid');

const Project = {
  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {number} userId - ID of user creating the project
   * @returns {Promise} - Created project object
   */
  async create(projectData, userId) {
    const {
      projectName,
      clientName,
      projectDescription,
      projectStatus,
      contractDocumentPDF_Path,
      projectBoundaryKML_Path,
      projectFolderID_Drive,
      projectFolderName_Drive
    } = projectData;
    
    // Generate unique project ID (prefix + UUID)
    const projectId = `PRJ-${uuidv4().substring(0, 8)}`;
    
    const query = `
      INSERT INTO Projects (
        ProjectID, ProjectName, ClientName, ProjectDescription, ProjectStatus,
        ContractDocumentPDF_Path, ProjectBoundaryKML_Path, ProjectFolderID_Drive,
        ProjectFolderName_Drive, CreatedBy
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      projectId,
      projectName,
      clientName,
      projectDescription,
      projectStatus || 'Planning',
      contractDocumentPDF_Path,
      projectBoundaryKML_Path,
      projectFolderID_Drive,
      projectFolderName_Drive,
      userId
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Get all projects with optional filtering
   * @param {Object} filters - Optional filter criteria
   * @returns {Promise} - Array of projects
   */
  async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.Username as CreatorName
      FROM Projects p
      LEFT JOIN Users u ON p.CreatedBy = u.UserID
    `;
    
    const values = [];
    const whereConditions = [];
    let paramCount = 1;
    
    // Add filters if provided
    if (filters.projectStatus) {
      whereConditions.push(`p.ProjectStatus = $${paramCount}`);
      values.push(filters.projectStatus);
      paramCount++;
    }
    
    if (filters.clientName) {
      whereConditions.push(`p.ClientName ILIKE $${paramCount}`);
      values.push(`%${filters.clientName}%`);
      paramCount++;
    }
    
    if (filters.createdBy) {
      whereConditions.push(`p.CreatedBy = $${paramCount}`);
      values.push(filters.createdBy);
      paramCount++;
    }
    
    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Add ordering
    query += ' ORDER BY p.CreationDate DESC';
    
    const result = await db.query(query, values);
    return result.rows;
  },
  
  /**
   * Find project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise} - Project object
   */
  async findById(projectId) {
    const query = `
      SELECT p.*, u.Username as CreatorName
      FROM Projects p
      LEFT JOIN Users u ON p.CreatedBy = u.UserID
      WHERE p.ProjectID = $1
    `;
    
    const result = await db.query(query, [projectId]);
    return result.rows[0];
  },
  
  /**
   * Update project information
   * @param {string} projectId - Project ID
   * @param {Object} projectData - Project data to update
   * @returns {Promise} - Updated project object
   */
  async update(projectId, projectData) {
    // Start building the query
    let query = 'UPDATE Projects SET ';
    const values = [];
    const updateFields = [];
    let paramCount = 1;
    
    // Add fields to update dynamically
    for (const [key, value] of Object.entries(projectData)) {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }
    
    // Always update LastModified timestamp
    updateFields.push('LastModified = CURRENT_TIMESTAMP');
    
    // Finalize the query
    query += updateFields.join(', ');
    query += ` WHERE ProjectID = $${paramCount} RETURNING *`;
    values.push(projectId);
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Delete a project
   * @param {string} projectId - Project ID
   * @returns {Promise} - Result of deletion
   */
  async delete(projectId) {
    const query = 'DELETE FROM Projects WHERE ProjectID = $1 RETURNING ProjectID';
    const result = await db.query(query, [projectId]);
    return result.rows[0];
  },
  
  /**
   * Get project statistics
   * @param {string} projectId - Project ID
   * @returns {Promise} - Project statistics
   */
  async getProjectStats(projectId) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM Zones WHERE ProjectID = $1) AS zoneCount,
        (SELECT COUNT(*) FROM WorkOrders WHERE ProjectID = $1) AS workOrderCount,
        (SELECT COUNT(*) FROM WorkOrders wo JOIN Flights f ON wo.WorkOrderID = f.WorkOrderID WHERE wo.ProjectID = $1) AS flightCount
    `;
    
    const result = await db.query(query, [projectId]);
    return result.rows[0];
  },
  
  /**
   * Get project financial summary
   * @param {string} projectId - Project ID
   * @returns {Promise} - Financial summary with total invoiced, paid, and outstanding amounts
   */
  async getFinancialSummary(projectId) {
    // Query to calculate project financial metrics
    const query = `
      SELECT
        SUM(InvoiceAmountWO) AS totalInvoiced,
        SUM(CASE WHEN InvoiceStatusWO = 'Paid' THEN InvoiceAmountWO ELSE 0 END) AS totalPaid,
        SUM(CASE WHEN InvoiceStatusWO IN ('Sent', 'Overdue') THEN InvoiceAmountWO ELSE 0 END) AS totalOutstanding
      FROM WorkOrders
      WHERE ProjectID = $1
    `;
    
    const result = await db.query(query, [projectId]);
    
    // Convert null values to 0
    const financialSummary = {
      totalInvoiced: parseFloat(result.rows[0].totalinvoiced || 0).toFixed(2),
      totalPaid: parseFloat(result.rows[0].totalpaid || 0).toFixed(2),
      totalOutstanding: parseFloat(result.rows[0].totaloutstanding || 0).toFixed(2)
    };
    
    return financialSummary;
  }
};

module.exports = Project;
