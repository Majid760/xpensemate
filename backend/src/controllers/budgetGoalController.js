import { handleAsync } from '../utils/asyncHandler.js';
import { validatePaginationParams } from '../utils/validators.js';
import BudgetGoalService from '../services/budgetGoalService.js';
import { body } from 'express-validator';

const budgetGoalController = {
  /**
   * Handles HTTP request to create a new budget goal.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with the created goal or error.
   */
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
      res.status(201).json(
        {
          type: "success",
          title: 'Budget Goal Created',
          message: 'Budget goal created successfully',
          data: budgetGoal
        }
      );
    } catch (error) {
      console.error('Error in creating budget:', error);
      res.status(500).json({
        type: "error",
        title: 'Error creating budget',
        message: 'Error creating budget',
        error: error
      });
    }
  },

  /**
   * Handles HTTP request to fetch paginated budget goals (with filters).
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with paginated goals or error.
   */
  getBudgetGoals: async (req, res) => {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category_id: req.query.category_id,
        status: req.query.status,
        filterQuery: req.query.filter_query || '',
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1
      };
      console.log('FILTER QUERY', options.filterQuery);
      validatePaginationParams(options);
      const result = await BudgetGoalService.getBudgetGoals(req.user._id, options);
      res.json(
        {
          type: "success",
          title: "Budget Goals fetched successfully",
          message: "Budget Goals fetched successfully",
          data: result

        }
      );
    } catch (error) {
      console.error('Error in getting budget goals:', error);
      res.status(500).json({
        type: 'error',
        title: 'Server Error',
        message: 'An unexpected error occurred. Please try again.',
        error: 'Failed to fetch budget goals.'
      });
    }
  },

  /**
   * Handles HTTP request to fetch a single budget goal by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with the goal or 404/error.
   */
  getBudgetGoalById: async (req, res) => {
    try {
      const budgetGoal = await BudgetGoalService.getBudgetGoalById(req.user._id, req.params.id);
      if (!budgetGoal) {
        return res.status(404).json({
          type: "error",
          title: 'Budget goal not found',
          message: 'Budget goal not found.',
          error: 'Budget goal not found.'
        });
      }
      res.json([
        {
          type: "success",
          title: 'Budget goal found',
          message: 'Budget goal found.',
          data:{
            
          } 
        }
      ]);
    } catch (error) {
      console.error('Error in getting budget goal by id:', error);
      res.status(500).json({
        type: "error",
        title: 'Server Error',
        message: 'An unexpected error occurred. Please try again.',
        error: 'Failed to fetch budget goal.'
      });
    }
  },

  /**
   * Handles HTTP request to update a budget goal.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with the updated goal or error.
   */
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
        return res.status(404).json({
          type: "error",
          title: 'Budget goal not found',
          message: 'Budget goal not found.',
          error: 'Budget goal not found.'
        });
      }
      res.json({
        type: "success",
        title: 'Budget goal updated',
        message: 'Budget goal updated successfully.',
        data: {
          budgetGoal
        }
      });
    } catch (error) {
      console.error('Error in updating budget goal:', error);
      res.status(500).json({
        type: 'error',
        title: 'Error',
        message: 'Failed to update budget goal.',
        error: 'Failed to update budget goal.'
      });
    }
  },

  /**
   * Handles HTTP request to delete (soft-delete) a budget goal.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with success message or error.
   */
  deleteBudgetGoal: async (req, res) => {
    try {
      const result = await BudgetGoalService.deleteBudgetGoal(req.user._id, req.params.id);
      if (!result) {
        return res.status(404).json({
          type: "error",
          title: 'Budget goal not found',
          message: 'Budget goal not found.',
          error: 'Budget goal not found.'
        });
      }
      res.json(
        {
          type: "success",
          title: 'Budget goal deleted',
          message: 'Budget goal deleted successfully.',
          data:{
            result},
        }
      );
    } catch (error) {
      console.error('Error in deleting budget goal:', error);
      res.status(500).json({
        type: "error",
        title: 'Server Error',
        message: 'An unexpected error occurred. Please try again.',
        error: 'Failed to delete budget goal.'
      });
    }
  },

  /**
   * Handles HTTP request to get a monthly summary of budget goals by category.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with summary array or error.
   */
  getMonthlySummary: async (req, res) => {
    try {
      console.log('getGoalStatsByPeriod 9090');

      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const summary = await BudgetGoalService.getMonthlySummary(req.user._id, year, month);
      res.json({
        type: 'success',
        title: 'Monthly Summary',
        message: 'Monthly summary retrieved successfully',
        data: summary
      });
    } catch (error) {
      console.error('Error in getting monthly summary:', error);
      res.status(500).json({
        type: 'error',
        title: 'Server Error',
        message: 'Server Error',
        error: 'Failed to fetch monthly summary.'
      });
    }
  },

  /**
   * Handles HTTP request to get progress/status of a budget goal.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with progress object or error.
   */
  getBudgetGoalProgress: async (req, res) => {
    try {
      console.log('getGoalStatsByPeriod 889');

      const progress = await BudgetGoalService.getBudgetGoalProgress(req.user._id, req.params.id);
      res.json({
        type: 'success',
        title: 'Budget Goal Progress',
        message: 'Budget goal progress retrieved successfully',
        data: progress,
      });
    } catch (error) {
      console.error('Error in getting budget goal progress:', error);
      res.status(500).json({
        type: 'error',
        title: 'Failed to fetch budget goal progress',
        message: 'Failed to fetch budget goal progress.',
        error: 'Failed to fetch budget goal progress.'
      });
    }
  },

  /**
   * Handles HTTP request to fetch budget goals by status with pagination.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with array of goals or error.
   */
  getBudgetGoalsByStatus: async (req, res) => {
    console.log('getGoalStatsByPeriod 90900');

    try {
      const { status } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      // Validate pagination parameters
      if (options.page < 1) {
        return res.status(400).json({
          type: 'error',
          title: 'Validation Error',
          message: 'Page must be greater than 0',
          error: 'Page must be greater than 0'
        });
      }

      if (options.limit < 1 || options.limit > 100) {
        return res.status(400).json({
          type: 'error',
          title: 'Validation Error',
          message: 'Limit must be between 1 and 100',
          error: 'Limit must be between 1 and 100'
        });
      }

      const result = await BudgetGoalService.getBudgetGoalsByStatus(req.user._id, status, options);
      res.json({
        type: 'success',
        title: 'Budget Goals',
        message: `Budget goals with status '${status}' fetched successfully`,
        data: {
          budgetGoals: result.budgetGoals,
          pagination: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
          }
        },

      });
    } catch (error) {
      console.error('Error in getting budget goals by status:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          type: 'error',
          title: 'Validation Error',
          message: error.message,
          error: error.message
        });
      }
      res.status(500).json({
        type: 'error',
        title: 'Server Error',
        message: 'Failed to fetch budget goals by status.',
        error: error.message || 'Failed to fetch budget goals by status.'
      });
    }
  },

  /**
   * Handles HTTP request to fetch budget goals in a date range.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with array of goals or error.
   */
  getBudgetGoalsByDateRange: async (req, res) => {
    try {
      console.log('getGoalStatsByPeriod 789');

      const { startDate, endDate } = req.query;
      const budgetGoals = await BudgetGoalService.getBudgetGoalsByDateRange(req.user._id, startDate, endDate);
      res.json({
        type: 'success',
        title: 'Success',
        message: 'Successfully fetched budget goals by date range!',
        data: budgetGoals

      });
    } catch (error) {
      console.error('Error in getting budget goals by date range:', error);
      res.status(500).json({
        type: 'error',
        title: 'Server Error',
        message: 'Failed to fetch budget goals by date range.',
        error: 'Failed to fetch budget goals by date range.'
      });
    }
  },

  /**
   * Handles HTTP request to fetch all expenses for a budget goal.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with expenses array or error.
   */
  getExpensesForBudgetGoal: async (req, res) => {
    try {
      console.log('getExpensesForBudgetGoal 45');

      const result = await BudgetGoalService.getExpensesForBudgetGoal(req.user._id, req.params.id);
      res.json({
        type: "success",
        title: 'Expenses for budget goal',
        message: "Expenses for budget goal retrieved successfully.",
        data: result,
      });
    } catch (error) {
      console.error('Error in getting expenses for budget goal:', error);
      res.status(500).json({
        type: 'error',
        title: '',
        message: '',
        error: 'Failed to fetch expenses for budget goal.'
      });
    }
  },

  /**
   * Handles HTTP request to get analytics/stats for budget goals by period.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with stats object or error.
   */
  getGoalsByPeriod: async (req, res) => {
    try {
      console.log('getGoalStatsByPeriod 123');
      const { period, startDate, endDate, closestCount } = req.query;
      if (!period) {
        return res.status(400).json({

          type: 'error',
          title: '',
          message: 'Please provide a period.',
          error: 'Missing required period parameter.'
        });
      }
      const stats = await BudgetGoalService.getGoalStatsByPeriod(req.user._id, {
        period,
        startDate,
        endDate,
        closestCount: closestCount ? parseInt(closestCount) : undefined
      });
      res.json({
        type: 'success',
        title: 'insight',
        message: 'insight fetched successsfullly',
        data: stats
      });
    } catch (error) {
      console.error('Error in getting goal stats by period:', error);
      res.status(500).json({
        type: 'error',
        title: 'Server Error',
        message: 'Server Error',
        error: 'Failed to fetch goal stats by period.'
      });
    }
  },

  /// get budgets by period
  getBudgetsByPeriod: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.body;
      console.log('start date and end date for budgets 123',req.body);
      // first check if period is custom the make sure startDate and endDate are provided
      if (period === 'custom') {
        if (!startDate || !endDate) {
          return res.status(400).json({
            type: 'error',
            title: '',
            message: 'Please provide startDate and endDate for custom period.',
            error: 'Missing required startDate or endDate parameter.'
          });
        }
      }
      // check if period is valid and provided in given format
      if (!period || !isValidPeriod(period.toLowerCase())) {
        return res.status(400).json({
          type: 'error',
          title: '',
          message: 'Please provide a valid period.',
          error: 'Invalid period parameter.'
        });
      }
      if (period === 'custom') {
        const budgets = await BudgetGoalService.getBudgetGoalsByDatesRange(req.user._id, startDate, endDate);
        res.json({
          type: 'success',
          title: 'Budgets',
          message: 'Budgets fetched successfully',
          data: {
            "budgetGoals": budgets
          }
        });
      }
      // now calculate the startDate and endDate accordding to the period
      const { startDate: calculatedStartDate, endDate: calculatedEndDate } = calculatePeriodDates(period.toLowerCase());
      const budgets = await BudgetGoalService.getBudgetGoalsByDatesRange(req.user._id, calculatedStartDate, calculatedEndDate);
    
      res.json({
        type: 'success',
        title: 'Budgets',
        message: 'Budgets fetched successfully',
        data: {
          "budgetGoals": budgets
        }
      });
    } catch (error) {
      console.error('Error in getting budgets by period:', error);
      res.status(500).json({
        type: 'error',
        title: 'Server Error',
        message: 'Server Error',
        error: 'Failed to fetch budgets by period.'
      });
    }
  },
};

/**
 * Checks if the provided period is valid
 * @param {string} period - The period to validate
 * @returns {boolean} True if the period is valid, false otherwise
 */
function isValidPeriod(period) {
  const validPeriods = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'];
  return validPeriods.includes(period);
}

/**
 * Calculates the startDate and endDate for the given period
 * @param {string} period - The period for which to calculate the dates
 * @returns {Object} An object containing the startDate and endDate
 */
function calculatePeriodDates(period) {
  const today = new Date();
  let startDate, endDate;

  // Set endDate to today (end of day)
  endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  switch (period) {
    case 'daily':
      // Today only
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      // Last 7 days including today
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      // Last 30 days including today
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'quarterly':
      // Last 90 days including today
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 89);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yearly':
      // Last 365 days including today
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 364);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      // Default to monthly if period is not recognized
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
  }
  
  return { startDate, endDate };
}

export default budgetGoalController;




