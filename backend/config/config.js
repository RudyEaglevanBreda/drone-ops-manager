// Configuration settings for the application

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'drone_ops_manager',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  
  // JWT authentication configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'drone-ops-super-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
};
