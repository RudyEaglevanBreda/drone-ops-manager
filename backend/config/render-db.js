/**
 * Render.com PostgreSQL database configuration
 * This handles both local development and Render.com production database connections
 */

const { Pool } = require('pg');
const config = require('./config');

// Parse DATABASE_URL environment variable if available
let pool;

if (process.env.DATABASE_URL) {
  // If DATABASE_URL is provided (Render.com production environment)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render.com PostgreSQL
    }
  });
  console.log('Connected to Render PostgreSQL database via connection string');
} else {
  // If no DATABASE_URL, use individual config parameters (local development)
  pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password
  });
  console.log('Connected to local PostgreSQL database via individual parameters');
}

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
      console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);
    
    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    
    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  }
};
