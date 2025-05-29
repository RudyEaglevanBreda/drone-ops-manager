/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error status and message
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Return error response
  res.status(status).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Custom error class with status code
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, ApiError };
