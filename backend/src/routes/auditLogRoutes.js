import express from 'express';
const router = express.Router();
import auditLogController from '../controllers/auditLogController.js';
import { authenticate, authorize } from '../middleware/auth.js';

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

export default router; 