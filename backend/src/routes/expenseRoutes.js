import express from 'express';
const router = express.Router();
import expenseController from '../controllers/expenseController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateExpense } from '../middleware/validators.js';

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

// expense insight endpoints
router.get('/expenses/stats', requireAuth, expenseController.getStats);

export default router; 
