const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Only admin users can access audit logs
router.use(authorize(['admin']));

// Get all audit logs with filters
router.get('/', auditLogController.getAuditLogs);

// Get audit logs for a specific document
router.get('/document/:collection_name/:document_id', auditLogController.getDocumentLogs);

// Get audit logs for a specific user
router.get('/user/:user_id', auditLogController.getUserLogs);

module.exports = router; 