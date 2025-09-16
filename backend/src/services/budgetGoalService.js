import BudgetGoal from '../models/BudgetGoal.js';
import Category from '../models/Category.js';
import Expense from '../models/Expense.js';
import logger from '../utils/logger.js';
import { validateObjectId } from '../utils/validators.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class BudgetGoalService {
  /**
   * Creates a new budget goal for a user.
   * @param {ObjectId} userId - The user's ID.
   * @param {Object} budgetGoalData - Goal details (name, amount, date, etc.).
   * @returns {Promise<Object>} The created budget goal document.
   * @notes Sets status to 'active' if not provided.
   */
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

  /**
   * Fetches a paginated list of budget goals for a user, with optional filters.
   * @param {ObjectId} userId - The user's ID.
   * @param {Object} options - Pagination, date range, category, status, sorting.
   * @returns {Promise<Object>} Object with budgetGoals (array), total, page, totalPages.
   * @notes Enriches each goal with current spending.
   */
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

  /**
   * Fetches a single budget goal by its ID for a user.
   * @param {ObjectId} userId - The user's ID.
   * @param {ObjectId} goalId - The goal's ID.
   * @returns {Promise<Object>} The budget goal document.
   * @throws If not found or invalid ID.
   */
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

  /**
   * Fetches all budget goals for a user with a specific status.
   * @param {ObjectId} userId - The user's ID.
   * @param {string} status - The status to filter by (active, failed, achieved, terminated, other).
   * @returns {Promise<Array>} Array of budget goals with the specified status.
   */
  async getBudgetGoalsByStatus(userId, status) {
    // Validate status
    const validStatuses = ['active', 'failed', 'achieved', 'terminated', 'other'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const budgetGoals = await BudgetGoal.find({
      user_id: userId,
      status: status,
      is_deleted: false
    }).sort({ created_at: -1 }).lean();

    return budgetGoals;
  }

  /**
   * Updates a budget goal's details.
   * @param {ObjectId} userId - The user's ID.
   * @param {ObjectId} goalId - The goal's ID.
   * @param {Object} updateData - Fields to update.
   * @returns {Promise<Object>} The updated budget goal document.
   * @throws If not found or invalid ID.
   */
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

  /**
   * Soft-deletes a budget goal (marks as deleted).
   * @param {ObjectId} userId - The user's ID.
   * @param {ObjectId} goalId - The goal's ID.
   * @returns {Promise<Object>} Success message.
   * @throws If not found or invalid ID.
   */
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

  /**
   * Gets a summary of budget goals for a user for a specific month, grouped by category.
   * @param {ObjectId} userId - The user's ID.
   * @param {number} year - Year.
   * @param {number} month - Month (1-based).
   * @returns {Promise<Array>} Array of summaries per category.
   */
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

  /**
   * Gets the progress and status of a specific budget goal.
   * @param {ObjectId} userId - The user's ID.
   * @param {ObjectId} goalId - The goal's ID.
   * @returns {Promise<Object>} Object with progress, status, amount, and currentAmount.
   */
  async getBudgetGoalProgress(userId, goalId) {

    const budgetGoal = await this.getBudgetGoalById(userId, goalId);
    
    return {
      progress: budgetGoal.progress,
      status: budgetGoal.status,
      amount: budgetGoal.amount,
      currentAmount: (budgetGoal.progress * budgetGoal.amount) / 100
    };
  }

  /**
   * Fetches all budget goals for a user within a date range.
   * @param {ObjectId} userId - The user's ID.
   * @param {string|Date} startDate - Start date.
   * @param {string|Date} endDate - End date.
   * @returns {Promise<Array>} Array of budget goals.
   */
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

  /**
   * Gets all expenses linked to a specific budget goal.
   * @param {ObjectId} userId - The user's ID.
   * @param {ObjectId} goalId - The goal's ID.
   * @returns {Promise<Object>} Object with expenses array (populated with category info).
   */
  async getExpensesForBudgetGoal(userId, goalId) {
    // Verify goal exists and belongs to user
    await this.getBudgetGoalById(userId, goalId);

    const expenses = await Expense.find({
      user_id: userId,
      budget_goal_id: goalId,
      is_deleted: false
    })
    .sort({ date: -1 });

    // Populate category_id only if it's a valid ObjectId
    for (let expense of expenses) {
      if (expense.category_id && /^[0-9a-fA-F]{24}$/.test(expense.category_id.toString())) {
        await expense.populate('category_id', 'name type');
      }
    }

    return { expenses };
  }

  /**
   * Returns analytics/stats for budget goals in a given period (weekly, monthly, etc.).
   * @param {ObjectId} userId - The user's ID.
   * @param {Object} options - { period, startDate, endDate, closestCount }.
   * @returns {Promise<Object>} Analytics for the period.
   */
  async getGoalStatsByPeriod(userId, { period, startDate, endDate, closestCount = 3 }) {
    try {
      const ALLOWED_PERIODS = ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'];
      console.info("this is data ==>",period);
      console.info("this is data ==>",startDate);
      console.info("this is data ==>",endDate);

      if (!ALLOWED_PERIODS.includes(period)) {
        throw new ValidationError(`Invalid period. Must be one of: ${ALLOWED_PERIODS.join(', ')}`);
      }

      // Calculate date range
      const now = new Date();
      let rangeStart, rangeEnd;
      if (period === 'custom') {
        if (!startDate || !endDate) {
          throw new ValidationError('Custom period requires both startDate and endDate');
        }
        rangeStart = new Date(startDate);
        rangeEnd = new Date(endDate);
      } else {
        rangeEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        switch (period) {
          case 'weekly':
            rangeStart = new Date(rangeEnd);
            rangeStart.setUTCDate(rangeEnd.getUTCDate() - 6);
            break;
          case 'monthly':
            rangeStart = new Date(rangeEnd);
            rangeStart.setUTCDate(rangeEnd.getUTCDate() - 29);
            break;
          case 'quarterly':
            rangeStart = new Date(rangeEnd);
            rangeStart.setUTCDate(rangeEnd.getUTCDate() - 89);
            break;
          case 'yearly':
            rangeStart = new Date(rangeEnd);
            rangeStart.setUTCDate(rangeEnd.getUTCDate() - 364);
            break;
        }
      }

      // Query all goals in the period
      const matchBase = {
        user_id: userId,
        is_deleted: false,
        date: { $gte: rangeStart, $lte: rangeEnd }
      };

      // Aggregate counts by status and total budget for active
      const statusAgg = await BudgetGoal.aggregate([
        { $match: matchBase },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalBudget: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0]
              }
            },
            avgProgress: {
              $avg: {
                $cond: [{ $eq: ['$status', 'achieved'] }, '$progress', null]
              }
            }
          }
        }
      ]);

      // Format status counts
      const statusCounts = statusAgg.reduce((acc, s) => {
        acc[s._id] = s.count;
        if (s._id === 'active') acc.totalActiveBudget = s.totalBudget;
        if (s._id === 'achieved') acc.avgAchievedProgress = s.avgProgress;
        return acc;
      }, { totalActiveBudget: 0, avgAchievedProgress: 0 });

      // Total goals in period
      const totalGoals = await BudgetGoal.countDocuments(matchBase);

      // Overdue goals: date < today, status not achieved/terminated/failed
      const overdueGoals = await BudgetGoal.find({
        ...matchBase,
        date: { $lt: now },
        status: { $nin: ['achieved', 'terminated', 'failed'] }
      }).sort({ date: 1 }).lean();

      // Closest to deadline: soonest date >= today, still active
      const closestGoals = await BudgetGoal.find({
        ...matchBase,
        date: { $gte: now },
        status: 'active'
      })
        .sort({ date: 1 })
        .limit(closestCount)
        .lean();

      return {
        period,
        rangeStart,
        rangeEnd,
        statusCounts,
        totalGoals,
        totalActiveBudget: statusCounts.totalActiveBudget,
        avgAchievedProgress: statusCounts.avgAchievedProgress,
        overdueGoals,
        closestGoals
      };
    } catch (error) {
      logger.error('Error in getGoalStatsByPeriod:', error);
      throw error;
    }
  }

  // Private helper methods
  /**
   * Private helper to build a MongoDB filter for queries.
   * @param {ObjectId} userId - The user's ID.
   * @param {Object} options - Filter options (date, category, status).
   * @returns {Object} MongoDB filter object.
   */
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

  /**
   * Private helper to add current spending to each budget goal.
   * @param {ObjectId} userId - The user's ID.
   * @param {Array} budgetGoals - Array of budget goals.
   * @returns {Promise<Array>} Array of budget goals, each with a currentSpending field.
   */
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

export default new BudgetGoalService();