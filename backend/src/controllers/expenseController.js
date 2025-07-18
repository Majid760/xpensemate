const ExpenseService = require('../services/expenseService');
const BudgetGoalService = require('../services/budgetGoalService');
const logger = require('../utils/logger');

const expenseController = {
  /**
   * Create a new expense for the authenticated user.
   * @route POST /api/expenses
   * @body {Object} req.body - Expense data (name, amount, date, category, etc.)
   * @returns {201: Expense, 400: Validation error, 500: Server error}
   */
  createExpense: async (req, res) => {
    try {
      const expense = await ExpenseService.createExpense(req.user._id, req.body);

      // If expense is linked to a budget goal, update the budget
      if (req.body.budget_goal_id && expense.amount) {
        await BudgetGoalService.updateBudgetGoal(
          req.user._id,
          req.body.budget_goal_id,
          { $inc: { remainingBalance: -Math.abs(expense.amount) } } // subtract expense from budget
        );
        // Or, if you track currentSpending, you might do:
        // { $inc: { currentSpending: Math.abs(expense.amount) } }
      }

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

  /**
   * Get all expenses for the authenticated user, with pagination and filters.
   * @route GET /api/expenses
   * @query {number} page - Page number (optional)
   * @query {number} limit - Page size (optional)
   * @query {string} startDate - Filter start date (optional)
   * @query {string} endDate - Filter end date (optional)
   * @query {string} category_id - Filter by category (optional)
   * @returns {200: {expenses, total, page, totalPages}, 500: Server error}
   */
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

  /**
   * Get a single expense by ID for the authenticated user.
   * @route GET /api/expenses/:id
   * @param {string} req.params.id - Expense ID
   * @returns {200: Expense, 404: Not found, 500: Server error}
   */
  getExpenseById: async (req, res) => {
    try {
      const expense = await ExpenseService.getExpenseById(req.user._id, req.params.id);
      res.json(expense);
    } catch (error) {
      logger.error('Error fetching expense:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch expense' });
    }
  },

  /**
   * Update an expense for the authenticated user.
   * @route PUT /api/expenses/:id
   * @param {string} req.params.id - Expense ID
   * @body {Object} req.body - Fields to update
   * @returns {200: Expense, 404: Not found, 400/500: Error}
   */
  updateExpense: async (req, res) => {
    try {
      const expense = await ExpenseService.updateExpense(req.user._id, req.params.id, req.body);
      res.json(expense);
    } catch (error) {
      logger.error('Error updating expense:', error);
      res.status(500).json({ error: error.message || 'Failed to update expense' });
    }
  },

  /**
   * Soft-delete an expense for the authenticated user.
   * @route DELETE /api/expenses/:id
   * @param {string} req.params.id - Expense ID
   * @returns {200: Success message, 404: Not found, 400/500: Error}
   */
  deleteExpense: async (req, res) => {
    try {
      const result = await ExpenseService.deleteExpense(req.user._id, req.params.id);
      res.json(result);
    } catch (error) {
      logger.error('Error deleting expense:', error);
      res.status(500).json({ error: error.message || 'Failed to delete expense' });
    }
  },

  /**
   * Get a summary of expenses by category for a given month.
   * @route GET /api/expenses/summary?year=YYYY&month=MM
   * @query {number} year - Year (optional, defaults to current)
   * @query {number} month - Month (optional, defaults to current)
   * @returns {200: Array of category totals, 500: Error}
   */
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

  /**
   * Get all expenses for a custom date range.
   * @route GET /api/expenses/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   * @query {string} startDate - Start date (required)
   * @query {string} endDate - End date (required)
   * @returns {200: Array of expenses, 400/500: Error}
   */
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

  /**
   * Get expense stats for a given period or custom range.
   * @route GET /api/expenses/stats?period=weekly|monthly|quarterly|yearly|custom&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   * @query {string} period - One of: weekly, monthly, quarterly, yearly, custom
   * @query {string} [startDate] - Required if period=custom
   * @query {string} [endDate] - Required if period=custom
   * @returns {200: {totalSpent, dailyAverage, budgetUsage, trackingStreak, startDate, endDate}, 400: Validation error}
   * @description
   *   - totalSpent: Sum of all expenses in the range
   *   - dailyAverage: totalSpent divided by number of days in the range
   *   - budgetUsage: null (can be implemented if budgets are available)
   *   - trackingStreak: Longest consecutive days with at least one expense
   *   - startDate/endDate: The actual date range used
   */
  getStats: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const stats = await ExpenseService.getStatsByPeriod(req.user._id, { period, startDate, endDate });
      res.json(stats);
    } catch (error) {
      logger.error('Error fetching stats:', error);
      res.status(400).json({ error: error.message || 'Failed to fetch stats' });
    }
  },
};

module.exports = expenseController; 