import express from 'express';
const router = express.Router();
import settingsController from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';
import storageService from '../services/storageService.js';

// Get user settings
router.get('/get-user', requireAuth, settingsController.getUser);

// Update user settings
router.put('/update-user', requireAuth, settingsController.updateUser);

// Upload profile photo
router.post('/upload-profile', requireAuth, storageService.profileUpload.single('photo'), settingsController.uploadProfilePhoto);

// Upload cover photo
router.post('/upload-cover', requireAuth, storageService.coverUpload.single('photo'), settingsController.uploadCoverPhoto);

export default router; 


