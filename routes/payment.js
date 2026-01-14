const express = require('express');
const router = express.Router();
const { verifyPayment, cancelPayment, healthCheck } = require('../controllers/paymentController');

/**
 * Payment Routes
 */

// Verify payment session
// GET /api/verify-payment?session_id=xxx
router.get('/verify-payment', verifyPayment);

// Cancel payment session
// GET /api/cancel-payment?session_id=xxx
router.get('/cancel-payment', cancelPayment);

// Health check
// GET /api/health
router.get('/health', healthCheck);

module.exports = router;


