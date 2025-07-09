const express = require('express');
const router = express.Router();
const supportController = require('../controller/supportController');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      type: 'error',
      title: 'Authentication Required',
      message: 'Please log in to submit a support request.',
    });
  }
  next();
};

// Test SMTP configuration
router.get('/test-smtp', supportController.testSmtp);

// Submit support request
router.post('/support', requireAuth, supportController.submitSupportRequest);

module.exports = router; 