const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: true,
        trim: true,
        minlength: [2, 'Payment name must be at least 2 characters long'],
        maxlength: [100, 'Payment name cannot exceed 100 characters']
    },
    amount: { 
        type: Number, 
        required: true,
        min: [0, 'Amount cannot be negative'],
        validate: {
            validator: function(value) {
                return value > 0;
            },
            message: 'Amount must be greater than 0'
        }
    },
    date: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: 'Payment date cannot be in the future'
        }
    },
    payer: {
        type: String,
        required: [true, 'Payer is required'],
        trim: true,
        minlength: [2, 'Payer name must be at least 2 characters long'],
        maxlength: [100, 'Payer name cannot exceed 100 characters']
    },
    payment_type: {
        type: String,
        enum: [
            'salary',
            'subscription',
            'one_time',
            'installment',
            'advance',
            'bonus',
            'commission',
            'donation',
            'refund',
            'reimbursement',
            'penalty',
            'tax',
            'royalty',
            'loan_repayment',
            'custom',
            'other'
        ],
        default: 'one_time'
    },
    custom_payment_type: {
        type: String,
        trim: true,
        validate: {
            validator: function(value) {
                // Only require custom_payment_type if payment_type is 'custom'
                return this.payment_type !== 'custom' || (value && value.trim().length > 0);
            },
            message: 'Custom payment type is required when payment type is custom'
        }
    },
    notes: { 
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
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
walletSchema.index({ user_id: 1, date: -1 });

// Static method to get monthly payment summary
walletSchema.statics.getMonthlySummary = async function(userId, year, month) {
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
                _id: '$payment_type',
                total: { $sum: '$amount' }
            }
        }
    ]);
};

// Instance method to soft delete
walletSchema.methods.softDelete = async function() {
    this.is_deleted = true;
    return this.save();
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet; 