const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { requireAuth } = require('../middleware/auth');
const {  validatePayment } = require('../middleware/validators');

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<  Payment routes  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Create a new payment
router.post('/create-payment', requireAuth, validatePayment, walletController.createPayment);
// Get all payments with pagination and filters
router.get('/payments', requireAuth, walletController.getPayments);
// Get monthly payment summary
router.get('/payment/summary/monthly', requireAuth, walletController.getMonthlySummary);
// Get a single payment by ID
router.get('/payment/:id', requireAuth, walletController.getPaymentById);
// Update a payment
router.put('/payment/:id', requireAuth, validatePayment, walletController.updatePayment);
// Delete a payment
router.delete('/payment/:id', requireAuth, walletController.deletePayment);



module.exports = router; 
