// Custom Error Handler
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err.statusCode = 400;
    err.message = message;
  }

  // JWT Token Error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    err.statusCode = 401;
    err.message = message;
  }

  // JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired';
    err.statusCode = 401;
    err.message = message;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = { AppError, errorHandler };
