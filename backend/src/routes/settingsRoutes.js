const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAuth } = require('../middleware/auth');
const storageService = require('../services/storageService');

// Get user settings
router.get('/get-user', requireAuth, settingsController.getUser);

// Update user settings
router.put('/update-user', requireAuth, settingsController.updateUser);

// Upload profile photo
router.post('/upload-profile', requireAuth, storageService.profileUpload.single('photo'), settingsController.uploadProfilePhoto);

// Upload cover photo
router.post('/upload-cover', requireAuth, storageService.coverUpload.single('photo'), settingsController.uploadCoverPhoto);

module.exports = router; 


