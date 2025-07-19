import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    subject: { 
        type: String, 
        required: true,
        trim: true,
        minlength: [5, 'Subject must be at least 5 characters long'],
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: { 
        type: String, 
        required: true,
        trim: true,
        minlength: [10, 'Message must be at least 10 characters long'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: { 
        type: String, 
        enum: ['open', 'in_progress', 'resolved', 'closed'], 
        default: 'open' 
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    responses: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        created_at: {
            type: Date,
            default: Date.now
        }
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
supportTicketSchema.index({ user_id: 1, created_at: -1 });
supportTicketSchema.index({ status: 1, priority: 1 });
supportTicketSchema.index({ assigned_to: 1, status: 1 });

// Pre-save middleware to update updated_at
supportTicketSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket; 