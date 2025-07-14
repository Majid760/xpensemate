const Expense = require('../models/Expense');
const Category = require('../models/Category');
const logger = require('../utils/logger');
const { validateObjectId } = require('../utils/validators');
const { NotFoundError, ValidationError } = require('../utils/errors');

class ExpenseService {
  async createExpense(userId, data) {
    try {
      const expense = new Expense({
        user_id: userId,
        ...data
      });
      await expense.save();
      await expense.populate('category_id', 'name type');
      return expense;
    } catch (error) {
      logger.error('Error creating expense:', error);
      throw error;
    }
  }

  async getAllExpenses(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        category_id
      } = options;
      const skip = (page - 1) * limit;
      const filter = { user_id: userId, is_deleted: false };
      if (startDate && endDate) {
        filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      if (category_id) {
        filter.category_id = category_id;
      }
      const [expenses, total] = await Promise.all([
        Expense.find(filter)
          .populate('category_id', 'name type')
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit),
        Expense.countDocuments(filter)
      ]);
      return {
        expenses,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching expenses:', error);
      throw error;
    }
  }

  async getExpenseById(userId, expenseId) {
    try {
      if (!validateObjectId(expenseId)) {
        throw new ValidationError('Invalid expense ID');
      }
      const expense = await Expense.findOne({
        _id: expenseId,
        user_id: userId,
        is_deleted: false
      }).populate('category_id', 'name type');
      if (!expense) {
        throw new NotFoundError('Expense not found');
      }
      return expense;
    } catch (error) {
      logger.error('Error fetching expense by id:', error);
      throw error;
    }
  }

  async updateExpense(userId, expenseId, updateData) {
    try {
      if (!validateObjectId(expenseId)) {
        throw new ValidationError('Invalid expense ID');
      }
      if (updateData.category_id) {
        const category = await Category.findById(updateData.category_id);
        if (!category) {
          throw new ValidationError('Category not found');
        }
      }
      const expense = await Expense.findOneAndUpdate(
        { _id: expenseId, user_id: userId, is_deleted: false },
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true }
      ).populate('category_id', 'name type');
      if (!expense) {
        throw new NotFoundError('Expense not found');
      }
      return expense;
    } catch (error) {
      logger.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(userId, expenseId) {
    try {
      if (!validateObjectId(expenseId)) {
        throw new ValidationError('Invalid expense ID');
      }
      const expense = await Expense.findOneAndUpdate(
        { _id: expenseId, user_id: userId, is_deleted: false },
        { is_deleted: true, updated_at: new Date() },
        { new: true }
      );
      if (!expense) {
        throw new NotFoundError('Expense not found');
      }
      return { message: 'Expense deleted successfully' };
    } catch (error) {
      logger.error('Error deleting expense:', error);
      throw error;
    }
  }

  async getMonthlySummary(userId, year, month) {
    try {
      const summary = await Expense.getMonthlySummary(userId, year, month);
      const summaryWithCategories = await Promise.all(
        summary.map(async (item) => {
          const category = await Category.findById(item._id);
          return {
            category: category ? category.name : 'Uncategorized',
            total: item.total
          };
        })
      );
      return summaryWithCategories;
    } catch (error) {
      logger.error('Error fetching monthly summary:', error);
      throw error;
    }
  }

  async getExpensesByDateRange(userId, startDate, endDate) {
    try {
      if (!startDate || !endDate) {
        throw new ValidationError('Start date and end date are required');
      }
      const expenses = await Expense.findByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      ).populate('category_id', 'name icon color');
      return expenses;
    } catch (error) {
      logger.error('Error fetching expenses by date range:', error);
      throw error;
    }
  }
}

module.exports = new ExpenseService(); 