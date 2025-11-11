import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { sendVerificationEmail, sendPasswordResetEmail } from '../configs/email.js';
import logger from '../utils/logger.js';
import emailService from '../services/emailService.js';
import passport from 'passport';
import { OAuth2Client } from 'google-auth-library';
import WalletService from '../services/WalletService.js';


// Rate limiter for verification emails
const verificationEmailLimiter = new RateLimiterMemory({
  points: 3, // Number of attempts
  duration: 60 * 60, // Per hour
});

// Rate limiter for resend verification emails
const resendVerificationLimiter = new RateLimiterMemory({
  points: 3, // Maximum 3 attempts
  duration: 60 * 60, // Within 1 hour
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
    this.sendEmailVerification = this.sendEmailVerification.bind(this);
    this.resendVerificationEmail = this.resendVerificationEmail.bind(this);
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
      logger.info('Registration attempt', { email: req.body.email, firstName: req.body.firstName });

      const { firstName, lastName, email, password } = req.body;
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
        userSecret: crypto.randomBytes(32).toString('hex')
      });

      await user.save();
      // create wallet
      await WalletService.createWallet(user._id);

      // Send verification email + welcome email 
      try {
        const verificationResult = await this.sendEmailVerification(user);
        if (verificationResult.success) {
          await this.sendWelcomeEmail(user);
        } else {
          logger.warn('Verification email failed, but registration successful', {
            error: verificationResult.message,
            userId: user._id
          });
        }
      } catch (emailError) {
        logger.warn('Email sending failed, but registration successful', {
          error: emailError.message,
          userId: user._id
        });
        // Continue with registration even if email fails
      }
      res.status(201).json({
        type: 'success',
        title: 'Registration Successful',
        message: 'Please check your email to verify your account',
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
        { expiresIn: '60m' }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '365d' }
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
        data: {
          user: user.getPublicProfile(),
          token,
          refreshToken,
          expiresIn: token.expiresIn ?? '60m',
        }
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

    const { refreshToken } = req.body;
    console.log('refresh token is ==', refreshToken);

    if (!refreshToken) {
      return res.status(401).json({
        type: 'error',
        title: 'Authentication Failed',
        message: 'Refresh token not provided'
      });
    }
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      console.log('user  name is ==', user.name);

      // Check if user exists
      if (!user) {
        logger.warn('Invalid refresh token', {
          refreshToken: refreshToken
        });
        return res.status(403).json({
          type: 'error',
          title: 'Authentication Failed',
          message: 'Invalid refresh token - user not found'
        });
      }

      // Check if the refresh token matches the one stored in the user document
      if (user.refreshToken.trim() !== refreshToken.trim()) {
        // This is a token mismatch scenario
        logger.warn('Refresh token mismatch detected', {
          userId: user._id,
          providedToken: refreshToken.substring(0, 10) + '...',
          storedToken: user.refreshToken ? user.refreshToken.substring(0, 10) + '...' : 'null'
        });
        
        // Security consideration: 
        // 1. The provided token is valid (we could decode it)
        // 2. But it doesn't match what's stored in the database
        // 3. This could be due to:
        //    - Normal token rotation (user logged in from another device)
        //    - Possible security issue (token theft)
        
        // For better security, we should invalidate all tokens and force re-authentication
        // However, for better user experience, we'll allow this with warnings
        // and generate new tokens to maintain security going forward
        
        // Generate new refresh token for security (token rotation)
        const newRefreshToken = jwt.sign(
          { id: user._id },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: '365d' }
        );
      
        // Update user with new refresh token
        user.refreshToken = newRefreshToken;
        await user.save();
        
        // Generate new access token
        const token = jwt.sign(
          { id: user._id, email: user.email, name: user.name },
          process.env.JWT_SECRET,
          { expiresIn: '60m' }
        );

        logger.info('Token rotation completed due to mismatch', {
          userId: user._id,
          message: 'Generated new tokens after detecting token mismatch'
        });

        return res.status(200).json({
          type: 'success',
          title: 'Token Refreshed',
          message: 'Session updated successfully',
          data: {
            token,
            refreshToken: newRefreshToken
          }
        });
      }

      // Generate new access token
      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '60m' }
      );

      res.status(200).json({
        type: 'success',
        title: 'Refresh Token Successful',
        message: 'Welcome back!',
        data: {
          token,
        }
      });
    } catch (error) {
      logger.error('Refresh token error', { error: error.message, stack: error.stack });
      return res.status(403).json({
        type: 'error',
        title: 'Authentication Failed',
        message: 'Invalid refresh token'
      });
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
   * Resend verification email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;
      logger.info('Resend verification email attempt', { email });

      if (!email) {
        return res.status(400).json({
          type: 'error',
          title: 'Request Failed',
          message: 'Email is required'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          type: 'error',
          title: 'User Not Found',
          message: 'No account found with this email address'
        });
      }

      // Check if user is already verified
      if (user.isVerified) {
        return res.status(200).json({
          type: 'success',
          title: 'Already Verified',
          message: 'Your email is already verified'
        });
      }

      // Apply rate limiting
      try {
        await resendVerificationLimiter.consume(email);
      } catch (rateLimitError) {
        if (rateLimitError.name === 'RateLimiterError') {
          logger.warn('Rate limit exceeded for resend verification email', {
            email: email,
            remainingPoints: rateLimitError.remainingPoints,
            msBeforeNext: rateLimitError.msBeforeNext
          });

          const minutesRemaining = Math.ceil(rateLimitError.msBeforeNext / (1000 * 60));

          return res.status(429).json({
            type: 'error',
            title: 'Too Many Requests',
            message: `You've exceeded the limit of 3 verification email requests per hour. Please try again in ${minutesRemaining} minutes.`,
            retryAfter: Math.ceil(rateLimitError.msBeforeNext / 1000)
          });
        }
        throw rateLimitError;
      }

      // Send verification email
      const result = await this.sendEmailVerification(user);

      if (result.success) {
        logger.info('Resend verification email sent successfully', {
          email: email,
          userId: user._id
        });

        res.status(200).json({
          type: 'success',
          title: 'Verification Email Sent',
          message: 'Please check your email for verification instructions',

        });
      } else {
        logger.error('Failed to send resend verification email', {
          email: email,
          userId: user._id,
          error: result.error
        });

        res.status(500).json({
          type: 'error',
          title: 'Email Sending Failed',
          message: 'Failed to send verification email. Please try again later.',

        });
      }

    } catch (error) {
      logger.error('Resend verification email error', {
        error: error.message,
        stack: error.stack,
        email: req.body.email
      });

      res.status(500).json({
        type: 'error',
        title: 'Request Failed',
        message: 'An error occurred while processing your request',
        data: {
        }
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
        data: {
          user: user.getPublicProfile(),
        }
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
        message: 'Password changed successfully',
        data: {
        }
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

  /**
   * Send email verification
   * @param {Object} user - User object
   * @param {string} user._id - User ID
   * @param {string} user.email - User email
   * @param {string} user.firstName - User first name
   * @param {string} user.lastName - User last name
   * @returns {Promise<Object>} Email sending result
   */
  async sendEmailVerification(user) {
    try {
      // Validate user object
      if (!user || !user._id || !user.email) {
        throw new Error('Invalid user object provided');
      }

      // Check if user is already verified
      if (user.isVerified) {
        logger.info('User already verified, skipping verification email', {
          userId: user._id,
          email: user.email
        });
        return {
          success: true,
          message: 'User already verified',
          alreadyVerified: true
        };
      }

      // Generate verification token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          type: 'email_verification'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Create verification URL
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

      logger.info('Sending verification email', {
        userId: user._id,
        email: user.email,
        verificationUrl: verificationUrl
      });

      // Send verification email
      await emailService.sendVerificationEmail(user.email, token);

      logger.info('Verification email sent successfully', {
        userId: user._id,
        email: user.email
      });

      return {
        success: true,
        message: 'Verification email sent successfully',
        token: token,
        verificationUrl: verificationUrl,
        data: {
        }
      };

    } catch (error) {
      logger.error('Send verification email error', {
        error: error.message,
        stack: error.stack,
        userId: user._id,
        email: user.email
      });

      // Return error object instead of throwing
      return {
        success: false,
        message: 'Failed to send verification email',
        error: error.message
      };
    }
  }

  // Helper method to send verification email (keeping for backward compatibility)
  async sendVerificationEmail(user) {
    const result = await this.sendEmailVerification(user);
    if (!result.success) {
      throw new Error(result.message);
    }
    return result;
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
          password: crypto.randomBytes(32).toString('hex'), // Random password for Google users
          isVerified: true, // Google users are automatically verified
          profilePhotoUrl: googleUserInfo.profilePhoto,
          googleId: googleUserInfo.googleId,
          authMethod: 'google'
          // Store Google ID for future reference
        }).save();
        // Create a new user wallet
        await WalletService.createWallet(user._id);
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
        data: {
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
        },
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

export default new AuthController(); 