const db = require('../config/db-selector');

const Zone = {
  /**
   * Create a new zone for a project
   * @param {Object} zoneData - Zone data
   * @returns {Promise} - Created zone object
   */
  async create(zoneData) {
    const {
      projectId,
      zoneName,
      zoneReferenceKML_Path,
      isActive
    } = zoneData;
    
    const query = `
      INSERT INTO Zones (
        ProjectID, ZoneName, ZoneReferenceKML_Path, IsActive
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      projectId,
      zoneName,
      zoneReferenceKML_Path,
      isActive !== undefined ? isActive : true
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Get all zones for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} - Array of zones
   */
  async findByProject(projectId) {
    const query = `
      SELECT *
      FROM Zones
      WHERE ProjectID = $1
      ORDER BY ZoneName
    `;
    
    const result = await db.query(query, [projectId]);
    return result.rows;
  },
  
  /**
   * Find zone by ID
   * @param {number} zoneId - Zone ID
   * @returns {Promise} - Zone object
   */
  async findById(zoneId) {
    const query = `
      SELECT z.*, p.ProjectName
      FROM Zones z
      JOIN Projects p ON z.ProjectID = p.ProjectID
      WHERE z.ZoneID = $1
    `;
    
    const result = await db.query(query, [zoneId]);
    return result.rows[0];
  },
  
  /**
   * Update zone information
   * @param {number} zoneId - Zone ID
   * @param {Object} zoneData - Zone data to update
   * @returns {Promise} - Updated zone object
   */
  async update(zoneId, zoneData) {
    // Start building the query
    let query = 'UPDATE Zones SET ';
    const values = [];
    const updateFields = [];
    let paramCount = 1;
    
    // Add fields to update dynamically
    for (const [key, value] of Object.entries(zoneData)) {
      if (value !== undefined) {
        // Convert camelCase keys to database column names
        const columnName = key.replace(/([A-Z])/g, '_$1').toUpperCase();
        updateFields.push(`${columnName} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }
    
    // Always update UpdatedAt timestamp
    updateFields.push('UpdatedAt = CURRENT_TIMESTAMP');
    
    // Finalize the query
    query += updateFields.join(', ');
    query += ` WHERE ZoneID = $${paramCount} RETURNING *`;
    values.push(zoneId);
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Delete a zone
   * @param {number} zoneId - Zone ID
   * @returns {Promise} - Result of deletion
   */
  async delete(zoneId) {
    const query = 'DELETE FROM Zones WHERE ZoneID = $1 RETURNING ZoneID';
    const result = await db.query(query, [zoneId]);
    return result.rows[0];
  },
  
  /**
   * Toggle zone active status
   * @param {number} zoneId - Zone ID
   * @param {boolean} isActive - New active status
   * @returns {Promise} - Updated zone object
   */
  async toggleActive(zoneId, isActive) {
    const query = `
      UPDATE Zones
      SET IsActive = $1, UpdatedAt = CURRENT_TIMESTAMP
      WHERE ZoneID = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [isActive, zoneId]);
    return result.rows[0];
  }
};

module.exports = Zone;
