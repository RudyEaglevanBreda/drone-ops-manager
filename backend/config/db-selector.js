/**
 * Database configuration selector
 * Automatically selects the appropriate database configuration based on environment
 */

const fs = require('fs');
const path = require('path');

// Check if we're running on Render.com by looking for their environment variables
const isRender = process.env.RENDER || process.env.IS_RENDER;

// Select the appropriate database configuration
let db;
if (isRender || process.env.NODE_ENV === 'production') {
  // Use Render-specific database configuration
  console.log('Using Render PostgreSQL configuration');
  db = require('./render-db');
} else {
  // Use standard database configuration for local development
  console.log('Using local PostgreSQL configuration');
  db = require('./db');
}

module.exports = db;
