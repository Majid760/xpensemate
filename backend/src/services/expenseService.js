const Expense = require('../models/Expense');
const Category = require('../models/Category');
const logger = require('../utils/logger');
const { validateObjectId } = require('../utils/validators');
const { NotFoundError, ValidationError } = require('../utils/errors');

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
      ).populate('category_id', 'name icon color');
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
   * @returns {Promise<{totalSpent: number, dailyAverage: number, spendingVelocityPercent: number, spendingVelocityMessage: string, trackingStreak: number, startDate: Date, endDate: Date}>}
   * @throws {ValidationError} If period or dates are invalid.
   * @throws {Error} For other errors.
   *
   * - totalSpent: Sum of all expenses in the range.
   * - dailyAverage: totalSpent divided by number of days in the range.
   * - spendingVelocityPercent: % faster/slower than user's historical average for this period type.
   * - spendingVelocityMessage: Human-readable insight.
   * - trackingStreak: Longest consecutive days with at least one expense.
   * - startDate/endDate: The actual date range used.
   */
  async getStatsByPeriod(userId, { period, startDate, endDate }) {
    // 1. Validate period
    const allowedPeriods = ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'];
    if (!allowedPeriods.includes(period)) {
      throw new ValidationError('Invalid period. Must be one of: ' + allowedPeriods.join(', '));
    }
    // 2. Calculate date range
    let rangeStart, rangeEnd;
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); // Start of today in UTC

    if (period === 'weekly') {
      // Last 7 days including today
      rangeEnd = new Date(todayUTC);
      rangeStart = new Date(todayUTC);
      rangeStart.setUTCDate(todayUTC.getUTCDate() - 6);
    } else if (period === 'monthly') {
      // Last 30 days including today
      rangeEnd = new Date(todayUTC);
      rangeStart = new Date(todayUTC);
      rangeStart.setUTCDate(todayUTC.getUTCDate() - 29);
    } else if (period === 'quarterly') {
      // Last 90 days including today
      rangeEnd = new Date(todayUTC);
      rangeStart = new Date(todayUTC);
      rangeStart.setUTCDate(todayUTC.getUTCDate() - 89);
    } else if (period === 'yearly') {
      // Last 365 days including today
      rangeEnd = new Date(todayUTC);
      rangeStart = new Date(todayUTC);
      rangeStart.setUTCDate(todayUTC.getUTCDate() - 364);
    }
    console.info('Querying expenses for user:', userId, 'from', rangeStart, 'to', rangeEnd);
    // 3. Query all expenses in range
    const expenses = await Expense.find({
      user_id: userId,
      date: { $gte: rangeStart, $lte: rangeEnd },
      is_deleted: false
    });
    // 4. Calculate totalSpent
    const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    console.info('thi is tottal spent ==>',totalSpent);
    // 5. Calculate dailyAverage
    const days = Math.max(1, Math.ceil((rangeEnd - rangeStart) / (1000*60*60*24)) + 1);
    const dailyAverage = totalSpent / days;
    console.info('thi is avg spent ==>',dailyAverage);

    // 6. Caelculate budgetUsage (not implemented, set to null)
    const budgetUsage = null;
    // 7. Calculate trackingStreak (longest consecutive days with at least one expense)
    // Build a set of all days with expenses
    const daysWithExpense = new Set(expenses.map(exp => {
      const d = new Date(exp.date);
      d.setHours(0,0,0,0);
      return d.getTime();
    }));
    let maxStreak = 0, currentStreak = 0;
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      if (daysWithExpense.has(d.getTime())) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // --- Spending Velocity Calculation ---
    let spendingVelocityPercent = null;
    let spendingVelocityMessage = null;
    let historicalAverages = [];
    let periodsToLookBack = 0;
    if (['weekly', 'monthly', 'quarterly', 'yearly'].includes(period)) {
      if (period === 'weekly') {
        periodsToLookBack = 8;
      } else if (period === 'monthly') {
        periodsToLookBack = 6;
      } else if (period === 'quarterly') {
        periodsToLookBack = 4;
      } else if (period === 'yearly') {
        periodsToLookBack = 3;
      }
      // Gather historical periods (excluding current)
      for (let i = 1; i <= periodsToLookBack; i++) {
        let histStart, histEnd;
        if (period === 'weekly') {
          // Find the Monday of the week, then go back i weeks
          const monday = new Date(rangeStart);
          monday.setDate(monday.getDate() - i * 7);
          histStart = new Date(monday);
          histEnd = new Date(monday);
          histEnd.setDate(histEnd.getDate() + 6);
        } else if (period === 'monthly') {
          // Go back i months
          const month = new Date(rangeStart);
          month.setMonth(month.getMonth() - i);
          histStart = new Date(month.getFullYear(), month.getMonth(), 1);
          histEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        } else if (period === 'quarterly') {
          // Go back i quarters
          const thisQuarter = Math.floor(rangeStart.getMonth() / 3);
          const q = thisQuarter - i;
          const year = rangeStart.getFullYear() + Math.floor(q / 4);
          const quarter = ((q % 4) + 4) % 4;
          histStart = new Date(year, quarter * 3, 1);
          histEnd = new Date(year, quarter * 3 + 3, 0);
        } else if (period === 'yearly') {
          // Go back i years
          const year = rangeStart.getFullYear() - i;
          histStart = new Date(year, 0, 1);
          histEnd = new Date(year, 11, 31);
        }
        // Query expenses for this historical period
        // eslint-disable-next-line no-await-in-loop
        const histExpenses = await Expense.find({
          user_id: userId,
          date: { $gte: histStart, $lte: histEnd },
          is_deleted: false
        });
        const histTotal = histExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        historicalAverages.push(histTotal);
      }
      // Calculate average (exclude periods with zero spend if you want, or include all)
      const validAverages = historicalAverages.filter(x => typeof x === 'number');
      const historicalAverage = validAverages.length > 0 ? validAverages.reduce((a, b) => a + b, 0) / validAverages.length : 0;
      if (historicalAverage > 0) {
        spendingVelocityPercent = ((totalSpent - historicalAverage) / historicalAverage) * 100;
        const absPercent = Math.abs(Math.round(spendingVelocityPercent));
        if (spendingVelocityPercent > 0) {
          spendingVelocityMessage = `Spending ${absPercent}% faster than usual this ${period}`;
        } else if (spendingVelocityPercent < 0) {
          spendingVelocityMessage = `Spending ${absPercent}% slower than usual this ${period}`;
        } else {
          spendingVelocityMessage = `Spending at your usual pace this ${period}`;
        }
      } else {
        spendingVelocityPercent = null;
        spendingVelocityMessage = 'Not enough data for comparison';
      }
    } else {
      spendingVelocityPercent = null;
      spendingVelocityMessage = 'Not available for custom range';
    }

    // --- Spending Trend Calculation ---
    // For weekly/monthly: group by day; for quarterly/yearly: group by month
    let trend = [];
    if (['weekly', 'monthly', 'custom'].includes(period)) {
      // Group by day
      const dayMap = {};
      for (let d = new Date(rangeStart), i = 0; d <= rangeEnd; d.setDate(d.getDate() + 1), i++) {
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = { label: `Day ${i + 1}`, amount: 0 };
      }
      expenses.forEach(exp => {
        const key = new Date(exp.date).toISOString().slice(0, 10);
        if (dayMap[key]) dayMap[key].amount += exp.amount || 0;
      });
      trend = Object.values(dayMap);
    } else if (['quarterly', 'yearly'].includes(period)) {
      // Group by month
      const monthMap = {};
      let idx = 0;
      for (let d = new Date(rangeStart); d <= rangeEnd; d.setMonth(d.getMonth() + 1), idx++) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = { label: d.toLocaleString('default', { month: 'short', year: 'numeric' }), amount: 0 };
      }
      expenses.forEach(exp => {
        const d = new Date(exp.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthMap[key]) monthMap[key].amount += exp.amount || 0;
      });
      trend = Object.values(monthMap);
    }

    console.log("this is trend wowoow",trend);

    // --- Category Breakdown Calculation ---
    // Group by category name only
    const catMap = {};
    for (const exp of expenses) {
      const catName = exp.category_id && exp.category_id.name ? exp.category_id.name : exp.category;
      if (!catMap[catName]) {
        catMap[catName] = { category: catName, amount: 0 };
      }
      catMap[catName].amount += exp.amount || 0;
    }
    const categories = Object.values(catMap);

    // 8. Return stats
    return {
      totalSpent,
      dailyAverage,
      spendingVelocityPercent,
      spendingVelocityMessage,
      trackingStreak: maxStreak,
      startDate: rangeStart,
      endDate: rangeEnd,
      trend,
      categories
    };
  }
}

module.exports = new ExpenseService(); 