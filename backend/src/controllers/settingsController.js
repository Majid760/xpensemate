import settingsService from '../services/settingsService.js';
import storageService from '../services/storageService.js';
import logger from '../utils/logger.js';
import authController from './authController.js';

class SettingsController {
  /**
   * Handles HTTP request to get the current user and profile completion.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with user object and profile completion or error.
   */
  async getUser(req, res) {
    try {
      const user = await authController.getUser(req, res);
      const profileCompletion = settingsService.calculateProfileCompletion(user);
      
      res.json({
        ...user.toObject(),
        profileCompletion
      });
    } catch (error) {
      logger.error('Get user settings error', { error: error.message, stack: error.stack });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handles HTTP request to update user settings.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with updated user object and profile completion or error.
   */
  async updateUser(req, res) {
    try {
      logger.info('Updating user settings:', { userId: req.user._id, updateData: req.body });
      
      const updatedUser = await settingsService.updateUser(req.user._id, req.body);
      const profileCompletion = settingsService.calculateProfileCompletion(updatedUser);
      
      logger.info('User settings updated successfully:', { userId: req.user._id });
      
      res.json({
        ...updatedUser.toObject(),
        profileCompletion
      });
    } catch (error) {
      logger.error('Update user settings error', { 
        error: error.message, 
        stack: error.stack,
        userId: req.user._id,
        updateData: req.body 
      });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handles HTTP request to upload a profile photo.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with uploaded photo URL or error.
   */
  async uploadProfilePhoto(req, res) {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }

      logger.info('Uploading profile photo:', { userId: req.user._id });
      
      // Upload to Cloudinary using storage service
      const url = await storageService.uploadProfilePhoto(req.file);
      
      logger.info('Profile photo uploaded successfully:', { userId: req.user._id, url });
      
      res.json({ url });
    } catch (error) {
      logger.error('Upload profile photo error', { 
        error: error.message, 
        stack: error.stack,
        userId: req.user._id 
      });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handles HTTP request to upload a cover photo.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void} Responds with uploaded cover photo URL or error.
   */
  async uploadCoverPhoto(req, res) {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }

      logger.info('Uploading cover photo:', { userId: req.user._id });
      
      // Upload to Cloudinary using storage service
      const url = await storageService.uploadCoverPhoto(req.file);
      
      logger.info('Cover photo uploaded successfully:', { userId: req.user._id, url });
      
      res.json({ url });
    } catch (error) {
      logger.error('Upload cover photo error', { 
        error: error.message, 
        stack: error.stack,
        userId: req.user._id 
      });
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SettingsController(); 