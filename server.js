require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;


// CORS configuration - must be before other middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api', paymentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Booking Widget API Server',
    version: '1.0.0',
   
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Booking Widget API Server Started');
  console.log('='.repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔐 ResDiary Auth: ${process.env.RESDIARY_USERNAME && process.env.RESDIARY_PASSWORD ? 'Configured ✓' : 'NOT CONFIGURED ✗'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured ✓' : 'NOT CONFIGURED ✗'}`);
  console.log('='.repeat(50));
  console.log('\nAvailable endpoints:');
  console.log(`  POST /api/auth - Authenticate with ResDiary API`);
  console.log(`  GET  /api/auth/health - Auth service health check`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  GET  /api/verify-payment?session_id=xxx - Verify payment`);
  console.log('='.repeat(50));
});

module.exports = app;


