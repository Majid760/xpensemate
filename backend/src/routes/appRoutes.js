import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import supportController from  '../controllers/supportController.js';
import { requireAuth } from '../middleware/auth.js';
import utilityController from '../controllers/utility_controller.js';
import dashboard from './dashboardRoutes.js';
import budgetGoalsRoutes from './budgetGoalRoutes.js';
import settingRoutes from './settingsRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import walletRoutes from './walletRoutes.js';

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

router.use('/',paymentRoutes);
router.use('/',walletRoutes);
// Mount dashboard/user dashboard routes
router.use('/', dashboard);

// Mount setting routes
router.use('/settings',settingRoutes);

export default router;