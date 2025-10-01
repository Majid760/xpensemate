import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import logger from '../utils/logger.js';
import { validateObjectId } from '../utils/validators.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

/**
 * Service for managing user expenses.
 * Handles all business logic and data access for expenses.
 */
class ExpenseService {
  /**
   * Create a new expense for a user.
   * @param {ObjectId} userId - The user's MongoDB ObjectId.
   * @param {Object} data - Expense data (name, amount, date, category, etc.)
   * @returns {Promise<Expense>} The created expense document (populated with category_id).
   * @throws {ValidationError} If validation fails.
   * @throws {Error} For other errors.
   */
  async createExpense(userId, data) {
    try {
      data.user_id = userId;
      const expense = new Expense({
        user_id: userId,
        ...data
      });
      await expense.save();
      // Only populate if category_id is a valid ObjectId
      if (data.category_id && /^[0-9a-fA-F]{24}$/.test(data.category_id)) {
        await expense.populate('category_id', 'name type');
      }
      return expense;
    } catch (error) {
      logger.error('Error creating expense:', error);
      throw error;
    }
  }

  /**
   * Get all expenses for a user, with pagination and optional filters.
   * @param {ObjectId} userId - The user's MongoDB ObjectId.
   * @param {Object} options - { page, limit, startDate, endDate, category_id }
   * @returns {Promise<{expenses: Expense[], total: number, page: number, totalPages: number}>}
   * @throws {Error} For database or query errors.
   */
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
      const expenses = await Expense.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);
      
      // Populate category_id only if it's a valid ObjectId
      for (let expense of expenses) {
        if (expense.category_id && /^[0-9a-fA-F]{24}$/.test(expense.category_id.toString())) {
          await expense.populate('category_id', 'name type');
        }
      }
      
      const total = await Expense.countDocuments(filter);
      
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

  /**
   * Get a single expense by its ID for a user.
   * @param {ObjectId} userId - The user's MongoDB ObjectId.
   * @param {ObjectId|string} expenseId - The expense's MongoDB ObjectId.
   * @returns {Promise<Expense>} The expense document (populated with category_id).
   * @throws {ValidationError} If the ID is invalid.
   * @throws {NotFoundError} If the expense is not found.
   * @throws {Error} For other errors.
   */
  async getExpenseById(userId, expenseId) {
    try {
      if (!validateObjectId(expenseId)) {
        throw new ValidationError('Invalid expense ID');
      }
      const expense = await Expense.findOne({
        _id: expenseId,
        user_id: userId,
        is_deleted: false
      });
      if (!expense) {
        throw new NotFoundError('Expense not found');
      }
      // Only populate if category_id is a valid ObjectId
      if (expense.category_id && /^[0-9a-fA-F]{24}$/.test(expense.category_id.toString())) {
        await expense.populate('category_id', 'name type');
      }
      return expense;
    } catch (error) {
      logger.error('Error fetching expense by id:', error);
      throw error;
    }
  }

  /**
   * Update an existing expense for a user.
   * @param {ObjectId} userId - The user's MongoDB ObjectId.
   * @param {ObjectId|string} expenseId - The expense's MongoDB ObjectId.
   * @param {Object} updateData - Fields to update.
   * @returns {Promise<Expense>} The updated expense document (populated with category_id).
   * @throws {ValidationError} If the ID or category is invalid.
   * @throws {NotFoundError} If the expense is not found.
   * @throws {Error} For other errors.
   */
  async updateExpense(userId, expenseId, updateData) {
    try {
      if (!validateObjectId(expenseId)) {
        throw new ValidationError('Invalid expense ID');
      }
      // Remove validation on category_id - category can be any string
      const expense = await Expense.findOneAndUpdate(
        { _id: expenseId, user_id: userId, is_deleted: false },
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true }
      );
      if (!expense) {
        throw new NotFoundError('Expense not found');
      }
      // Only populate if category_id is a valid ObjectId
      if (expense.category_id && /^[0-9a-fA-F]{24}$/.test(expense.category_id.toString())) {
        await expense.populate('category_id', 'name type');
      }
      return expense;
    } catch (error) {
      logger.error('Error updating expense:', error);
      throw error;
    }
  }

  /**
   * Soft-delete an expense for a user (marks is_deleted=true).
   * @param {ObjectId} userId - The user's MongoDB ObjectId.
   * @param {ObjectId|string} expenseId - The expense's MongoDB ObjectId.
   * @returns {Promise<{message: string}>} Success message.
   * @throws {ValidationError} If the ID is invalid.
   * @throws {NotFoundError} If the expense is not found.
   * @throws {Error} For other errors.
   */
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

  /**
   * Get a summary of expenses by category for a given month.
   * @param {ObjectId} userId - The user's MongoDB ObjectId.
   * @param {number} year - The year (e.g., 2024).
   * @param {number} month - The month (1-12).
   * @returns {Promise<Array<{category: string, total: number}>>} Array of category totals.
   * @throws {Error} For database or aggregation errors.
   */
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

  /**
   * Get all expenses for a user within a custom date range.
   * @param {ObjectId} userId - The user's MongoDB ObjectId.
   * @param {string|Date} startDate - Start date (inclusive).
   * @param {string|Date} endDate - End date (inclusive).
   * @returns {Promise<Expense[]>} Array of expenses in the range.
   * @throws {ValidationError} If dates are missing or invalid.
   * @throws {Error} For other errors.
   */
  async getExpensesByDateRange(userId, startDate, endDate) {
    try {
      if (!startDate || !endDate) {
        throw new ValidationError('Start date and end date are required');
      }
      const expenses = await Expense.findByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      
      // Populate category_id only if it's a valid ObjectId
      for (let expense of expenses) {
        if (expense.category_id && /^[0-9a-fA-F]{24}$/.test(expense.category_id.toString())) {
          await expense.populate('category_id', 'name icon color');
        }
      }
      
      return expenses;
    } catch (error) {
      logger.error('Error fetching expenses by date range:', error);
      throw error;
    }
  }

  /**
 * Get expense stats for a given period or custom range.
 * @param {ObjectId} userId - The user's MongoDB ObjectId.
 * @param {Object} options - { period: string, startDate?: string|Date, endDate?: string|Date }
 * @returns {Promise<{totalSpent: number, dailyAverage: number, spendingVelocityPercent: number, spendingVelocityMessage: string, trackingStreak: number, startDate: Date, endDate: Date, trend: Array, categories: Array}>}
 * @throws {ValidationError} If period or dates are invalid.
 * @throws {Error} For other errors.
 */
