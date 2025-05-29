const db = require('../config/db-selector');
const bcrypt = require('bcryptjs');

const User = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise} - Created user object
   */
  async create(userData) {
    const { username, email, password, firstName, lastName, role } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING UserID, Username, Email, FirstName, LastName, Role, CreatedAt
    `;
    
    const values = [username, email, passwordHash, firstName, lastName, role || 'user'];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise} - User object
   */
  async findById(id) {
    const query = `
      SELECT UserID, Username, Email, FirstName, LastName, Role, CreatedAt, LastLogin
      FROM Users
      WHERE UserID = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
  
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise} - User object including password hash for verification
   */
  async findByEmail(email) {
    const query = `
      SELECT UserID, Username, Email, PasswordHash, FirstName, LastName, Role, CreatedAt, LastLogin
      FROM Users
      WHERE Email = $1
    `;
    
    const result = await db.query(query, [email]);
    return result.rows[0];
  },
  
  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise} - User object including password hash for verification
   */
  async findByUsername(username) {
    const query = `
      SELECT UserID, Username, Email, PasswordHash, FirstName, LastName, Role, CreatedAt, LastLogin
      FROM Users
      WHERE Username = $1
    `;
    
    const result = await db.query(query, [username]);
    return result.rows[0];
  },
  
  /**
   * Update user's last login time
   * @param {number} id - User ID
   * @returns {Promise} - Updated user object
   */
  async updateLastLogin(id) {
    const query = `
      UPDATE Users
      SET LastLogin = CURRENT_TIMESTAMP
      WHERE UserID = $1
      RETURNING UserID, Username, Email, FirstName, LastName, Role, CreatedAt, LastLogin
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
  
  /**
   * Update user information
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} - Updated user object
   */
  async update(id, userData) {
    // Start building the query
    let query = 'UPDATE Users SET ';
    const values = [];
    const updateFields = [];
    let paramCount = 1;
    
    // Add fields to update dynamically
    for (const [key, value] of Object.entries(userData)) {
      if (value !== undefined && key !== 'password') {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }
    
    // Handle password update separately to hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      updateFields.push(`PasswordHash = $${paramCount}`);
      values.push(passwordHash);
      paramCount++;
    }
    
    // Finalize the query
    query += updateFields.join(', ');
    query += ` WHERE UserID = $${paramCount} RETURNING UserID, Username, Email, FirstName, LastName, Role, CreatedAt, LastLogin`;
    values.push(id);
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
};

module.exports = User;
