import settingsService from '../services/settingsService.js';
import storageService from '../services/storageService.js';
import logger from '../utils/logger.js';
import authController from './authController.js';

class SettingsController {
  /**
   * Handles HTTP request to get the current user and profile completion.
   */
  async getUser(req, res) {
    try {
      const user = await authController.getUser(req, res);
      const profileCompletion = settingsService.calculateProfileCompletion(user);

      res.json({
        type: 'success',
        title: 'User settings fetched successfully',
        message: 'User settings fetched successfully',
        data: {
          ...user.toObject(),
          profileCompletion,
        }
      });
    } catch (error) {
      logger.error('Get user settings error', { error: error.message, stack: error.stack });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handles HTTP request to update user settings.
   */
  async updateUser(req, res) {
    try {
      logger.info('Updating user settings:', { userId: req.user._id, updateData: req.body });

      const updatedUser = await settingsService.updateUser(req.user._id, req.body);
      const profileCompletion = settingsService.calculateProfileCompletion(updatedUser);

      logger.info('User settings updated successfully:', { userId: req.user._id });

      res.json({
        type: 'success',
        title: 'User settings updated successfully',
        message: 'User settings updated successfully',
        data: {
          ...updatedUser.toObject(),
          profileCompletion,
        },
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
   */
  async uploadProfilePhoto(req, res) {
    try {
      // Better debugging - log what we actually receive
      console.log('Upload profile photo request:', {
        userId: req.user._id,
        fileExists: !!req.file,
        fileDetails: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : null
      });

      if (!req.file) {
        logger.error('No file uploaded in profile photo request', { userId: req.user._id });
        return res.status(400).json({ 
          error: 'No file uploaded. Please select a file to upload.' 
        });
      }

      logger.info('Starting profile photo upload:', { 
        userId: req.user._id,
        filename: req.file.originalname,
        size: req.file.size 
      });

      // Upload to Cloudinary using storage service
      const url = await storageService.uploadProfilePhoto(req.file);

      logger.info('Profile photo uploaded successfully:', { 
        userId: req.user._id, 
        url: url 
      });

      res.json({
        type: 'success',
        title: 'Profile photo uploaded successfully',
        message: 'Profile photo uploaded successfully',
        data: {
          url
        }
      });
    } catch (error) {
      logger.error('Upload profile photo error', {
        error: error.message,
        stack: error.stack,
        userId: req.user?._id,
        fileInfo: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : 'No file'
      });

      // Send more specific error message
      const errorMessage = error.message.includes('Cloudinary') 
        ? 'Failed to upload image to storage service. Please try again.'
        : error.message || 'Failed to upload profile photo';
        
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Handles HTTP request to upload a cover photo.
   */
  async uploadCoverPhoto(req, res) {
    try {
      // Better debugging
      console.log('Upload cover photo request:', {
        userId: req.user._id,
        fileExists: !!req.file,
        fileDetails: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : null
      });

      if (!req.file) {
        logger.error('No file uploaded in cover photo request', { userId: req.user._id });
        return res.status(400).json({ 
          error: 'No file uploaded. Please select a file to upload.' 
        });
      }

      logger.info('Starting cover photo upload:', { 
        userId: req.user._id,
        filename: req.file.originalname,
        size: req.file.size 
      });

      // Upload to Cloudinary using storage service
      const url = await storageService.uploadCoverPhoto(req.file);

      logger.info('Cover photo uploaded successfully:', { 
        userId: req.user._id, 
        url: url 
      });

      res.json({
        type: 'success',
        title: 'Cover photo uploaded successfully',
        message: 'Cover photo uploaded successfully',
        data: {
          url
        }
      });
    } catch (error) {
      logger.error('Upload cover photo error', {
        error: error.message,
        stack: error.stack,
        userId: req.user?._id,
        fileInfo: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : 'No file'
      });

      // Send more specific error message
      const errorMessage = error.message.includes('Cloudinary') 
        ? 'Failed to upload image to storage service. Please try again.'
        : error.message || 'Failed to upload cover photo';
        
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

export default new SettingsController();