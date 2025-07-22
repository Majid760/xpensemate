import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';
import { validatePayment } from '../middleware/validators.js';

const router = express.Router();

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
// Get payment stats by period
router.get('/payments/stats', requireAuth, paymentController.getPaymentStatsByPeriod);

export default router; 
