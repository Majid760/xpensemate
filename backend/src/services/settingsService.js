const User = require('../models/User');
const logger = require('../utils/logger');

class SettingsService {
  constructor() {
    this.requiredFields = ['firstName', 'email', 'password'];
    this.optionalFields = [
      'lastName',
      'coverPhotoUrl',
      'profilePhotoUrl',
      'dob',
      'currency',
      'about',
      'gender',
      'contactNumber'
    ];
  }

  async getUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Get user settings error in service:', { error: error.message, userId });
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      logger.info('Finding user for update:', { userId });
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create a copy of the update data
      const filteredUpdateData = { ...updateData };

      // Handle required fields
      this.requiredFields.forEach(field => {
        if (!updateData[field]) {
          // If required field is empty, keep the existing value
          filteredUpdateData[field] = user[field];
        }
      });

      // Handle optional fields
      this.optionalFields.forEach(field => {
        if (updateData[field] === '' || updateData[field] === null || updateData[field] === undefined) {
          // For empty optional fields, set to null or default value
          if (field === 'gender') {
            filteredUpdateData[field] = null;
          } else if (field === 'currency') {
            filteredUpdateData[field] = { value: '', label: '', flag: '' };
          } else {
            filteredUpdateData[field] = '';
          }
        }
      });

      logger.info('Filtered update data:', filteredUpdateData);

      // Update user with filtered data
      Object.assign(user, filteredUpdateData);

      logger.info('Saving updated user:', { userId });
      await user.save();
      
      logger.info('User settings updated successfully in service:', { userId });
      return user;
    } catch (error) {
      logger.error('Update user settings error in service:', { 
        error: error.message, 
        stack: error.stack,
        userId,
        updateData 
      });
      throw error;
    }
  }

  calculateProfileCompletion(user) {
    const totalFields = this.requiredFields.length + this.optionalFields.length;
    let completedFields = 0;

    // Check required fields
    this.requiredFields.forEach(field => {
      if (user[field]) completedFields++;
    });

    // Check optional fields
    this.optionalFields.forEach(field => {
      if (user[field]) {
        if (field === 'currency' && user[field].value) {
          completedFields++;
        } else {
          completedFields++;
        }
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  }
}

module.exports = new SettingsService(); 