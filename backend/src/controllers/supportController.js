const emailService = require('../services/emailService');
const logger = require('../utils/logger');

class SupportController {
  /**
   * Submit a support request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async submitSupportRequest(req, res) {
    try {
      const { reportName, reportDetails } = req.body;
      logger.info(`thi is ${reportName} and this is detail ${reportDetails}`);
      
      // Check if user is authenticated
      if (!req.user) {
        logger.warn('Support request failed - user not authenticated');
        return res.status(401).json({
          type: 'error',
          title: 'Authentication Required',
          message: 'Please log in to submit a support request'
        });
      }

      const { email, name } = req.user;

      // Validate input
      if (!reportName || !reportDetails) {
        logger.warn('Support request failed - missing fields', { 
          hasName: !!reportName, 
          hasDetails: !!reportDetails 
        });
        return res.status(400).json({
          type: 'error',
          title: 'Validation Error',
          message: 'Report name and details are required.'
        });
      }

      // Send support email
      await emailService.sendSupportEmail({
        from: email,
        fromName: name,
        subject: reportName,
        message: reportDetails
      });

      logger.info('Support request submitted', {
        user: email,
        subject: reportName
      });

      res.json({
        type: 'success',
        title: 'Request Submitted',
        message: 'Your support request has been submitted successfully.'
      });
    } catch (error) {
      logger.error('Support request failed', {
        error: error.message,
        stack: error.stack,
        user: req.user?.email
      });

      res.status(500).json({
        type: 'error',
        title: 'Request Failed',
        message: 'Failed to submit support request. Please try again.'
      });
    }
  }
}

module.exports = new SupportController(); 