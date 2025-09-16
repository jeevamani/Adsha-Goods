const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error response
  let error = {
    success: false,
    message: 'Internal server error'
  };

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json(error);
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    error.message = 'Duplicate entry found';
    return res.status(409).json(error);
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    error.message = 'Referenced record not found';
    return res.status(400).json(error);
  }

  if (err.code === '23502') { // PostgreSQL not null violation
    error.message = 'Required field missing';
    return res.status(400).json(error);
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json(error);
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.message = 'File too large';
      return res.status(413).json(error);
    }
    error.message = 'File upload error';
    return res.status(400).json(error);
  }

  // Custom API errors
  if (err.statusCode) {
    error.message = err.message;
    return res.status(err.statusCode).json(error);
  }

  // Default to 500 server error
  res.status(500).json(error);
};

class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

module.exports = { errorHandler, ApiError };