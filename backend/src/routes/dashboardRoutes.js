const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Dashboard Stats APIs
router.get('/expenses/weekly-stats', requireAuth, dashboardController.getWeeklyStats);
router.get('/dashboard/budget-goals', requireAuth, dashboardController.getActiveBudgetGoalsWithExpenses);
router.get('/dashboard/budget-goals/stats', requireAuth, dashboardController.getBudgetGoalsStats);
router.get('/dashboard/expense/stats', requireAuth, dashboardController.getWeeklyExpenseAnalytics);
router.get('/dashboard/activity', requireAuth, dashboardController.getUserActivityByPeriod);


router.get('/dashboard/goals',requireAuth, dashboardController.getGoalsByStatusAndPeriod);

module.exports = router;
