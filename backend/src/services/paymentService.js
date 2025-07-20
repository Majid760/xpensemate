import Payment from '../models/Payment.js';
import WalletService from './WalletService.js';

class PaymentService {
  /**
   * Creates a new payment for a user.
   * @param {ObjectId} userId - The user's ID.
   * @param {Object} data - Payment details.
   * @returns {Promise<Object>} The created payment document.
   */
  async createPayment(userId, data) {
    const payment = new Payment({ user_id: userId, ...data });
    await payment.save();
    return payment;
  }

  /**
   * Fetches paginated payments for a user, with optional filters.
   * @param {ObjectId} userId - The user's ID.
   * @param {Object} options - Pagination, date range, payment_type.
   * @returns {Promise<Object>} Object with payments array, total, page, totalPages.
   */
  async getPayments(userId, { page = 1, limit = 10, startDate, endDate, payment_type }) {
    const skip = (page - 1) * limit;
    const filter = { user_id: userId, is_deleted: false };
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (payment_type) {
      filter.payment_type = payment_type;
    }
    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    return { payments, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Fetches a single payment by ID for a user.
   * @param {ObjectId} userId - The user's ID.
   * @param {ObjectId} paymentId - The payment's ID.
   * @returns {Promise<Object>} The payment document.
   */
  async getPaymentById(userId, paymentId) {
    return Payment.findOne({ _id: paymentId, user_id: userId, is_deleted: false });
  }

  /**
   * Updates a payment's details.
   * @param {ObjectId} userId - The user's ID.
   * @param {ObjectId} paymentId - The payment's ID.
   * @param {Object} updateData - Fields to update.
   * @returns {Promise<Object>} The updated payment document.
   */
  async updatePayment(userId, paymentId, updateData) {
    return Payment.findOneAndUpdate(
      { _id: paymentId, user_id: userId, is_deleted: false },
      { ...updateData, updated_at: new Date() },
      { new: true, runValidators: true }
    );
  }

  /**
   * Soft-deletes a payment (marks as deleted).
   * @param {ObjectId} userId - The user's ID.
   * @param {ObjectId} paymentId - The payment's ID.
   * @returns {Promise<Object>} The deleted payment document.
   */
  async deletePayment(userId, paymentId) {
    return Payment.findOneAndUpdate(
      { _id: paymentId, user_id: userId, is_deleted: false },
      { is_deleted: true, updated_at: new Date() },
      { new: true }
    );
  }

  /**
   * Gets a monthly summary of payments for a user.
   * @param {ObjectId} userId - The user's ID.
   * @param {number} year - Year.
   * @returns {Promise<Array>} Array of monthly summaries.
   */
  async getMonthlySummary(userId, year) {
    return Payment.aggregate([
      {
        $match: {
          user_id: userId,
          date: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
          is_deleted: false
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          totalAmount: { $sum: '$amount' },
          payments: { $push: '$name' }
        },
      },
      { $sort: { '_id': 1 } },
    ]);
  }

  /**
   * Fetches all payments for a user within a date range.
   * @param {ObjectId} userId - The user's ID.
   * @param {string|Date} startDate - Start date.
   * @param {string|Date} endDate - End date.
   * @returns {Promise<Array>} Array of payments.
   */
  async getPaymentsByDateRange(userId, startDate, endDate) {
    return Payment.find({
      user_id: userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      is_deleted: false
    });
  }

  /**
   * Gets payment statistics for a user for a given period.
   * @param {ObjectId} userId - The user's ID.
   * @param {Object} options - { period: string, startDate?: string|Date, endDate?: string|Date }
   * @returns {Promise<Object>} Stats: totalAmount, avgPayment, totalPayments, walletBalance, startDate, endDate
   */
  async getStatsByPeriod(userId, { period, startDate, endDate }) {
    const ALLOWED_PERIODS = ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'];
    if (!ALLOWED_PERIODS.includes(period)) {
      throw new Error(`Invalid period. Must be one of: ${ALLOWED_PERIODS.join(', ')}`);
    }
    // Calculate date range
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    let rangeStart, rangeEnd;
    if (period === 'custom') {
      if (!startDate || !endDate) {
        throw new Error('Custom period requires both startDate and endDate');
      }
      rangeStart = new Date(startDate);
      rangeEnd = new Date(endDate);
    } else {
      rangeEnd = new Date(todayUTC);
      switch (period) {
        case 'weekly':
          rangeStart = new Date(todayUTC);
          rangeStart.setUTCDate(todayUTC.getUTCDate() - 6);
          break;
        case 'monthly':
          rangeStart = new Date(todayUTC);
          rangeStart.setUTCDate(todayUTC.getUTCDate() - 29);
          break;
        case 'quarterly':
          rangeStart = new Date(todayUTC);
          rangeStart.setUTCDate(todayUTC.getUTCDate() - 89);
          break;
        case 'yearly':
          rangeStart = new Date(todayUTC);
          rangeStart.setUTCDate(todayUTC.getUTCDate() - 364);
          break;
      }
    }
    // Query payments in range
    const payments = await Payment.find({
      user_id: userId,
      date: { $gte: rangeStart, $lte: rangeEnd },
      is_deleted: false
    });
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPayments = payments.length;
    const days = Math.max(1, Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1);
    const avgPayment = totalPayments > 0 ? totalAmount / totalPayments : 0;
    // Get wallet balance
    const wallet = await WalletService.getWalletByUserId(userId);
    const walletBalance = wallet ? wallet.balance : 0;

    // 1. Monthly Revenue Trend (for the year of rangeEnd)
    const year = rangeEnd.getFullYear();
    const monthlyTrendAgg = await Payment.aggregate([
      {
        $match: {
          user_id: userId,
          date: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
          },
          is_deleted: false
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const found = monthlyTrendAgg.find(r => r._id === i + 1);
      return { month: i + 1, totalAmount: found ? found.totalAmount : 0 };
    });

    // 2. Revenue Sources Breakdown (for the selected period)
    const sourcesAgg = await Payment.aggregate([
      {
        $match: {
          user_id: userId,
          date: { $gte: rangeStart, $lte: rangeEnd },
          is_deleted: false
        }
      },
      {
        $group: {
          _id: '$payment_type',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    const revenueSources = sourcesAgg.map(r => ({
      payment_type: r._id || 'Other',
      totalAmount: r.totalAmount
    }));

    return {
      period,
      startDate: rangeStart,
      endDate: rangeEnd,
      totalAmount,
      avgPayment,
      totalPayments,
      walletBalance,
      monthlyTrend,      // <--- for line chart
      revenueSources     // <--- for donut chart
    };
  }
}

export default new PaymentService(); 