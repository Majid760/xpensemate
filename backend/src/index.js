require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./configs/db');
const logger = require('./utils/logger');
const appRoutes = require('./routes/appRoutes');
const passport = require('passport');
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [`${process.env.FRONTEND_URL}`],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['set-cookie']
}));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Log all requests
app.use((req, res, next) => {
  logger.info(`Mehtod is => ${req.method} \n Url is =>${req.url} \n`, {
    body: req.body,
    query: req.query,
    params: req.params,
    cookies: req.cookies
  });
  next();
});

// Routes
app.use('/api/v1', appRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    type: 'error',
    title: 'Server Error',
    message: 'An unexpected error occurred. Please try again.',
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 