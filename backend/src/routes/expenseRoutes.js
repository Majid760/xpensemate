const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { requireAuth } = require('../middleware/auth');
const { validateExpense } = require('../middleware/validators');

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

/**
 * @route GET /expenses/stats
 * @query {string} period - One of: weekly, monthly, quarterly, yearly, custom
 * @query {string} [startDate] - Required if period=custom
 * @query {string} [endDate] - Required if period=custom
 * @desc Get spending stats and velocity insight for the selected period
 */
router.get('/expenses/stats', requireAuth, expenseController.getStats);


module.exports = router; 
