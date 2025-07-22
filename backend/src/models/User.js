import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  coverPhotoUrl: {
    type: String,
    default: '',
  },
  profilePhotoUrl: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  dob: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow empty value
        const age = (new Date() - value) / (1000 * 60 * 60 * 24 * 365);
        return age >= 5 && age <= 100;
      },
      message: 'Age must be between 5 and 100 years'
    }
  },
  currency: {
    value: String,
    label: String,
    flag: String
  },
  about: {
    type: String,
    default: '',
    trim: true,
  },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other', null],
      message: 'Gender must be either Male, Female, or Other'
    },
    default: null
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  googleId: {
    type: String,
    sparse: true, // Allows null values but ensures uniqueness when present
    unique: true
  },
  // NEW: Track authentication method
  authMethod: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  refreshToken: {
    type: String,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
      return next();
    }

    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update updatedAt timestamp
    this.updatedAt = Date.now();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User; 