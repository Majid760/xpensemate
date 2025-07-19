import WalletService from '../services/WalletService.js';
import logger from '../utils/logger.js';

const walletController = {
  // Create a wallet for a user
  async createWallet(req, res) {
    try {
      const wallet = await WalletService.createWallet(req.user._id, req.body);
      res.status(201).json(wallet);
    } catch (error) {
      logger.error('Error creating wallet:', error);
      res.status(500).json({ error: 'Failed to create wallet' });
    }
  },

  // Get the wallet for a user
  async getWallet(req, res) {
    try {
      const wallet = await WalletService.getWalletByUserId(req.user._id);
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
      res.json(wallet);
    } catch (error) {
      logger.error('Error fetching wallet:', error);
      res.status(500).json({ error: 'Failed to fetch wallet' });
    }
  },

  // Update the wallet for a user
  async updateWallet(req, res) {
    try {
      const wallet = await WalletService.updateWallet(req.user._id, req.body);
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
      res.json(wallet);
    } catch (error) {
      logger.error('Error updating wallet:', error);
      res.status(500).json({ error: 'Failed to update wallet' });
    }
  },

  // Soft delete the wallet for a user
  async deleteWallet(req, res) {
    try {
      const wallet = await WalletService.deleteWallet(req.user._id);
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
      res.json({ message: 'Wallet deleted successfully' });
    } catch (error) {
      logger.error('Error deleting wallet:', error);
      res.status(500).json({ error: 'Failed to delete wallet' });
    }
  },

  // Increment wallet balance (e.g. on payment)
  async incrementBalance(req, res) {
    try {
      const { amount } = req.body;
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
      let wallet = await WalletService.getWalletByUserId(req.user._id);
      if (!wallet) {
        // Create wallet if not exists
        wallet = await WalletService.createWallet(req.user._id, { balance: amount });
        return res.status(201).json(wallet);
      } else {
        wallet = await WalletService.incrementBalance(req.user._id, amount);
        return res.json(wallet);
      }
    } catch (error) {
      logger.error('Error incrementing wallet balance:', error);
      res.status(500).json({ error: 'Failed to increment wallet balance' });
    }
  },

  // Decrement wallet balance (e.g. on expense)
  async decrementBalance(req, res) {
    try {
      const { amount } = req.body;
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
      const wallet = await WalletService.decrementBalance(req.user._id, amount);
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
      res.json(wallet);
    } catch (error) {
      logger.error('Error decrementing wallet balance:', error);
      res.status(500).json({ error: 'Failed to decrement wallet balance' });
    }
  }
};

export default walletController; 