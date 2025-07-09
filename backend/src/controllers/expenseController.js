const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { validateObjectId } = require('../utils/validators');
const logger = require('../utils/logger');

const expenseController = {
  // Create a new expense
  createExpense: async (req, res) => {
    try {
      let { name, amount, date,location,time, detail, payment_method, category,status,budget_goal_id } = req.body;
      // If date is missing, set to today
      if (!date) {
        const today = new Date();
        date = today;
      }
      const expense = new Expense({
        user_id: req.user._id,
        name,
        amount,
        date,
        category, // Pass category name to the model
        detail,
        payment_method,
        status,
        budget_goal_id,
        location,
        time,
      });
      await expense.save();
      // Populate category details
      await expense.populate('category_id', 'name type');
      res.status(201).json(expense);
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.keys(error.errors).map(key => error.errors[key].message);
        console.error('Mongoose Validation Error:', errors);
        return res.status(400).json({ error: errors.join(', ') });
      }
      console.error('Error creating expense:', error.message);
  
      res.status(500).json({ error: 'Failed to create expense' });
    }
  },

  // Get all expenses with pagination and filters
  getAllExpenses: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = { user_id: req.user._id, is_deleted:false};

      // Add date range filter if provided
      if (req.query.startDate && req.query.endDate) {
        filter.date = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        };
      }
      // Add category filter if provided
      if (req.query.category_id) {
        filter.category_id = req.query.category_id;
      }
      // Get total count for pagination
      const total = await Expense.countDocuments(filter);

      // Get expenses with pagination
      const expenses = await Expense.find(filter)
        .populate('category_id', 'name type')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        expenses,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  },

  // Get a single expense by ID
  getExpenseById: async (req, res) => {
    try {
      const expense = await Expense.findOne({
        _id: req.params.id,
        user_id: req.user._id,
        is_deleted: false
      }).populate('category_id', 'name type');

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json(expense);
    } catch (error) {
      console.error('Error fetching expense:', error);
      res.status(500).json({ error: 'Failed to fetch expense' });
    }
  },

  // Update an expense
  updateExpense: async (req, res) => {
    try {
      const { name, amount, date, category_id, detail, payment_method } = req.body;

      // Validate category if provided
      if (category_id) {
        const category = await Category.findById(category_id);
        if (!category) {
          return res.status(400).json({ error: 'Category not found' });
        }
      }

      const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id, is_deleted: false },
        {
          name,
          amount,
          date,
          category_id,
          detail,
          payment_method,
          updated_at: new Date()
        },
        { new: true }
      ).populate('category_id', 'name type');

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json(expense);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  },

  // Delete an expense (soft delete)
  deleteExpense: async (req, res) => {
    try {
      const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id, is_deleted: false },
        { is_deleted: true, updated_at: new Date() },
        { new: true }
      );

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  },

  // Get monthly expense summary
  getMonthlySummary: async (req, res) => {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;

      const summary = await Expense.getMonthlySummary(req.user._id, year, month);

      // Get category details for each summary item
      const summaryWithCategories = await Promise.all(
        summary.map(async (item) => {
          const category = await Category.findById(item._id);
          return {
            category: category ? category.name : 'Uncategorized',
            total: item.total
          };
        })
      );

      res.json(summaryWithCategories);
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      res.status(500).json({ error: 'Failed to fetch monthly summary' });
    }
  },

  // Get expenses by date ranges
  getExpensesByDateRange: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const user_id = req.user._id;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const expenses = await Expense.findByDateRange(
        user_id,
        new Date(startDate),
        new Date(endDate)
      ).populate('category_id', 'name icon color');

      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch by date range!' });

    }
  },


};

module.exports = expenseController; 