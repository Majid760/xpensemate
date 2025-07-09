const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrateUserSchema() {
  try {
    // Check if MongoDB URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    // Update each user document
    for (const user of users) {
      // Create new document with required fields
      const updatedUser = {
        firstName: user.firstName || user.name?.split(' ')[0] || 'User',
        email: user.email,
        password: user.password,
        isVerified: user.isVerified || false,
        createdAt: user.createdAt || new Date(),
        updatedAt: new Date(),
        
        // Add all new fields with default values
        lastName: user.lastName || '',
        coverPhotoUrl: user.coverPhotoUrl || '',
        profilePhotoUrl: user.profilePhotoUrl || '',
        dob: user.dob || null,
        currency: user.currency || {
          value: 'USD',
          label: 'US Dollar',
          flag: '🇺🇸'
        },
        about: user.about || '',
        gender: user.gender || null,
        contactNumber: user.contactNumber || ''
      };

      // Update the user document
      await User.findByIdAndUpdate(user._id, updatedUser, { new: true });
      console.log(`Migrated user: ${user.email}`);
      console.log('Added fields:', {
        lastName: updatedUser.lastName,
        coverPhotoUrl: updatedUser.coverPhotoUrl,
        profilePhotoUrl: updatedUser.profilePhotoUrl,
        dob: updatedUser.dob,
        currency: updatedUser.currency,
        about: updatedUser.about,
        gender: updatedUser.gender,
        contactNumber: updatedUser.contactNumber
      });
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
migrateUserSchema(); 