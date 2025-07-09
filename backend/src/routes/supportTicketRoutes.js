const express = require('express');
const router = express.Router();
const supportTicketController = require('../controllers/supportTicketController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorization');
const { validateSupportTicket } = require('../middleware/validators');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new support ticket
router.post('/', validateSupportTicket, supportTicketController.createTicket);

// Get all tickets (admin only)
router.get('/', isAdmin, supportTicketController.getAllTickets);

// Get a single ticket by ID
router.get('/:id', supportTicketController.getTicketById);

// Update ticket status (admin only)
router.patch('/:id/status', isAdmin, supportTicketController.updateTicketStatus);

// Assign ticket (admin only)
router.patch('/:id/assign', isAdmin, supportTicketController.assignTicket);

// Add response to ticket
router.post('/:id/responses', validateSupportTicket, supportTicketController.addResponse);

// Delete ticket (admin only)
router.delete('/:id', isAdmin, supportTicketController.deleteTicket);

module.exports = router; 