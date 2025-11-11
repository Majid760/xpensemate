import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTransactionAt: {
    type: Date,
    default: new Date()
  },
  type: {
    type: String,
    enum: ['personal', 'business'],
    default: 'personal'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Keep created/updated in sync with createdAt/updatedAt
walletSchema.pre('save', function(next) {
  this.created = this.createdAt;
  this.updated = this.updatedAt;
  next();
});

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet; 