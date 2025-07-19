import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    action: { 
        type: String, 
        enum: ['create', 'update', 'delete'], 
        required: true 
    },
    collection_name: { 
        type: String, 
        required: true 
    },
    document_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    changes: { 
        type: Object 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

// Index for faster queries
auditLogSchema.index({ user_id: 1, created_at: -1 });
auditLogSchema.index({ collection_name: 1, document_id: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog; 