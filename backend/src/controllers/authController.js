const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../configs/email');
const logger = require('../utils/logger')
const emailService = require('../services/emailService');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');


// Rate limiter for verification emails
const verificationEmailLimiter = new RateLimiterMemory({
  points: 3, // Number of attempts
  duration: 60 * 60, // Per hour
});
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


class AuthController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.getUser = this.getUser.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.sendWelcomeEmail = this.sendWelcomeEmail.bind(this);
    this.googleOAuth = this.googleOAuth.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      logger.info('Registration attempt', { email: req.body.email, firstName:req.body.firstName });

      const { firstName,lastName, email, password } = req.body;
      const name = `${firstName} ${lastName}`;
    
      // Validate input
      if (!name || !email || !password) {
        logger.warn('Registration failed - missing fields', { email });
        return res.status(400).json({
          type: 'error',
          title: 'Registration Failed',
          message: 'Please provide all required fields'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.warn('Registration failed - user exists', { email });
        return res.status(400).json({
          type: 'error',
          title: 'Registration Failed',
          message: 'Email already registered'
        });
      }

      // Create new user
      const user = new User({
        name,
        firstName,
        lastName,
        email,
        password,
        userSecret: require('crypto').randomBytes(32).toString('hex')
      });

      await user.save();

      // Send verification email + welcome email 
      await this.sendVerificationEmail(user);
      await this.sendWelcomeEmail(user);

      res.status(201).json({
        type: 'success',
        title: 'Registration Successful',
        message: 'Please check your email to verify your account'
      });
    } catch (error) {
      logger.error('Registration error', { error: error.message, stack: error.stack });
      res.status(500).json({
        type: 'error',
        title: 'Registration Failed',
        message: 'An error occurred during registration'
      });
    }
  }


   /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
   async login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({
            type: 'error',
            title: 'Login Failed',
            message: 'Please provide email and password'
          });
        }

        const user = await User.findOne({ email });
        if (!user) {
          return res.status(401).json({
            type: 'error',
            title: 'Login Failed',
            message: 'Invalid email or password'
          });
        }

        if (!user.isVerified) {        
          try {
            await verificationEmailLimiter.consume(email);
            await this.sendVerificationEmail(user);
            return res.status(401).json({
              type: 'error',
              title: 'Email Not Verified',
              message: 'Please verify your email before logging in. A new verification email has been sent.'
            });
          } catch (error) {
            if (error.name === 'RateLimiterError') {
              return res.status(429).json({
                type: 'error',
                title: 'Too Many Requests',
                message: 'Too many verification email requests. Please try again later.'
              });
            }
            
            return res.status(401).json({
              type: 'error',
              title: 'Email Not Verified',
              message: 'Please verify your email before logging in.'
            });
          }
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({
            type: 'error',
            title: 'Login Failed',
            message: 'Invalid email or password'
          });
        }

      // Generate token
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '1m' }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
      });

      res.status(200).json({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back!',
        user: user.getPublicProfile(), 
        token,
        refreshToken,
      });
    } catch (error) {
      logger.error('Login error', { error: error.message, stack: error.stack });
      res.status(500).json({
        type: 'error',
        title: 'Login Failed',
        message: 'An error occurred during login'
      });
    }
  }

  async refreshToken(req, res) {
    const { token: refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const accessToken = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({ accessToken });
    } catch (error) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  }

  /**
   * Verify email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      logger.info('Email verification attempt', { token });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        logger.warn('Email verification failed - user not found', { token });
        return res.status(400).json({
          type: 'error',
          title: 'Verification Failed',
          message: 'Invalid verification token'
        });
      }

      if (user.isVerified) {
        logger.info('Email already verified', { userId: user._id });
        return res.status(200).json({
          type: 'success',
          title: 'Already Verified',
          message: 'Email is already verified'
        });
      }

      user.isVerified = true;
      await user.save();

      logger.info('Email verified successfully', { userId: user._id });
      res.status(200).json({
        type: 'success',
        title: 'Verification Successful',
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error('Email verification error', { error: error.message, stack: error.stack });
      res.status(400).json({
        type: 'error',
        title: 'Verification Failed',
        message: 'Invalid or expired verification token'
      });
    }
  }

  /**
   * Forgot password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          type: 'error',
          title: 'Request Failed',
          message: 'No account found with this email.',
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken);

      res.json({
        type: 'success',
        title: 'Reset Email Sent',
        message: 'Please check your email for password reset instructions.',
      });
    } catch (error) {
      logger.error('Password reset request failed', {
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        type: 'error',
        title: 'Request Failed',
        message: 'Failed to process password reset request.',
      });
    }
  }

  /**
   * Reset password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Update user password
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({
          type: 'error',
          title: 'Reset Failed',
          message: 'User not found.',
        });
      }

      user.password = password;
      await user.save();

      res.json({
        type: 'success',
        title: 'Password Reset',
        message: 'Your password has been reset successfully.',
      });
    } catch (error) {
      logger.error('Password reset failed', {
        error: error.message,
        stack: error.stack,
      });

      res.status(400).json({
        type: 'error',
        title: 'Reset Failed',
        message: 'Invalid or expired reset link.',
      });
    }
  }

  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUser(req, res) {
    try {
      const userId = req.user._id; // Use _id since req.user is the full user object
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          type: 'error',
          title: 'Not Found',
          message: 'User not found'
        });
      }
      res.status(200).json({
        type: 'success',
        title: 'Profile Retrieved',
        message: 'Profile retrieved successfully',
        user: user.getPublicProfile()
      });
    } catch (error) {
      logger.error('Get profile error', { error: error.message, stack: error.stack });
      res.status(500).json({
        type: 'error',
        title: 'Profile Error',
        message: 'Failed to retrieve profile'
      });
    }
  }
 

  /**
   * Change password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          type: 'error',
          title: 'Not Found',
          message: 'User not found'
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          type: 'error',
          title: 'Invalid Password',
          message: 'Current password is incorrect'
        });
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({
        type: 'success',
        title: 'Password Changed',
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error', { error: error.message, stack: error.stack });
      res.status(500).json({
        type: 'error',
        title: 'Change Failed',
        message: 'Failed to change password'
      });
    }
  }

  // Helper method to send verification email
  async sendVerificationEmail(user) {
    try {
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
      
      await emailService.sendVerificationEmail(user.email,token);

      logger.info('Verification email sent', { userId: user._id });
    } catch (error) {
      logger.error('Send verification email error', { 
        error: error.message, 
        stack: error.stack,
        userId: user._id 
      });
      throw error;
    }
  }

  // Helper method to send welcome email
  async sendWelcomeEmail(user) {
    try {
      // Ensure we have both email and name
      if (!user.email) {
        throw new Error('Email is required');
      }

      // Use firstName and lastName if name is not available
      const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (!name) {
        throw new Error('Name is required');
      }

      logger.info('Sending welcome email', { 
        email: user.email,
        name: name,
        userId: user._id 
      });

      await emailService.sendWelcomeEmail(user.email, name);
      logger.info('Welcome email sent', { userId: user._id });
    } catch (error) {
      logger.error('Send welcome email error', { 
        error: error.message, 
        stack: error.stack,
        userId: user._id 
      });
      throw error;
    }
  }


   /**
   * Handle Google OAuth with JWT token from @react-oauth/google
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
   async googleOAuth(req, res) {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ 
          success: false, 
          message: 'No credential provided' 
        });
      }
      // Verify the Google JWT token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      // Extract user information from Google payload
      const googleUserInfo = {
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        fullName: payload.name,
        profilePhoto: payload.picture,
        emailVerified: payload.email_verified
      };
      logger.info('Google OAuth - Token verified', { email: googleUserInfo.email });
      // Check if user already exists
      let existingUser = await User.findOne({ email: googleUserInfo.email });

      let user;
      if (existingUser) {
        // Update existing user's profile photo only if they don't have one
        if (!existingUser.profilePhotoUrl && googleUserInfo.profilePhoto) {
          existingUser.profilePhotoUrl = googleUserInfo.profilePhoto;
          await existingUser.save();
        }
        user = existingUser;
        logger.info('Google OAuth - Existing user found', { userId: user._id });
      } else {
        // Create new user
        user = await new User({
          firstName: googleUserInfo.firstName,
          lastName: googleUserInfo.lastName,
          email: googleUserInfo.email,
          password: require('crypto').randomBytes(32).toString('hex'), // Random password for Google users
          isVerified: true, // Google users are automatically verified
          profilePhotoUrl: googleUserInfo.profilePhoto,
          googleId: googleUserInfo.googleId ,
          authMethod: 'google'
          // Store Google ID for future reference
        }).save();
      }
      // Generate JWT token for your application
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save(); 

      logger.info('Google OAuth successful', { userId: user._id });
      // Send response with user data and token
      res.status(201).json({
        type: 'success',
        title: 'Google authentication successful',
        message: 'Welcome back!',
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          profilePhoto: user.profilePhotoUrl,
          isVerified: user.isVerified
        }
      });

    } catch (error) {
      logger.error('Google OAuth error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(401).json({ 
        success: false,
        message: 'Google authentication failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Authentication failed'
      });
    }
  }
}

module.exports = new AuthController(); 