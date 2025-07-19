import Payment from '../models/Payment.js';

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
}

export default new PaymentService(); 