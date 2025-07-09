const { body, validationResult } = require('express-validator');

const validateExpense = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Expense name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Expense name must be between 2 and 100 characters'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Expense date cannot be in the future');
      }
      return true;
    }),

  body('category_id')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('detail')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Detail cannot exceed 500 characters'),

  body('payment_method')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'])
    .withMessage('Invalid payment method'),

  body('recurring.is_recurring')
    .optional()
    .isBoolean()
    .withMessage('is_recurring must be a boolean'),

  body('recurring.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid recurring frequency'),

  body('recurring.end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateSupportTicket = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validatePayment = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Payment name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Payment name must be between 2 and 100 characters'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Payment date cannot be in the future');
      }
      return true;
    }),

  body('payer')
    .trim()
    .notEmpty()
    .withMessage('Payer is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Payer name must be between 2 and 100 characters'),

  body('payment_type')
    .notEmpty()
    .withMessage('Payment type is required')
    .isIn(['salary', 'subscription', 'one_time', 'installment', 'advance', 'bonus', 'commission', 'donation', 'refund', 'reimbursement', 'penalty', 'tax', 'royalty', 'loan_repayment', 'custom', 'other'])
    .withMessage('Invalid payment type'),

  body('custom_payment_type')
    .if(body('payment_type').equals('custom'))
    .trim()
    .notEmpty()
    .withMessage('Custom payment type is required when payment type is custom')
    .isLength({ min: 2, max: 100 })
    .withMessage('Custom payment type must be between 2 and 100 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateBudgetGoal = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Goal name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Goal name must be between 2 and 100 characters'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isString()
    .withMessage('Category must be a string'),

  body('detail')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Detail cannot exceed 500 characters'),

  body('status')
    .optional()
    .isIn(['active', 'achieved', 'failed','terminated','other'])
    .withMessage('Status must be either active, achieved, or failed'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),

  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateExpense,
  validateSupportTicket,
  validatePayment,
  validateBudgetGoal
}; 