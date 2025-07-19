import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Expense name is required'],
    trim: true,
    minlength: [2, 'Expense name must be at least 2 characters long'],
    maxlength: [100, 'Expense name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Amount must be greater than 0'
    }
  },
  budget_goal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BudgetGoal',
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Expense date cannot be in the future'
    }
  },
  time: {
    type: String,
    required: false,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'],
    default: ''
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    default: ''
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false // Now optional if custom category is used
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  detail: {
    type: String,
    trim: true,
    maxlength: [500, 'Detail cannot exceed 500 characters']
  },
  payment_method: {
    type: String,
    enum: {
      values: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'],
      message: 'Invalid payment method'
    },
    default: 'cash'
  },
  recurring: {
    is_recurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    end_date: {
      type: Date
    }
  },
  attachments: [{
    url: String,
    type: String,
    name: String
  }],
  is_deleted: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for faster queries
expenseSchema.index({ user_id: 1, date: -1 });
expenseSchema.index({ user_id: 1, category_id: 1 });
expenseSchema.index({ user_id: 1, 'recurring.is_recurring': 1 });

// Pre-save middleware to validate category type
expenseSchema.pre('save', async function(next) {
  try {
    if (this.category_id) {
      const Category = mongoose.model('Category');
      const category = await Category.findById(this.category_id);
      if (!category) {
        throw new Error('Category not found');
      }
      // if (category.type !== 'expense') {
      //   throw new Error('Category must be of type expense');
      // }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Custom validation: require either category_id or custom category
expenseSchema.pre('validate', function(next) {
  if ( (!this.category || !this.category.trim())) {
    this.invalidate('category', 'Either a predefined or custom category is required');
  }
  next();
});

// Static method to find expenses by date range
expenseSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    user_id: userId,
    date: { $gte: startDate, $lte: endDate },
    is_deleted: false
  });
};

// Static method to get monthly summary
expenseSchema.statics.getMonthlySummary = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return this.aggregate([
    {
      $match: {
        user_id: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
        is_deleted: false
      }
    },
    {
      $group: {
        _id: '$category_id',
        total: { $sum: '$amount' }
      }
    }
  ]);
};

// Instance method to soft delete
expenseSchema.methods.softDelete = async function() {
  this.is_deleted = true;
  return this.save();
};

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense; 