import express from 'express';
const router = express.Router();
import { requireAuth } from '../middleware/auth.js';
import dashboardController from '../controllers/dashboardController.js';

// Dashboard Stats APIs
router.get('/expenses/weekly-stats', requireAuth, dashboardController.getStatsByPeriod);
router.get('/dashboard/budget-goals', requireAuth, dashboardController.getActiveBudgetGoalsWithExpenses);
router.get('/dashboard/budget-goals/stats', requireAuth, dashboardController.getBudgetGoalsStats);
router.get('/dashboard/expense/stats', requireAuth, dashboardController.getWeeklyExpenseAnalytics);
router.get('/dashboard/activity', requireAuth, dashboardController.getUserActivityByPeriod);

router.get('/dashboard/goals',requireAuth, dashboardController.getGoalsByStatusAndPeriod);

export default router;
