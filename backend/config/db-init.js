/**
 * Database initialization script
 * Automatically creates tables if they don't exist
 */

const db = require('./db-selector');
const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, '../database_schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split the schema into individual statements
const statements = schema
  .replace(/\r\n/g, '\n')
  .split(';')
  .filter(statement => statement.trim() !== '');

/**
 * Initialize the database with schema
 */
async function initializeDatabase() {
  console.log('Checking database schema...');
  
  try {
    // Check if the Users table exists (as a proxy for schema initialization)
    const result = await db.query(
      "SELECT to_regclass('public.users') IS NOT NULL AS exists"
    );
    
    const tableExists = result.rows[0].exists;
    
    if (tableExists) {
      console.log('Database schema already initialized');
      return;
    }
    
    console.log('Initializing database schema...');
    
    // Execute each statement in the schema
    for (const statement of statements) {
      await db.query(statement + ';');
    }
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
  }
}

module.exports = { initializeDatabase };
