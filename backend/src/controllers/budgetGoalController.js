const { handleAsync } = require('../utils/asyncHandler');
const { validatePaginationParams } = require('../utils/validators');
const BudgetGoalService = require('../services/budgetGoalService');

const budgetGoalController = {
  createBudgetGoal: async (req, res) => {
    try {
      const { name, amount, date, priority, category, detail, status } = req.body;
      const budgetGoal = await BudgetGoalService.createBudgetGoal(req.user._id, {
        name,
        amount,
        date,
        priority,
        category,
        detail,
        status
      });
      res.status(201).json(budgetGoal);
    } catch (error) {
      console.error('Error in creating budget:', error);
      res.status(500).json({ error: 'Failed to create budget goal.' });
    }
  },

  getBudgetGoals: async (req, res) => {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category_id: req.query.category_id,
        status: req.query.status,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1
      };
      validatePaginationParams(options);
      const result = await BudgetGoalService.getBudgetGoals(req.user._id, options);
      res.json(result);
    } catch (error) {
      console.error('Error in getting budget goals:', error);
      res.status(500).json({ error: 'Failed to fetch budget goals.' });
    }
  },

  getBudgetGoalById: async (req, res) => {
    try {
      const budgetGoal = await BudgetGoalService.getBudgetGoalById(req.user._id, req.params.id);
      if (!budgetGoal) {
        return res.status(404).json({ error: 'Budget goal not found.' });
      }
      res.json(budgetGoal);
    } catch (error) {
      console.error('Error in getting budget goal by id:', error);
      res.status(500).json({ error: 'Failed to fetch budget goal.' });
    }
  },

  updateBudgetGoal: async (req, res) => {
    try {
      const { name, amount, date, category, priority, detail, status } = req.body;
      const budgetGoal = await BudgetGoalService.updateBudgetGoal(req.user._id, req.params.id, {
        name,
        amount,
        date,
        category,
        priority,
        detail,
        status
      });
      if (!budgetGoal) {
        return res.status(404).json({ error: 'Budget goal not found.' });
      }
      res.json(budgetGoal);
    } catch (error) {
      console.error('Error in updating budget goal:', error);
      res.status(500).json({ error: 'Failed to update budget goal.' });
    }
  },

  deleteBudgetGoal: async (req, res) => {
    try {
      const result = await BudgetGoalService.deleteBudgetGoal(req.user._id, req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Budget goal not found.' });
      }
      res.json(result);
    } catch (error) {
      console.error('Error in deleting budget goal:', error);
      res.status(500).json({ error: 'Failed to delete budget goal.' });
    }
  },

  getMonthlySummary: async (req, res) => {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const summary = await BudgetGoalService.getMonthlySummary(req.user._id, year, month);
      res.json(summary);
    } catch (error) {
      console.error('Error in getting monthly summary:', error);
      res.status(500).json({ error: 'Failed to fetch monthly summary.' });
    }
  },

  getBudgetGoalProgress: async (req, res) => {
    try {
      const progress = await BudgetGoalService.getBudgetGoalProgress(req.user._id, req.params.id);
      res.json(progress);
    } catch (error) {
      console.error('Error in getting budget goal progress:', error);
      res.status(500).json({ error: 'Failed to fetch budget goal progress.' });
    }
  },

  getBudgetGoalsByDateRange: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const budgetGoals = await BudgetGoalService.getBudgetGoalsByDateRange(req.user._id, startDate, endDate);
      res.json(budgetGoals);
    } catch (error) {
      console.error('Error in getting budget goals by date range:', error);
      res.status(500).json({ error: 'Failed to fetch budget goals by date range.' });
    }
  },

  getExpensesForBudgetGoal: async (req, res) => {
    try {
      const result = await BudgetGoalService.getExpensesForBudgetGoal(req.user._id, req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getting expenses for budget goal:', error);
      res.status(500).json({ error: 'Failed to fetch expenses for budget goal.' });
    }
  },

  getGoalStatsByPeriod: async (req, res) => {
    try {
      const { period, startDate, endDate, closestCount } = req.query;
      if (!period) {
        return res.status(400).json({ error: 'Missing required period parameter.' });
      }
      const stats = await BudgetGoalService.getGoalStatsByPeriod(req.user._id, {
        period,
        startDate,
        endDate,
        closestCount: closestCount ? parseInt(closestCount) : undefined
      });
      res.json(stats);
    } catch (error) {
      console.error('Error in getting goal stats by period:', error);
      res.status(500).json({ error: 'Failed to fetch goal stats by period.' });
    }
  }
};

module.exports = budgetGoalController;