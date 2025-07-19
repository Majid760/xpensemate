import PaymentService from '../services/PaymentService.js';
import WalletService from '../services/WalletService.js';
import logger from '../utils/logger.js';
const { validateObjectId } = require('../utils/validators');

const paymentController = {
  /**
   * Handles HTTP request to create a new payment.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with the created payment or error.
   */
  createPayment: async (req, res) => {
    try {
      const payment = await PaymentService.createPayment(req.user._id, req.body);
      let wallet = await WalletService.getWalletByUserId(req.user._id);
      if (!wallet) {
        wallet = await WalletService.createWallet(req.user._id, { balance: payment.amount });
      } else {
        wallet = await WalletService.incrementBalance(req.user._id, payment.amount);
      }
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
      const { startDate, endDate, payment_type } = req.query;
      const result = await PaymentService.getPayments(req.user._id, { page, limit, startDate, endDate, payment_type });
      res.json({
        payments: result.payments,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
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
      const payment = await PaymentService.getPaymentById(req.user._id, req.params.id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
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
      const payment = await PaymentService.updatePayment(req.user._id, req.params.id, req.body);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
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
      const payment = await PaymentService.deletePayment(req.user._id, req.params.id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json({ message: 'Payment deleted successfully' });
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
      const summary = await PaymentService.getMonthlySummary(req.user._id, year);
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
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }
      const payments = await PaymentService.getPaymentsByDateRange(req.user._id, startDate, endDate);
      res.json(payments);
    } catch (error) {
      logger.error('Error fetching payments by date range:', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch payments by date range!' });
    }
  }
};

export default paymentController; 