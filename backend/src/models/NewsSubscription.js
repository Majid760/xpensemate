import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema); 