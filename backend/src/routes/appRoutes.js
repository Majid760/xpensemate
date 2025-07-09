const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const supportController = require('../controllers/supportController');
const { requireAuth } = require('../middleware/auth');
const {  validatePayment } = require('../middleware/validators');
const expenseController = require('../controllers/expenseController');
const paymentController = require('../controllers/paymentController');
const utilityController = require('../controllers/utility_controller');
const dashboard = require('./dashboardRoutes');
const budgetGoalsRoutes = require('./budgetGoalRoutes');
const settingRoutes = require('./settingsRoutes');
const expenseRoutes = require('./expenseRoutes.js');

// Public routes (no authentication required)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password/:token', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/auth/refresh-token', authController.refreshToken);

// Google OAuth routes
router.post('/auth/google-oauth', authController.googleOAuth);

// Add after other public routes
router.post('/subscribe-newsletter', utilityController.subscribeEmail);

// get profile
router.get('/user/me', requireAuth, authController.getUser);
// Protected routes (authentication required)
router.post('/support/submit', requireAuth, supportController.submitSupportRequest);



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

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<  Payment routes  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


router.use('/',budgetGoalsRoutes);
router.use('/',expenseRoutes);


// Mount dashboard/user dashboard routes
router.use('/', dashboard);

// Mount setting routes
router.use('/settings',settingRoutes);

module.exports = router;