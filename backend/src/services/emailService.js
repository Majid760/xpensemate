const nodemailer = require('nodemailer');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { validateEmail } = require('../utils/validators');
const logger = require('../utils/logger');

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  points: 5, // Number of points
  duration: 60 * 60, // Per hour
});

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize SMTP transporter
   */
  initializeTransporter() {
    try {
      const smtpConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        },
        debug: process.env.NODE_ENV === 'development',
      };

      logger.info('Initializing SMTP transporter', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
      });

      this.transporter = nodemailer.createTransport(smtpConfig);
    } catch (error) {
      logger.error('Failed to initialize SMTP transporter', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // 

  /**
   * Send support email
   * @param {Object} options - Email options
   * @param {string} options.from - Sender email
   * @param {string} options.fromName - Sender name
   * @param {string} options.subject - Email subject
   * @param {string} options.message - Email message
   * @returns {Promise<Object>} Send result
   */
  async sendSupportEmail({ from, fromName, subject, message }) {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      const mailOptions = {
        from: `"${fromName}" <${from}>`,
        to: process.env.SUPPORT_EMAIL,
        subject: `[Support] ${subject}`,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Support Request</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 20px;">
                <h3 style="color: #4CAF50; margin-top: 0;">From:</h3>
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
                  ${fromName} (${from})
                </p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4CAF50; margin-top: 0;">Subject:</h3>
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
                  ${subject}
                </p>
              </div>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #4CAF50; margin-top: 0;">Message:</h3>
                <p style="color: #666; font-size: 16px; line-height: 1.6; white-space: pre-wrap; margin: 0;">
                  ${message}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${from}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Reply to User
                </a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ExpenseMate. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      logger.info('Sending support email', {
        from,
        to: process.env.SUPPORT_EMAIL,
        subject,
      });

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Support email sent successfully', {
        messageId: info.messageId,
        from,
        to: process.env.SUPPORT_EMAIL,
      });
      return info;
    } catch (error) {
      logger.error('Failed to send support email', {
        error: error.message,
        code: error.code
      });
      throw error;
    }
  }

  /**
   * Send verification email
   * @param {string} email - Recipient email
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Send result
   */
  async sendVerificationEmail(email, token) {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      if (!email || !token) {
        throw new Error('Email and token are required');
      }

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
      logger.info('Preparing verification email', { 
        to: email,
        verificationUrl,
        frontendUrl: process.env.FRONTEND_URL
      });

      const mailOptions = {
        from: `"ExpenseMate" <${process.env.SUPPORT_EMAIL}>`,
        to: email,
        subject: 'Verify Your Email - ExpenseMate',
        text: `Please verify your email by clicking the following link: ${verificationUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Welcome to ExpenseMate!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 18px; font-weight: 600;">
                Verify Email
              </a>
              </div>
              <p style="color: #666; font-size: 14px;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not create an account, please ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ExpenseMate. All rights reserved.</p>
            </div>
          </div>
        `
      };

      logger.info('Sending verification email', { 
        to: email,
        from: process.env.SUPPORT_EMAIL
      });

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Verification email sent successfully', {
        messageId: info.messageId,
        to: email,
        response: info.response
      });
      return info;
    } catch (error) {
      logger.error('Failed to send verification email', {
        error: error.message,
        code: error.code,
      });
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} token - Reset token
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(email, token) {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      const mailOptions = {
        from: `"ExpenseMate" <${process.env.SUPPORT_EMAIL}>`,
        to: email,
        subject: 'Reset Your Password - ExpenseMate',
        text: `Please reset your password by clicking the following link: ${resetUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f6fa; padding: 32px 0;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; padding: 24px 0; text-align: center; margin-bottom: 32px;">
                <h1 style="color: #fff; font-size: 2.2rem; margin: 0; font-weight: 700; letter-spacing: 1px;">Reset Your Password</h1>
              </div>
              <div style="background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 36px 32px 32px 32px;">
                <h2 style="margin-top: 0; color: #222; font-size: 1.4rem; font-weight: 600;">Hello,</h2>
                <p style="color: #444; font-size: 1.08rem; line-height: 1.6; margin-bottom: 28px;">We received a request to reset your ExpenseMate password. Click the button below to set a new password. If you did not request this, you can safely ignore this email.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); color: #fff; padding: 14px 36px; border-radius: 6px; text-decoration: none; font-size: 1.1rem; font-weight: 600; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
              </div>
              <div style="text-align: center; color: #b4b4b4; font-size: 0.95rem; margin-top: 24px;">© ${new Date().getFullYear()} ExpenseMate. All rights reserved.</div>
            </div>
          </div>
        `,
      };

      logger.info('Sending password reset email', { to: email });
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Password reset email sent successfully', {
        messageId: info.messageId,
        to: email,
      });

      return info;
    } catch (error) {
      logger.error('Failed to send password reset email', {
        error: error.message,
        code: error.code,
      });
      throw error;
    }
  }

  /**
   * Send welcome email
   * @param {string} email - Recipient email
   * @param {string} name - Recipient name
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail(email, name) {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }
      const mailOptions = {
        from: `"ExpenseMate" <${process.env.SUPPORT_EMAIL}>`,
        to: email,
        subject: 'Welcome to ExpenseMate! 🎉',
        text: `Welcome to ExpenseMate, ${name}! We're excited to have you on board.`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f6fa; padding: 32px 0;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="background: #43b04a; border-radius: 12px; padding: 24px 0; text-align: center; margin-bottom: 32px;">
                <h1 style="color: #fff; font-size: 2.2rem; margin: 0; font-weight: 700; letter-spacing: 1px;">Welcome to ExpenseMate! 🎉</h1>
            </div>
              <div style="background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 36px 32px 32px 32px;">
                <h2 style="margin-top: 0; color: #222; font-size: 1.4rem; font-weight: 600;">Hello ${name},</h2>
                <p style="color: #444; font-size: 1.08rem; line-height: 1.6; margin-bottom: 28px;">We're thrilled to welcome you to the ExpenseMate family! 🎊 Your journey to better financial management starts now.</p>
                <div style="background: #f5f7fa; border-radius: 10px; padding: 20px 24px; margin-bottom: 28px;">
                  <h3 style="color: #43b04a; font-size: 1.1rem; margin: 0 0 10px 0; font-weight: 700;">What's Next?</h3>
                  <ul style="color: #444; font-size: 1rem; margin: 0; padding-left: 18px;">
                  <li>Complete your profile setup</li>
                  <li>Add your first expense</li>
                  <li>Set up your budget goals</li>
                  <li>Explore our features</li>
                </ul>
              </div>
                <p style="color: #444; font-size: 1.08rem; line-height: 1.6; margin-bottom: 32px;">We're here to help you every step of the way. If you have any questions, our support team is just a click away.</p>
                <div style="text-align: center; margin-bottom: 32px;">
                  <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #43b04a; color: #fff; padding: 14px 36px; border-radius: 6px; text-decoration: none; font-size: 1.1rem; font-weight: 600; display: inline-block;">Get Started</a>
                </div>
                <p style="color: #b4b4b4; font-size: 1rem; text-align: center; margin: 0;">Thank you for choosing ExpenseMate for your financial journey!</p>
              </div>
              <div style="text-align: center; color: #b4b4b4; font-size: 0.95rem; margin-top: 24px;">© ${new Date().getFullYear()} ExpenseMate. All rights reserved.</div>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      logger.error('Failed to send welcome email', {
        error: error.message,
        code: error.code,
      });
      throw error;
    }
  }


  
  async validateAndSanitizeInput(reportName, reportDetails, userEmail) {
    // Input validation
    if (!reportName || typeof reportName !== 'string' || reportName.length > 3) {
      throw new Error('Invalid report name');
    }

    if (!reportDetails || typeof reportDetails !== 'string' || reportDetails.length > 20) {
      throw new Error('Invalid report details');
    }

    if (!userEmail || !validateEmail(userEmail)) {
      throw new Error('Invalid email address');
    }

    // Sanitize inputs
    const sanitizedReportName = this.sanitizeInput(reportName);
    const sanitizedReportDetails = this.sanitizeInput(reportDetails);
    const sanitizedUserEmail = userEmail.toLowerCase().trim();

    return {
      reportName: sanitizedReportName,
      reportDetails: sanitizedReportDetails,
      userEmail: sanitizedUserEmail,
    };
  }

  sanitizeInput(input) {
    // Remove any potentially harmful characters
    return input
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  }

  async checkRateLimit(userEmail) {
    try {
      await rateLimiter.consume(userEmail);
      return true;
    } catch (error) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }
}

module.exports = new EmailService(); 