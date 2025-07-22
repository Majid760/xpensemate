import SupportTicket from '../models/SupportTicket.js';
import { validateObjectId } from '../utils/validators.js';
import { handleError } from '../utils/errorHandler.js';

const supportTicketController = {
  // Create a new support ticket
  createTicket: async (req, res) => {
    try {
      const { subject, message, priority } = req.body;
      const user_id = req.user._id;

      const ticket = new SupportTicket({
        user_id,
        subject,
        message,
        priority
      });

      await ticket.save();
      res.status(201).json(ticket);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get all tickets with filters and pagination
  getTickets: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, priority, assigned_to } = req.query;
      const query = { is_deleted: false };

      // Apply filters if provided
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (assigned_to) query.assigned_to = assigned_to;

      const tickets = await SupportTicket.find(query)
        .populate('user_id', 'firstName lastName email')
        .populate('assigned_to', 'firstName lastName email')
        .sort({ created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const count = await SupportTicket.countDocuments(query);

      res.json({
        tickets,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalTickets: count
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get a single ticket by ID
  getTicketById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await SupportTicket.findOne({ _id: id, is_deleted: false })
        .populate('user_id', 'firstName lastName email')
        .populate('assigned_to', 'firstName lastName email')
        .populate('responses.user_id', 'firstName lastName email');

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Update ticket status
  updateTicketStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!validateObjectId(id)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await SupportTicket.findOneAndUpdate(
        { _id: id, is_deleted: false },
        { $set: { status } },
        { new: true, runValidators: true }
      )
        .populate('user_id', 'firstName lastName email')
        .populate('assigned_to', 'firstName lastName email');

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Assign ticket to staff
  assignTicket: async (req, res) => {
    try {
      const { id } = req.params;
      const { assigned_to } = req.body;

      if (!validateObjectId(id) || !validateObjectId(assigned_to)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      const ticket = await SupportTicket.findOneAndUpdate(
        { _id: id, is_deleted: false },
        { $set: { assigned_to } },
        { new: true, runValidators: true }
      )
        .populate('user_id', 'firstName lastName email')
        .populate('assigned_to', 'firstName lastName email');

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Add response to ticket
  addResponse: async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const user_id = req.user._id;

      if (!validateObjectId(id)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await SupportTicket.findOneAndUpdate(
        { _id: id, is_deleted: false },
        {
          $push: {
            responses: {
              user_id,
              message
            }
          }
        },
        { new: true, runValidators: true }
      )
        .populate('user_id', 'firstName lastName email')
        .populate('assigned_to', 'firstName lastName email')
        .populate('responses.user_id', 'firstName lastName email');

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Delete ticket (soft delete)
  deleteTicket: async (req, res) => {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await SupportTicket.findOne({ _id: id, is_deleted: false });
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      await ticket.softDelete();
      res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      handleError(res, error);
    }
  }
};

export default supportTicketController; 