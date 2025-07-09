const BudgetGoal = require('../models/BudgetGoal');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const logger = require('../utils/logger');
const { validateObjectId } = require('../utils/validators');
const { NotFoundError, ValidationError } = require('../utils/errors');

class BudgetGoalService {
  async createBudgetGoal(userId, budgetGoalData) {
    try {
      const budgetGoal = new BudgetGoal({
        user_id: userId,
        ...budgetGoalData,
        status: budgetGoalData.status || 'active'
      });

      await budgetGoal.save();
      return budgetGoal;
    } catch (error) {
      logger.error('Error creating budget goal:', error);
      throw error;
    }
  }

  async getBudgetGoals(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        category_id,
        status,
        sortBy = 'created_at',
        sortOrder = -1
      } = options;

      const skip = (page - 1) * limit;
      const filter = this._buildFilter(userId, { startDate, endDate, category_id, status });

      // Use Promise.all for parallel execution
      const [budgetGoals, total] = await Promise.all([
        BudgetGoal.find(filter)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        BudgetGoal.countDocuments(filter)
      ]);

      // Get expenses data in parallel
      const budgetGoalsWithExpenses = await this._enrichWithExpenses(userId, budgetGoals);

      return {
        budgetGoals: budgetGoalsWithExpenses,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching budget goals:', error);
      throw error;
    }
  }

  async getBudgetGoalById(userId, goalId) {
    try{
    if (!validateObjectId(goalId)) {
      throw new ValidationError('Invalid budget goal ID');
    }

    const budgetGoal = await BudgetGoal.findOne({
      _id: goalId,
      user_id: userId,
      is_deleted: false
    });

    if (!budgetGoal) {
      throw new NotFoundError('Budget goal not found');
    }
    return budgetGoal;
  }catch(error){
    logger.error('Error fetching goal  budget by id:', error);

  }
  }

  async updateBudgetGoal(userId, goalId, updateData) {
    if (!validateObjectId(goalId)) {
      throw new ValidationError('Invalid budget goal ID');
    }

    const budgetGoal = await BudgetGoal.findOneAndUpdate(
      { _id: goalId, user_id: userId, is_deleted: false },
      {
        ...updateData,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!budgetGoal) {
      throw new NotFoundError('Budget goal not found');
    }

    return budgetGoal;
  }

  async deleteBudgetGoal(userId, goalId) {
    if (!validateObjectId(goalId)) {
      throw new ValidationError('Invalid budget goal ID');
    }

    const budgetGoal = await BudgetGoal.findOneAndUpdate(
      { _id: goalId, user_id: userId, is_deleted: false },
      { is_deleted: true, updated_at: new Date() },
      { new: true }
    );

    if (!budgetGoal) {
      throw new NotFoundError('Budget goal not found');
    }

    return { message: 'Budget goal deleted successfully' };
  }

  async getMonthlySummary(userId, year, month) {
    try {
      const summary = await BudgetGoal.aggregate([
        {
          $match: {
            user_id: userId,
            date: {
              $gte: new Date(year, month - 1, 1),
              $lt: new Date(year, month, 1)
            },
            is_deleted: false
          }
        },
        {
          $group: {
            _id: '$category_id',
            totalAmount: { $sum: '$amount' },
            totalProgress: { $avg: '$progress' },
            goals: { $push: '$name' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Use aggregation to get category details in one query
      const summaryWithCategories = await BudgetGoal.aggregate([
        {
          $match: {
            user_id: userId,
            date: {
              $gte: new Date(year, month - 1, 1),
              $lt: new Date(year, month, 1)
            },
            is_deleted: false
          }
        },
        {
          $group: {
            _id: '$category_id',
            totalAmount: { $sum: '$amount' },
            totalProgress: { $avg: '$progress' },
            goals: { $push: '$name' },
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $project: {
            category: { $ifNull: [{ $arrayElemAt: ['$category.name', 0] }, 'Uncategorized'] },
            totalAmount: 1,
            averageProgress: '$totalProgress',
            goals: 1,
            count: 1
          }
        }
      ]);

      return summaryWithCategories;
    } catch (error) {
      logger.error('Error fetching monthly summary:', error);
      throw error;
    }
  }

  async getBudgetGoalProgress(userId, goalId) {
    const budgetGoal = await this.getBudgetGoalById(userId, goalId);
    
    return {
      progress: budgetGoal.progress,
      status: budgetGoal.status,
      amount: budgetGoal.amount,
      currentAmount: (budgetGoal.progress * budgetGoal.amount) / 100
    };
  }

  async getBudgetGoalsByDateRange(userId, startDate, endDate) {
    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }

    const budgetGoals = await BudgetGoal.find({
      user_id: userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      is_deleted: false
    });

    return budgetGoals;
  }

  async getExpensesForBudgetGoal(userId, goalId) {
    // Verify goal exists and belongs to user
    await this.getBudgetGoalById(userId, goalId);

    const expenses = await Expense.find({
      user_id: userId,
      budget_goal_id: goalId,
      is_deleted: false
    })
    .sort({ date: -1 })
    .populate('category_id', 'name type');

    return { expenses };
  }

  // Private helper methods
  _buildFilter(userId, options) {
    const filter = { user_id: userId, is_deleted: false };

    if (options.startDate && options.endDate) {
      filter.date = {
        $gte: new Date(options.startDate),
        $lte: new Date(options.endDate)
      };
    }

    if (options.category_id) {
      filter.category_id = options.category_id;
    }

    if (options.status) {
      filter.status = options.status;
    }

    return filter;
  }

  async _enrichWithExpenses(userId, budgetGoals) {
    if (!budgetGoals.length) return budgetGoals;

    const goalIds = budgetGoals.map(goal => goal._id);

    const expenses = await Expense.aggregate([
      {
        $match: {
          user_id: userId,
          is_deleted: false,
          budget_goal_id: { $in: goalIds }
        }
      },
      {
        $group: {
          _id: "$budget_goal_id",
          currentSpending: { $sum: "$amount" }
        }
      }
    ]);

    const expenseMap = new Map(
      expenses.map(expense => [expense._id.toString(), expense.currentSpending])
    );

    return budgetGoals.map(goal => ({
      ...goal,
      currentSpending: expenseMap.get(goal._id.toString()) || 0
    }));
  }
}


module.exports = new BudgetGoalService();