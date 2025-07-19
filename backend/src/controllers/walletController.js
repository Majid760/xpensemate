const Wallet = require('../models/Wallet');
const logger = require('../utils/logger');
const { validateObjectId } = require('../utils/validators');

const walletController = {
  /**
   * Handles HTTP request to create a new payment.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with the created payment or error.
   */
  createPayment: async (req, res) => {
    try {
      const { name, amount, date, payer, payment_type, custom_payment_type, notes } = req.body;
      
      const payment = new Wallet({
        user_id: req.user._id,
        name,
        amount,
        date,
        payer,
        payment_type,
        custom_payment_type,
        notes
      });
      await payment.save();
      res.status(201).json(payment);
    } catch (error) {
      logger.error('Error creating payment:', { error: error.message });
      res.status(500).json({ error: 'Failed to create payment' });
    }
  },

  /**
   * Handles HTTP request to fetch all payments for a user with pagination and filters.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with payments array, pagination info, or error.
   */
  getPayments: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = { user_id: req.user._id, is_deleted: false };

      // Add date range filter if provided
      if (req.query.startDate && req.query.endDate) {
        filter.date = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        };
      }

      // Add payment type filter if provided
      if (req.query.payment_type) {
        filter.payment_type = req.query.payment_type;
      }

      // Get total count for pagination
      const total = await Wallet.countDocuments(filter);

      // Get payments with pagination
      const payments = await Wallet.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        payments,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      logger.error('Error fetching payments:', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  },

  /**
   * Handles HTTP request to fetch a single payment by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with the payment or 404/error.
   */
  getPaymentById: async (req, res) => {
    try {
      const payment = await Wallet.findOne({
        _id: req.params.id,
        user_id: req.user._id,
        is_deleted: false
      });

      if (!payment) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      res.json(payment);
    } catch (error) {
      logger.error('Error fetching payment:', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch payment' });
    }
  },

  /**
   * Handles HTTP request to update a payment.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with the updated payment or error.
   */
  updatePayment: async (req, res) => {
    try {
      const { name, amount, date, payer, payment_type, custom_payment_type, notes } = req.body;

      const payment = await Wallet.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id, is_deleted: false },
        {
          name,
          amount,
          date,
          payer,
          payment_type,
          custom_payment_type,
          notes,
          updated_at: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!payment) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      res.json(payment);
    } catch (error) {
      logger.error('Error updating payment:', { error: error.message });
      res.status(500).json({ error: 'Failed to update payment' });
    }
  },

  /**
   * Handles HTTP request to delete (soft-delete) a payment.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with success message or error.
   */
  deletePayment: async (req, res) => {
    try {
      const payment = await Wallet.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id, is_deleted: false },
        { is_deleted: true, updated_at: new Date() },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      res.json({ message: 'Wallet deleted successfully' });
    } catch (error) {
      logger.error('Error deleting payment:', { error: error.message });
      res.status(500).json({ error: 'Failed to delete payment' });
    }
  },

  /**
   * Handles HTTP request to get a monthly payment summary.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with summary array or error.
   */
  getMonthlySummary: async (req, res) => {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();

      const summary = await Wallet.aggregate([
        {
          $match: {
            user_id: req.user._id,
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
        {
          $sort: { '_id': 1 },
        },
      ]);

      res.json(summary);
    } catch (error) {
      logger.error('Error fetching monthly summary:', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch monthly summary' });
    }
  },

  /**
   * Handles HTTP request to fetch payments by date range.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with payments array or error.
   */
  getPaymentsByDateRange: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const user_id = req.user._id;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const payments = await Wallet.find({
        user_id,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        is_deleted: false
      });

      res.json(payments);
    } catch (error) {
      logger.error('Error fetching payments by date range:', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch payments by date range!' });
    }
  }
};

module.exports = walletController; 