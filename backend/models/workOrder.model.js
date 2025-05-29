const db = require('../config/db-selector');

const WorkOrder = {
  /**
   * Create a new work order
   * @param {Object} workOrderData - Work order data
   * @param {number} userId - ID of user creating the work order
   * @returns {Promise} - Created work order object
   */
  async create(workOrderData, userId) {
    const {
      projectId,
      zoneId,
      workOrderName,
      scheduledDate,
      servicesRequestedWO,
      operationalKML_WO_Path,
      workOrderStatus,
      quoteAmountWO,
      quotePDF_Path_WO,
      quoteStatusWO,
      invoiceAmountWO,
      invoicePDF_Path_WO,
      invoiceStatusWO,
      workOrderFolderID_Drive,
      workOrderFolderName_Drive
    } = workOrderData;
    
    const query = `
      INSERT INTO WorkOrders (
        ProjectID, ZoneID, WorkOrderName, ScheduledDate, ServicesRequestedWO,
        OperationalKML_WO_Path, WorkOrderStatus, QuoteAmountWO, QuotePDF_Path_WO,
        QuoteStatusWO, InvoiceAmountWO, InvoicePDF_Path_WO, InvoiceStatusWO,
        WorkOrderFolderID_Drive, WorkOrderFolderName_Drive, CreatedBy
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const values = [
      projectId,
      zoneId,
      workOrderName,
      scheduledDate,
      servicesRequestedWO, // This should be an array in PostgreSQL
      operationalKML_WO_Path,
      workOrderStatus || 'Draft',
      quoteAmountWO,
      quotePDF_Path_WO,
      quoteStatusWO,
      invoiceAmountWO,
      invoicePDF_Path_WO,
      invoiceStatusWO,
      workOrderFolderID_Drive,
      workOrderFolderName_Drive,
      userId
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Get all work orders with optional filtering
   * @param {Object} filters - Optional filter criteria
   * @returns {Promise} - Array of work orders
   */
  async findAll(filters = {}) {
    let query = `
      SELECT wo.*, p.ProjectName, z.ZoneName, u.Username as CreatorName
      FROM WorkOrders wo
      JOIN Projects p ON wo.ProjectID = p.ProjectID
      LEFT JOIN Zones z ON wo.ZoneID = z.ZoneID
      LEFT JOIN Users u ON wo.CreatedBy = u.UserID
    `;
    
    const values = [];
    const whereConditions = [];
    let paramCount = 1;
    
    // Add filters if provided
    if (filters.projectId) {
      whereConditions.push(`wo.ProjectID = $${paramCount}`);
      values.push(filters.projectId);
      paramCount++;
    }
    
    if (filters.zoneId) {
      whereConditions.push(`wo.ZoneID = $${paramCount}`);
      values.push(filters.zoneId);
      paramCount++;
    }
    
    if (filters.workOrderStatus) {
      whereConditions.push(`wo.WorkOrderStatus = $${paramCount}`);
      values.push(filters.workOrderStatus);
      paramCount++;
    }
    
    if (filters.scheduledDateStart) {
      whereConditions.push(`wo.ScheduledDate >= $${paramCount}`);
      values.push(filters.scheduledDateStart);
      paramCount++;
    }
    
    if (filters.scheduledDateEnd) {
      whereConditions.push(`wo.ScheduledDate <= $${paramCount}`);
      values.push(filters.scheduledDateEnd);
      paramCount++;
    }
    
    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Add ordering
    query += ' ORDER BY wo.ScheduledDate DESC, wo.CreatedAt DESC';
    
    const result = await db.query(query, values);
    return result.rows;
  },
  
  /**
   * Find work orders by project ID
   * @param {string} projectId - Project ID
   * @returns {Promise} - Array of work orders
   */
  async findByProject(projectId) {
    return this.findAll({ projectId });
  },
  
  /**
   * Find work order by ID
   * @param {number} workOrderId - Work order ID
   * @returns {Promise} - Work order object
   */
  async findById(workOrderId) {
    const query = `
      SELECT wo.*, p.ProjectName, z.ZoneName, u.Username as CreatorName
      FROM WorkOrders wo
      JOIN Projects p ON wo.ProjectID = p.ProjectID
      LEFT JOIN Zones z ON wo.ZoneID = z.ZoneID
      LEFT JOIN Users u ON wo.CreatedBy = u.UserID
      WHERE wo.WorkOrderID = $1
    `;
    
    const result = await db.query(query, [workOrderId]);
    return result.rows[0];
  },
  
  /**
   * Update work order information
   * @param {number} workOrderId - Work order ID
   * @param {Object} workOrderData - Work order data to update
   * @returns {Promise} - Updated work order object
   */
  async update(workOrderId, workOrderData) {
    // Start building the query
    let query = 'UPDATE WorkOrders SET ';
    const values = [];
    const updateFields = [];
    let paramCount = 1;
    
    // Add fields to update dynamically
    for (const [key, value] of Object.entries(workOrderData)) {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }
    
    // Always update UpdatedAt timestamp
    updateFields.push('UpdatedAt = CURRENT_TIMESTAMP');
    
    // Finalize the query
    query += updateFields.join(', ');
    query += ` WHERE WorkOrderID = $${paramCount} RETURNING *`;
    values.push(workOrderId);
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Delete a work order
   * @param {number} workOrderId - Work order ID
   * @returns {Promise} - Result of deletion
   */
  async delete(workOrderId) {
    const query = 'DELETE FROM WorkOrders WHERE WorkOrderID = $1 RETURNING WorkOrderID';
    const result = await db.query(query, [workOrderId]);
    return result.rows[0];
  },
  
  /**
   * Update work order status
   * @param {number} workOrderId - Work order ID
   * @param {string} status - New status
   * @returns {Promise} - Updated work order object
   */
  async updateStatus(workOrderId, status) {
    const query = `
      UPDATE WorkOrders
      SET WorkOrderStatus = $1, UpdatedAt = CURRENT_TIMESTAMP
      WHERE WorkOrderID = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [status, workOrderId]);
    return result.rows[0];
  },
  
  /**
   * Update quote information
   * @param {number} workOrderId - Work order ID
   * @param {Object} quoteData - Quote data
   * @returns {Promise} - Updated work order object
   */
  async updateQuote(workOrderId, quoteData) {
    const { quoteAmountWO, quotePDF_Path_WO, quoteStatusWO } = quoteData;
    
    const query = `
      UPDATE WorkOrders
      SET QuoteAmountWO = $1, QuotePDF_Path_WO = $2, QuoteStatusWO = $3, UpdatedAt = CURRENT_TIMESTAMP
      WHERE WorkOrderID = $4
      RETURNING *
    `;
    
    const values = [quoteAmountWO, quotePDF_Path_WO, quoteStatusWO, workOrderId];
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Update invoice information
   * @param {number} workOrderId - Work order ID
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise} - Updated work order object
   */
  async updateInvoice(workOrderId, invoiceData) {
    const { invoiceAmountWO, invoicePDF_Path_WO, invoiceStatusWO } = invoiceData;
    
    const query = `
      UPDATE WorkOrders
      SET InvoiceAmountWO = $1, InvoicePDF_Path_WO = $2, InvoiceStatusWO = $3, UpdatedAt = CURRENT_TIMESTAMP
      WHERE WorkOrderID = $4
      RETURNING *
    `;
    
    const values = [invoiceAmountWO, invoicePDF_Path_WO, invoiceStatusWO, workOrderId];
    const result = await db.query(query, values);
    return result.rows[0];
  }
};

module.exports = WorkOrder;
