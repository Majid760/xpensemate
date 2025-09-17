import express from 'express';
const router = express.Router();
import budgetGoalController from '../controllers/budgetGoalController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBudgetGoal } from '../middleware/validators.js';

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<  Budget Goals routes  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Create a new budget goal
router.post('/create-budget-goal', requireAuth, validateBudgetGoal, budgetGoalController.createBudgetGoal);
// Get all budget goals with pagination and filters
router.get('/budget-goals', requireAuth, budgetGoalController.getBudgetGoals);
// Get budget goals by status
router.get('/budget-goals/status/:status', requireAuth, budgetGoalController.getBudgetGoalsByStatus);
// Get monthly budget goals summary
router.get('/budget-goal/summary/monthly', requireAuth, budgetGoalController.getMonthlySummary);
// Get a single budget goal by ID
router.get('/budget-goal/:id', requireAuth, budgetGoalController.getBudgetGoalById);
// Update a budget goalfe
router.put('/budget-goal/:id', requireAuth, validateBudgetGoal, budgetGoalController.updateBudgetGoal);
// Delete a budget goal
router.delete('/budget-goal/:id', requireAuth, budgetGoalController.deleteBudgetGoal);
// Get budget goal progress
router.get('/budget-goal/:id/progress', requireAuth, budgetGoalController.getBudgetGoalProgress);
// Get all expense for specific budget 
router.get('/budget-goal/:id/expenses', requireAuth, budgetGoalController.getExpensesForBudgetGoal);
// Get goal stats by period
router.get('/budget/goal-insights', requireAuth, budgetGoalController.getGoalStatsByPeriod);

export default router; 