async getStatsByPeriod(userId, { period, startDate, endDate }) {
    // Constants
    const ALLOWED_PERIODS = ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'];
    const PERIOD_DAYS = {
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      yearly: 365
    };
    const HISTORICAL_PERIODS = {
      weekly: 8,
      monthly: 6,
      quarterly: 4,
      yearly: 3
    };
    
    // 1. Validate period
    if (!ALLOWED_PERIODS.includes(period)) {
      throw new ValidationError(`Invalid period. Must be one of: ${ALLOWED_PERIODS.join(', ')}`);
    }
  
    // 2. Calculate date range
    const { rangeStart, rangeEnd } = this._calculateDateRange(period, startDate, endDate);
    
    console.info(`Querying expenses for user: ${userId} from ${rangeStart} to ${rangeEnd}`);
  
    // 3. Query all expenses in range with lean() for better performance
    const expenses = await Expense.find({
      user_id: userId,
      date: { $gte: rangeStart, $lte: rangeEnd },
      is_deleted: false
    })
    .lean()
    .exec();
  
    // 4. Calculate basic stats
    const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const days = Math.max(1, Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1);
    const dailyAverage = totalSpent / days;
  
    console.info(`Total spent: ${totalSpent}, Daily average: ${dailyAverage}`);
  
    // 5. Calculate tracking streak
    const trackingStreak = this._calculateTrackingStreak(expenses, rangeStart, rangeEnd);
  
    // 6. Calculate spending velocity (for non-custom periods)
    const { spendingVelocityPercent, spendingVelocityMessage } = period !== 'custom' 
      ? await this._calculateSpendingVelocity(userId, period, rangeStart, totalSpent)
      : { spendingVelocityPercent: null, spendingVelocityMessage: 'Not available for custom range' };
  
    // 7. Calculate trend data
    const trend = this._calculateTrend(expenses, period, rangeStart, rangeEnd);
  
    // 8. Calculate category breakdown
    const categories = this._calculateCategoryBreakdown(expenses);
  
    return {
      totalSpent,
      dailyAverage,
      spendingVelocityPercent,
      spendingVelocityMessage,
      trackingStreak,
      startDate: rangeStart,
      endDate: rangeEnd,
      trend,
      categories
    };
  }
  
  /**
   * Calculate date range based on period type
   * @private
   */
  _calculateDateRange(period, startDate, endDate) {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    if (period === 'custom') {
      if (!startDate || !endDate) {
        throw new ValidationError('Custom period requires both startDate and endDate');
      }
      return {
        rangeStart: new Date(startDate),
        rangeEnd: new Date(endDate)
      };
    }
  
    const daysToSubtract = {
      weekly: 6,
      monthly: 29,
      quarterly: 89,
      yearly: 364
    };
  
    const rangeEnd = new Date(todayUTC);
    const rangeStart = new Date(todayUTC);
    rangeStart.setUTCDate(todayUTC.getUTCDate() - daysToSubtract[period]);
  
    return { rangeStart, rangeEnd };
  }
  
  /**
   * Calculate tracking streak (consecutive days with expenses)
   * @private
   */
  _calculateTrackingStreak(expenses, rangeStart, rangeEnd) {
    const daysWithExpense = new Set(
      expenses.map(exp => {
        const d = new Date(exp.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
  
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      if (daysWithExpense.has(d.getTime())) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
  
    return maxStreak;
  }
  
  /**
   * Calculate spending velocity compared to previous period
   * @private
   */
  async _calculateSpendingVelocity(userId, period, rangeStart, totalSpent) {
    // Get spending for the immediately previous period
    const previousPeriodTotal = await this._getHistoricalPeriodTotal(userId, period, rangeStart, 1);
    
    if (previousPeriodTotal === 0) {
      return {
        spendingVelocityPercent: null,
        spendingVelocityMessage: 'No data from previous period for comparison'
      };
    }
  
    const spendingVelocityPercent = ((totalSpent - previousPeriodTotal) / previousPeriodTotal) * 100;
    const absPercent = Math.abs(Math.round(spendingVelocityPercent));
  
    let spendingVelocityMessage;
    const periodNames = {
      weekly: 'week',
      monthly: 'month', 
      quarterly: 'quarter',
      yearly: 'year'
    };
  
    if (Math.abs(spendingVelocityPercent) < 5) {
      spendingVelocityMessage = `Similar spending to last ${periodNames[period]}`;
    } else if (spendingVelocityPercent > 0) {
      spendingVelocityMessage = `Spending ${absPercent}% more than last ${periodNames[period]}`;
    } else {
      spendingVelocityMessage = `Spending ${absPercent}% less than last ${periodNames[period]}`;
    }
  
    return { spendingVelocityPercent, spendingVelocityMessage };
  }
  
  /**
   * Get historical period total for comparison
   * @private
   */
  async _getHistoricalPeriodTotal(userId, period, rangeStart, periodsBack) {
    const { histStart, histEnd } = this._getHistoricalDateRange(period, rangeStart, periodsBack);
    
    const result = await Expense.aggregate([
      {
        $match: {
          user_id: userId,
          date: { $gte: histStart, $lte: histEnd },
          is_deleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
  
    return result.length > 0 ? result[0].total : 0;
  }
  
  /**
   * Calculate historical date range
   * @private
   */
  _getHistoricalDateRange(period, rangeStart, periodsBack) {
    let histStart, histEnd;
  
    switch (period) {
      case 'weekly': {
        const monday = new Date(rangeStart);
        monday.setDate(monday.getDate() - periodsBack * 7);
        histStart = new Date(monday);
        histEnd = new Date(monday);
        histEnd.setDate(histEnd.getDate() + 6);
        break;
      }
      case 'monthly': {
        const month = new Date(rangeStart);
        month.setMonth(month.getMonth() - periodsBack);
        histStart = new Date(month.getFullYear(), month.getMonth(), 1);
        histEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        break;
      }
      case 'quarterly': {
        const thisQuarter = Math.floor(rangeStart.getMonth() / 3);
        const q = thisQuarter - periodsBack;
        const year = rangeStart.getFullYear() + Math.floor(q / 4);
        const quarter = ((q % 4) + 4) % 4;
        histStart = new Date(year, quarter * 3, 1);
        histEnd = new Date(year, quarter * 3 + 3, 0);
        break;
      }
      case 'yearly': {
        const year = rangeStart.getFullYear() - periodsBack;
        histStart = new Date(year, 0, 1);
        histEnd = new Date(year, 11, 31);
        break;
      }
      default:
        throw new Error(`Invalid period: ${period}`);
    }
  
    return { histStart, histEnd };
  }
  
  /**
   * Calculate trend data for visualization
   * @private
   */
  _calculateTrend(expenses, period, rangeStart, rangeEnd) {
    const isDaily = ['weekly', 'monthly', 'custom'].includes(period);
    
    if (isDaily) {
      return this._calculateDailyTrend(expenses, rangeStart, rangeEnd);
    } else {
      return this._calculateMonthlyTrend(expenses, rangeStart, rangeEnd);
    }
  }
  
  /**
   * Calculate daily trend data
   * @private
   */
  _calculateDailyTrend(expenses, rangeStart, rangeEnd) {
    const dayMap = new Map();
    
    // Initialize all days with 0
    for (let d = new Date(rangeStart), i = 0; d <= rangeEnd; d.setDate(d.getDate() + 1), i++) {
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { label: `Day ${i + 1}`, amount: 0 });
    }
    
    // Add expense amounts
    expenses.forEach(exp => {
      const key = new Date(exp.date).toISOString().slice(0, 10);
      if (dayMap.has(key)) {
        dayMap.get(key).amount += exp.amount || 0;
      }
    });
    
    return Array.from(dayMap.values());
  }
  
  /**
   * Calculate monthly trend data
   * @private
   */
  _calculateMonthlyTrend(expenses, rangeStart, rangeEnd) {
    const monthMap = new Map();
    
    // Initialize all months with 0
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setMonth(d.getMonth() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, {
        label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        amount: 0
      });
    }
    
    // Add expense amounts
    expenses.forEach(exp => {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap.has(key)) {
        monthMap.get(key).amount += exp.amount || 0;
      }
    });
    
    return Array.from(monthMap.values());
  }
  
  /**
   * Calculate category breakdown
   * @private
   */
  _calculateCategoryBreakdown(expenses) {
    const categoryMap = new Map();
    
    expenses.forEach(exp => {
      const catName = exp.category_id?.name || exp.category || 'Uncategorized';
      
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, { category: catName, amount: 0 });
      }
      
      categoryMap.get(catName).amount += exp.amount || 0;
    });
    
    return Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  }
  
}

export default new ExpenseService(); 