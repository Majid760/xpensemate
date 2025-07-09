// utils/asyncHandler.js
const logger = require('./logger');
const { AppError } = require('./errors');

const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    logger.error('Async handler error:', error);
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    // Handle mongoose errors
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // Default error
    res.status(500).json({ error: 'Internal server error' });
  });
};

module.exports = { handleAsync };
