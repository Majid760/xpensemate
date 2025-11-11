import Wallet from '../models/Wallet.js';

class WalletService {
  async createWallet(userId, data = {}) {
    const wallet = new Wallet({ userId, ...data });
    await wallet.save();
    return wallet;
  }

  async getWalletByUserId(userId) {
    let wallet = await Wallet.findOne({ userId, isActive: true });
    if (!wallet){
      wallet = await this.createWallet(userId);
    }
    return wallet;
  }

  async updateWallet(userId, updateData) {
    return Wallet.findOneAndUpdate(
      { userId, isActive: true },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  async deleteWallet(userId) {
    return Wallet.findOneAndUpdate(
      { userId, isActive: true },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
  }

  async incrementBalance(userId, amount) {
    return Wallet.findOneAndUpdate(
      { userId, isActive: true },
      { $inc: { balance: amount }, lastTransactionAt: new Date() },
      { new: true }
    );
  }

  async decrementBalance(userId, amount) {
    return Wallet.findOneAndUpdate(
      { userId, isActive: true },
      { $inc: { balance: -Math.abs(amount) }, lastTransactionAt: new Date() },
      { new: true }
    );
  }
}

export default new WalletService();