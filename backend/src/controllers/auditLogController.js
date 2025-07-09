const AuditLog = require('../models/AuditLog');
const { validateObjectId } = require('../utils/validators');
const { handleError } = require('../utils/errorHandler');


const auditLogController = {
  // Get all audit logs with pagination and filters
  getAuditLogs: async (req, res) => {
    try {
      const { page = 1, limit = 20, user_id, action, collection_name, startDate, endDate } = req.query;
      const query = {};

      // Apply filters if provided
      if (user_id) query.user_id = user_id;
      if (action) query.action = action;
      if (collection_name) query.collection_name = collection_name;
      if (startDate && endDate) {
        query.created_at = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const logs = await AuditLog.find(query)
        .populate('user_id', 'firstName lastName email')
        .sort({ created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const count = await AuditLog.countDocuments(query);

      res.json({
        logs,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalLogs: count
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get audit logs for a specific document
  getDocumentLogs: async (req, res) => {
    try {
      const { collection_name, document_id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!validateObjectId(document_id)) {
        return res.status(400).json({ error: 'Invalid document ID' });
      }

      const logs = await AuditLog.find({
        collection_name,
        document_id
      })
        .populate('user_id', 'firstName lastName email')
        .sort({ created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const count = await AuditLog.countDocuments({
        collection_name,
        document_id
      });

      res.json({
        logs,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalLogs: count
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get audit logs for a specific user
  getUserLogs: async (req, res) => {
    try {
      const { user_id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!validateObjectId(user_id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const logs = await AuditLog.find({ user_id })
        .populate('user_id', 'firstName lastName email')
        .sort({ created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const count = await AuditLog.countDocuments({ user_id });

      res.json({
        logs,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalLogs: count
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

module.exports = auditLogController; 