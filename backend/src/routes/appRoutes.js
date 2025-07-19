const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const supportController = require('../controllers/supportController');
const { requireAuth } = require('../middleware/auth');
const utilityController = require('../controllers/utility_controller');
const dashboard = require('./dashboardRoutes');
const budgetGoalsRoutes = require('./budgetGoalRoutes');
const settingRoutes = require('./settingsRoutes');
const expenseRoutes = require('./expenseRoutes.js');
const walletRoutes = require('./walletRoutes.js');


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

//others module routes

router.use('/',budgetGoalsRoutes);
router.use('/',expenseRoutes);

router.use('/',walletRoutes);


// Mount dashboard/user dashboard routes
router.use('/', dashboard);

// Mount setting routes
router.use('/settings',settingRoutes);

module.exports = router;