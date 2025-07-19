const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');
const {  validatePayment } = require('../middleware/validators');

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<  Payment routes  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Create a new payment
router.post('/create-payment', requireAuth, validatePayment, paymentController.createPayment);
// Get all payments with pagination and filters
router.get('/payments', requireAuth, paymentController.getPayments);
// Get monthly payment summary
router.get('/payment/summary/monthly', requireAuth, paymentController.getMonthlySummary);
// Get a single payment by ID
router.get('/payment/:id', requireAuth, paymentController.getPaymentById);
// Update a payment
router.put('/payment/:id', requireAuth, validatePayment, paymentController.updatePayment);
// Delete a payment
router.delete('/payment/:id', requireAuth, paymentController.deletePayment);



module.exports = router; 
