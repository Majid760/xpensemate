import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: {
      values: ['expense', 'budget_goal', 'payment'],
      message: 'Type must be either expense, budget_goal, or payment'
    },
    required: [true, 'Category type is required']
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters long'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  icon: {
    type: String,
    default: 'default-icon'
  },
  color: {
    type: String,
    default: '#000000',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
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

// Index for faster queries
categorySchema.index({ type: 1, name: 1 }, { unique: true });

// Pre-save middleware to ensure name is unique within the same type
categorySchema.pre('save', async function(next) {
  try {
    const existingCategory = await this.constructor.findOne({
      type: this.type,
      name: this.name,
      _id: { $ne: this._id }
    });

    if (existingCategory) {
      throw new Error('Category name must be unique within the same type');
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find active categories
categorySchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Instance method to deactivate category
categorySchema.methods.deactivate = async function() {
  this.isActive = false;
  return this.save();
};

const Category = mongoose.model('Category', categorySchema);

export default Category; 