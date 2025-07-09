const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const supportController = require('../controllers/supportController');
const { requireAuth } = require('../middleware/auth');
const { validateExpense, validatePayment } = require('../middleware/validators');
const expenseController = require('../controllers/expenseController');
const paymentController = require('../controllers/paymentController');
const utilityController = require('../controllers/utility_controller');
const dashboard = require('./dashboardRoutes');
const budgetGoals = require('./budgetGoalRoutes');
const setting = require('./settingsRoutes');

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


// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<  Expense routes  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Create a new expense
router.post('/create-expense', requireAuth,validateExpense, expenseController.createExpense);
// Get all expenses with pagination and filters
router.get('/expenses', requireAuth,expenseController.getAllExpenses);
// Get monthly expense summary
router.get('/expense/summary/monthly', requireAuth,expenseController.getMonthlySummary);
// Get a single expense by ID
router.get('/expense/:id', requireAuth,expenseController.getExpenseById);
// Update an expense
router.put('/expense/:id', requireAuth,validateExpense, expenseController.updateExpense);
// Delete an expense
router.delete('/expense/:id', requireAuth,expenseController.deleteExpense);


// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<  Expense routes  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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


router.use('/',budgetGoals);

// Mount dashboard/user dashboard routes
router.use('/', dashboard);

// Mount setting routes
router.use('/settings',setting);

module.exports = router;