const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Payment = require('../models/Payment');
const BudgetGoal = require('../models/BudgetGoal');
const { validateObjectId } = require('../utils/validators');
const logger = require('../utils/logger');

class DashboardController {

    constructor(){
        this.getWeeklyStats = this.getWeeklyStats.bind(this);
        this.getActiveBudgetGoalsWithExpenses = this.getActiveBudgetGoalsWithExpenses.bind(this);
        this.getBudgetGoalsStats = this.getBudgetGoalsStats.bind(this);
        this.getWeeklyExpenseAnalytics = this.getWeeklyExpenseAnalytics.bind(this);
        this.getGoalsByStatusAndPeriod = this.getGoalsByStatusAndPeriod.bind(this);
    }

 /**
   * get weekly stat
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */

 async getWeeklyStats(req, res)  {
    try {
      const userId = req.user._id;
      const now = new Date();
      const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      const startOfWeek = new Date(endOfToday);
      startOfWeek.setUTCDate(endOfToday.getUTCDate() - 6); // Get 7 days back from today

      // 1. Get total payments (income) for the week
      const payments = await Payment.aggregate([
        {
          $match: {
            user_id: userId,
            is_deleted: false,
            date: { $gte: startOfWeek, $lte: endOfToday }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);
      const weeklyBudget = payments.length > 0 ? payments[0].total : 0;
      // 2. Get daily expenses for the week
      const stats = await Expense.aggregate([
        {
          $match: {
            user_id: userId,
            is_deleted: false,
            date: { $gte: startOfWeek, $lte: endOfToday }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            },
            total: { 
              $sum: { 
                $convert: { 
                  input: "$amount",
                  to: "double",
                  onError: 0,
                  onNull: 0
                }
              }
            },
            dates: { $addToSet: "$date" }
          }
        },
        {
          $project: {
            _id: 1,
            total: { $round: ["$total", 2] },
            dates: 1
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Fill missing days with 0
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(endOfToday);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const found = stats.find(s => s._id === dateStr);
        result.push({
          date: dateStr,
          total: found ? parseFloat(found.total.toFixed(2)) : 0
        });
      }

      // 3. Compute total week expense and balance left
      const weekTotal = result.reduce((sum, d) => sum + d.total, 0);
      const balanceLeft = weeklyBudget - weekTotal;
      // Calculate daily average, highest, and lowest day
      const dailyAverage = result.length ? weekTotal / result.length : 0;
      // Only consider days with expenses for min/max
      const nonZeroDays = result.filter(d => d.total > 0);
      let highestDay = { total: 0, date: null };
      let lowestDay = { total: 0, date: null };
      if (nonZeroDays.length) {
        highestDay = nonZeroDays.reduce((max, d) => d.total > max.total ? d : max, nonZeroDays[0]);
        lowestDay = nonZeroDays.reduce((min, d) => d.total < min.total ? d : min, nonZeroDays[0]);
      }

      res.json({
        days: result,
        dailyBreakdown: result,
        weekTotal,
        balanceLeft,
        weeklyBudget,
        dailyAverage,
        highestDay,
        lowestDay
      });
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      res.status(500).json({ error: 'Failed to fetch weekly stats' });
    }
  }

  /**
   * Get budget goals with their current spending based on duration filter.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveBudgetGoalsWithExpenses(req, res) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 3;
      const skip = (page - 1) * limit;
      const { duration } = req.query; // 'daily', 'weekly', 'monthly', 'yearly'

      const now = new Date();
      let startDate, endDate;

      // Calculate date range based on duration filter
      if (duration === 'daily') {
        // Today only
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      } else if (duration === 'weekly') {
        // Last 7 days
        startDate = new Date(now);
        startDate.setUTCDate(now.getUTCDate() - 6);
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      } else if (duration === 'monthly') {
        // Current month
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      } else if (duration === 'yearly') {
        // Current year
        startDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
      } else {
        // Default to current month if no duration specified
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      }

      // Build query for budget goals created within the specified duration (both active and achieved)
      const query = {
        user_id: userId,
        is_deleted: false,
        status: { $in: ['active', 'achieved'] },
        created_at: { $gte: startDate, $lte: endDate }
      };

      // 1. Get total count for pagination
      const totalGoals = await BudgetGoal.countDocuments(query);
      const totalPages = Math.ceil(totalGoals / limit);

      // 2. Fetch paginated budget goals (active and achieved) for the user within the duration
      const budgetGoals = await BudgetGoal.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      if (!budgetGoals.length) {
        return res.json({
          goals: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalGoals: 0,
          },
          stats: {
            totalGoals: 0,
            activeGoals: 0,
            achievedGoals: 0,
            totalBudgeted: 0,
            totalAchievedBudget: 0,
          },
          duration: duration || 'monthly',
          dateRange: { startDate, endDate }
        });
      }

      // 3. Get goal IDs to find related expenses
      const goalIds = budgetGoals.map(goal => goal._id);

      // 4. Aggregate expenses for the fetched budget goals within the same duration
      const expenses = await Expense.aggregate([
        {
          $match: {
            user_id: userId,
            is_deleted: false,
            budget_goal_id: { $in: goalIds },
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$budget_goal_id",
            currentSpending: { $sum: "$amount" }
          }
        }
      ]);

      // 5. Create a map for quick lookup of spending by goal ID
      const expenseMap = expenses.reduce((map, expense) => {
        map[expense._id.toString()] = expense.currentSpending;
        return map;
      }, {});
      
      // 6. Combine goals with their spending data
      const result = budgetGoals.map(goal => ({
        _id: goal._id,
        name: goal.name,
        category: goal.category,
        setBudget: goal.amount,
        currentSpending: expenseMap[goal._id.toString()] || 0,
        priority: goal.priority,
        status: goal.status,
        date: goal.date,
        created_at: goal.created_at
      }));

      // --- Stats Calculation for the filtered duration ---
      // 1. Total goals in the duration (active + achieved)
      const totalGoalsCount = await BudgetGoal.countDocuments({ 
        user_id: userId, 
        is_deleted: false,
        status: { $in: ['active', 'achieved'] },
        created_at: { $gte: startDate, $lte: endDate }
      });

      // 2. Active goals in the duration
      const activeGoalsCount = await BudgetGoal.countDocuments({ 
        user_id: userId, 
        is_deleted: false, 
        status: 'active',
        created_at: { $gte: startDate, $lte: endDate }
      });

      // 3. Achieved goals in the duration
      const achievedGoalsCount = await BudgetGoal.countDocuments({ 
        user_id: userId, 
        is_deleted: false, 
        status: 'achieved',
        created_at: { $gte: startDate, $lte: endDate }
      });

      // 4. Total budget for active goals in the duration
      const activeGoalsDocs = await BudgetGoal.find({ 
        user_id: userId, 
        is_deleted: false, 
        status: 'active',
        created_at: { $gte: startDate, $lte: endDate }
      }, 'amount').lean();
      
      const totalBudgetedAmount = activeGoalsDocs.reduce((sum, g) => sum + (g.amount || 0), 0);

      // 5. Total budget for achieved goals in the duration
      const achievedGoalsDocs = await BudgetGoal.find({ 
        user_id: userId, 
        is_deleted: false, 
        status: 'achieved',
        created_at: { $gte: startDate, $lte: endDate }
      }, 'amount').lean();
      
      const totalAchievedBudgetAmount = achievedGoalsDocs.reduce((sum, g) => sum + (g.amount || 0), 0);
      res.json({
        goals: result,
        pagination: {
          currentPage: page,
          totalPages,
          totalGoals
        },
        stats: {
          totalGoals: totalGoalsCount,
          activeGoals: activeGoalsCount,
          achievedGoals: achievedGoalsCount,
          totalBudgeted: totalBudgetedAmount,
          totalAchievedBudget: totalAchievedBudgetAmount
        },
        duration: duration || 'monthly',
        dateRange: { startDate, endDate }
      });

    } catch (error) {
      logger.error('Error fetching budget goals with expenses:', error);
      res.status(500).json({ error: 'Failed to fetch budget goals with expenses' });
    }
  }

  /**
   * Get statistics for all budget goals.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBudgetGoalsStats(req, res) {
    try {
      const userId = req.user._id;

      // 1. Fetch all monthly budget goals for the user.
      const goals = await BudgetGoal.find({
        user_id: userId,
        is_deleted: false,
        duration: 'monthly'
      }).lean();

      if (!goals.length) {
        return res.json({
          totalGoals: 0,
          activeGoals: 0,
          achievedGoals: 0,
          totalBudgeted: 0,
          totalSpending: 0,
          overallProgress: 0,
        });
      }

      // 2. Calculate basic stats from the goals list.
      const totalGoals = goals.length;
      const activeGoals = goals.filter(g => g.status === 'active').length;
      const achievedGoals = goals.filter(g => g.status === 'achieved').length;
      const totalBudgeted = goals.reduce((sum, goal) => sum + goal.amount, 0);

      // 3. Aggregate total spending for all budgeted categories for the current month.
      const now = new Date();
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      const categoryIds = goals.map(goal => goal.category_id);

      const expenseAgg = await Expense.aggregate([
        {
          $match: {
            user_id: userId,
            is_deleted: false,
            category_id: { $in: categoryIds },
            date: { $gte: startOfMonth, $lte: endOfMonth },
          }
        },
        {
          $group: {
            _id: null,
            totalSpending: { $sum: '$amount' }
          }
        }
      ]);

      const totalSpending = expenseAgg.length > 0 ? expenseAgg[0].totalSpending : 0;

      // 4. Calculate overall progress.
      const overallProgress = totalBudgeted > 0 ? (totalSpending / totalBudgeted) * 100 : 0;

      res.json({
        totalGoals,
        activeGoals,
        achievedGoals,
        totalBudgeted,
        totalSpending,
        overallProgress: Math.min(100, overallProgress).toFixed(1), // Cap at 100%
      });

    } catch (error) {
      logger.error('Error fetching budget goals stats:', error);
      res.status(500).json({ error: 'Failed to fetch budget goals stats' });
    }
  }

  /**
   * Get weekly food analytics: expenses grouped by category and day for the last 7 days
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getWeeklyExpenseAnalytics(req, res) {
    try {
      const userId = req.user._id;
      const now = new Date();
      const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      const startOfWeek = new Date(endOfToday);
      startOfWeek.setUTCDate(endOfToday.getUTCDate() - 6); // 7 days ago

      // Get all expenses for the last 7 days, grouped by category and day
      const expenses = await Expense.aggregate([
        {
          $match: {
            user_id: userId,
            is_deleted: false,
            date: { $gte: startOfWeek, $lte: endOfToday }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: {
              category: '$category.name',
              dayOfWeek: { $dateToString: { format: '%w', date: '$date' } },
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
            },
            total: { $sum: { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } } }
          }
        },
        {
          $project: {
            _id: 0,
            category: '$_id.category',
            day: '$_id.dayOfWeek',
            date: '$_id.date',
            total: { $round: ['$total', 2] }
          }
        },
        { $sort: { category: 1, date: 1 } }
      ]);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // Build last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(endOfToday);
        d.setUTCDate(endOfToday.getUTCDate() - i);
        last7Days.push({
          date: d.toISOString().split('T')[0],
          day: dayNames[d.getUTCDay()],
          fullDay: fullDayNames[d.getUTCDay()]
        });
      }

      // For each category, fill in 7 days
      const categoryMap = {};
      const categoriesSet = new Set(expenses.map(e => e.category));
      categoriesSet.forEach(category => {
        categoryMap[category] = last7Days.map(dayObj => {
          const found = expenses.find(e => e.category === category && e.date === dayObj.date);
          return {
            day: dayObj.day,
            fullDay: dayObj.fullDay,
            date: dayObj.date,
            value: found ? found.total : 0
          };
        });
      });

      res.json({
        categories: Object.keys(categoryMap),
        data: categoryMap
      });
    } catch (error) {
      logger.error('Error fetching weekly food analytics:', error);
      res.status(500).json({ error: 'Failed to fetch weekly food analytics' });
    }
  }

  /**
   * Get user activity (expenses, payments, budgets) for daily, weekly, and monthly periods
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserActivityByPeriod(req, res) {
    try {
      const userId = req.user._id;
      const now = new Date();
      // Today
      const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      // This week (last 7 days)
      const startOfWeek = new Date(endOfToday);
      startOfWeek.setUTCDate(endOfToday.getUTCDate() - 6);
      // This month
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

      // Fetch all in parallel
      const [
        dailyExpenses, dailyPayments, dailyBudgets,
        weeklyExpenses, weeklyPayments, weeklyBudgets,
        monthlyExpenses, monthlyPayments, monthlyBudgets
      ] = await Promise.all([
        // Daily
        Expense.find({ user_id: userId, is_deleted: false, created_at: { $gte: startOfToday, $lte: endOfToday } }).lean(),
        Payment.find({ user_id: userId, is_deleted: false, created_at: { $gte: startOfToday, $lte: endOfToday } }).lean(),
        BudgetGoal.find({ user_id: userId, is_deleted: false, created_at: { $gte: startOfToday, $lte: endOfToday } }).lean(),
        // Weekly
        Expense.find({ user_id: userId, is_deleted: false, created_at: { $gte: startOfWeek, $lte: endOfToday } }).lean(),
        Payment.find({ user_id: userId, is_deleted: false, created_at: { $gte: startOfWeek, $lte: endOfToday } }).lean(),
        BudgetGoal.find({ user_id: userId, is_deleted: false, created_at: { $gte: startOfWeek, $lte: endOfToday } }).lean(),
        // Monthly
        Expense.find({ user_id: userId, is_deleted: false, created_at: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
        Payment.find({ user_id: userId, is_deleted: false, created_at: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
        BudgetGoal.find({ user_id: userId, is_deleted: false, created_at: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
      ]);

      res.json({
        daily: {
          expenses: dailyExpenses,
          payments: dailyPayments,
          budgets: dailyBudgets
        },
        weekly: {
          expenses: weeklyExpenses,
          payments: weeklyPayments,
          budgets: weeklyBudgets
        },
        monthly: {
          expenses: monthlyExpenses,
          payments: monthlyPayments,
          budgets: monthlyBudgets
        }
      });
    } catch (error) {
      logger.error('Error fetching user activity by period:', error);
      res.status(500).json({ error: 'Failed to fetch user activity by period' });
    }
  }

  /**
   * Fetch budget goals by status and period (weekly, monthly, yearly)
   * Query params: status, period
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGoalsByStatusAndPeriod(req, res) {
    try {
      const userId = req.user._id;
      const { status, period } = req.query;
      const now = new Date();
      let startDate;

      let query = {
        user_id: userId,
        is_deleted: false
      };
      if (status) {
        query.status = status;
      }

      if (period) {
        if (period === 'weekly') {
          // Start of current week (Monday)
          const day = now.getUTCDay();
          const diff = (day === 0 ? 6 : day - 1); // Monday as start
          startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff, 0, 0, 0, 0));
        } else if (period === 'monthly') {
          // Start of current month
          startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
        } else if (period === 'yearly') {
          // Start of current year
          startDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
        } else {
          return res.status(400).json({ error: 'Invalid period. Use weekly, monthly, or yearly.' });
        }
        query.created_at = { $gte: startDate, $lte: now };
      }

      const goals = await BudgetGoal.find(query).lean();
      res.json({ goals });
    } catch (error) {
      logger.error('Error fetching goals by status and period:', error);
      res.status(500).json({ error: 'Failed to fetch goals by status and period' });
    }
  }
};

module.exports = new DashboardController();