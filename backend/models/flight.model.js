const db = require('../config/db-selector');

const Flight = {
  /**
   * Create a new flight record
   * @param {Object} flightData - Flight data
   * @returns {Promise} - Created flight object
   */
  async create(flightData) {
    const {
      workOrderId,
      flightDate,
      pilotName,
      pilotId,
      droneUsed,
      batteryCount,
      estimatedFlightTime,
      actualFlightTime,
      mappedAreaSQM,
      totalDistanceFlownM,
      rawDataLink_Path,
      processedDataLink_Path,
      flightStatus,
      flightNotes
    } = flightData;
    
    const query = `
      INSERT INTO Flights (
        WorkOrderID, FlightDate, PilotName, PilotID, DroneUsed, BatteryCount,
        EstimatedFlightTime, ActualFlightTime, MappedAreaSQM, TotalDistanceFlownM,
        RawDataLink_Path, ProcessedDataLink_Path, FlightStatus, FlightNotes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      workOrderId,
      flightDate,
      pilotName,
      pilotId,
      droneUsed,
      batteryCount,
      estimatedFlightTime,
      actualFlightTime,
      mappedAreaSQM,
      totalDistanceFlownM,
      rawDataLink_Path,
      processedDataLink_Path,
      flightStatus || 'Planned',
      flightNotes
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Get all flights with optional filtering
   * @param {Object} filters - Optional filter criteria
   * @returns {Promise} - Array of flights
   */
  async findAll(filters = {}) {
    let query = `
      SELECT f.*, wo.WorkOrderName, u.Username as PilotUsername
      FROM Flights f
      JOIN WorkOrders wo ON f.WorkOrderID = wo.WorkOrderID
      LEFT JOIN Users u ON f.PilotID = u.UserID
    `;
    
    const values = [];
    const whereConditions = [];
    let paramCount = 1;
    
    // Add filters if provided
    if (filters.workOrderId) {
      whereConditions.push(`f.WorkOrderID = $${paramCount}`);
      values.push(filters.workOrderId);
      paramCount++;
    }
    
    if (filters.pilotId) {
      whereConditions.push(`f.PilotID = $${paramCount}`);
      values.push(filters.pilotId);
      paramCount++;
    }
    
    if (filters.flightStatus) {
      whereConditions.push(`f.FlightStatus = $${paramCount}`);
      values.push(filters.flightStatus);
      paramCount++;
    }
    
    if (filters.flightDateStart) {
      whereConditions.push(`f.FlightDate >= $${paramCount}`);
      values.push(filters.flightDateStart);
      paramCount++;
    }
    
    if (filters.flightDateEnd) {
      whereConditions.push(`f.FlightDate <= $${paramCount}`);
      values.push(filters.flightDateEnd);
      paramCount++;
    }
    
    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Add ordering
    query += ' ORDER BY f.FlightDate DESC, f.CreatedAt DESC';
    
    const result = await db.query(query, values);
    return result.rows;
  },
  
  /**
   * Find flights by work order ID
   * @param {number} workOrderId - Work order ID
   * @returns {Promise} - Array of flights
   */
  async findByWorkOrder(workOrderId) {
    return this.findAll({ workOrderId });
  },
  
  /**
   * Find flight by ID
   * @param {number} flightId - Flight ID
   * @returns {Promise} - Flight object
   */
  async findById(flightId) {
    const query = `
      SELECT f.*, wo.WorkOrderName, p.ProjectID, p.ProjectName, u.Username as PilotUsername
      FROM Flights f
      JOIN WorkOrders wo ON f.WorkOrderID = wo.WorkOrderID
      JOIN Projects p ON wo.ProjectID = p.ProjectID
      LEFT JOIN Users u ON f.PilotID = u.UserID
      WHERE f.FlightID = $1
    `;
    
    const result = await db.query(query, [flightId]);
    return result.rows[0];
  },
  
  /**
   * Update flight information
   * @param {number} flightId - Flight ID
   * @param {Object} flightData - Flight data to update
   * @returns {Promise} - Updated flight object
   */
  async update(flightId, flightData) {
    // Start building the query
    let query = 'UPDATE Flights SET ';
    const values = [];
    const updateFields = [];
    let paramCount = 1;
    
    // Add fields to update dynamically
    for (const [key, value] of Object.entries(flightData)) {
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
    query += ` WHERE FlightID = $${paramCount} RETURNING *`;
    values.push(flightId);
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Delete a flight
   * @param {number} flightId - Flight ID
   * @returns {Promise} - Result of deletion
   */
  async delete(flightId) {
    const query = 'DELETE FROM Flights WHERE FlightID = $1 RETURNING FlightID';
    const result = await db.query(query, [flightId]);
    return result.rows[0];
  },
  
  /**
   * Update flight status
   * @param {number} flightId - Flight ID
   * @param {string} status - New status
   * @returns {Promise} - Updated flight object
   */
  async updateStatus(flightId, status) {
    const query = `
      UPDATE Flights
      SET FlightStatus = $1, UpdatedAt = CURRENT_TIMESTAMP
      WHERE FlightID = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [status, flightId]);
    return result.rows[0];
  },
  
  /**
   * Get flight statistics for a specific work order
   * @param {number} workOrderId - Work order ID
   * @returns {Promise} - Flight statistics
   */
  async getWorkOrderFlightStats(workOrderId) {
    const query = `
      SELECT 
        COUNT(*) AS totalFlights,
        SUM(CASE WHEN FlightStatus = 'Completed' THEN 1 ELSE 0 END) AS completedFlights,
        SUM(CASE WHEN FlightStatus = 'Cancelled' THEN 1 ELSE 0 END) AS cancelledFlights,
        SUM(CASE WHEN FlightStatus = 'Planned' THEN 1 ELSE 0 END) AS plannedFlights,
        SUM(MappedAreaSQM) AS totalMappedAreaSQM,
        SUM(TotalDistanceFlownM) AS totalDistanceFlownM
      FROM Flights
      WHERE WorkOrderID = $1
    `;
    
    const result = await db.query(query, [workOrderId]);
    return result.rows[0];
  }
};

module.exports = Flight;
