const ExpenseService = require('../services/expenseService');
const logger = require('../utils/logger');

const expenseController = {
  // Create a new expense
  createExpense: async (req, res) => {
    try {
      const expense = await ExpenseService.createExpense(req.user._id, req.body);
      res.status(201).json(expense);
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.keys(error.errors || {}).map(key => error.errors[key].message);
        logger.error('Mongoose Validation Error:', errors);
        return res.status(400).json({ error: errors.join(', ') });
      }
      logger.error('Error creating expense:', error.message);
      res.status(500).json({ error: error.message || 'Failed to create expense' });
    }
  },

  // Get all expenses with pagination and filters
  getAllExpenses: async (req, res) => {
    try {
      const { page, limit, startDate, endDate, category_id } = req.query;
      const options = { page, limit, startDate, endDate, category_id };
      const result = await ExpenseService.getAllExpenses(req.user._id, options);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching expenses:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch expenses' });
    }
  },

  // Get a single expense by ID
  getExpenseById: async (req, res) => {
    try {
      const expense = await ExpenseService.getExpenseById(req.user._id, req.params.id);
      res.json(expense);
    } catch (error) {
      logger.error('Error fetching expense:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch expense' });
    }
  },

  // Update an expense
  updateExpense: async (req, res) => {
    try {
      const expense = await ExpenseService.updateExpense(req.user._id, req.params.id, req.body);
      res.json(expense);
    } catch (error) {
      logger.error('Error updating expense:', error);
      res.status(500).json({ error: error.message || 'Failed to update expense' });
    }
  },

  // Delete an expense (soft delete)
  deleteExpense: async (req, res) => {
    try {
      const result = await ExpenseService.deleteExpense(req.user._id, req.params.id);
      res.json(result);
    } catch (error) {
      logger.error('Error deleting expense:', error);
      res.status(500).json({ error: error.message || 'Failed to delete expense' });
    }
  },

  // Get monthly expense summary
  getMonthlySummary: async (req, res) => {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const summary = await ExpenseService.getMonthlySummary(req.user._id, year, month);
      res.json(summary);
    } catch (error) {
      logger.error('Error fetching monthly summary:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch monthly summary' });
    }
  },

  // Get expenses by date ranges
  getExpensesByDateRange: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const expenses = await ExpenseService.getExpensesByDateRange(req.user._id, startDate, endDate);
      res.json(expenses);
    } catch (error) {
      logger.error('Error fetching expenses by date range:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch by date range!' });
    }
  },
};

module.exports = expenseController; 