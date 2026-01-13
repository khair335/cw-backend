const express = require('express');
const router = express.Router();
const { login, authHealthCheck } = require('../controllers/authController');

/**
 * Auth Routes
 */

// Handle preflight OPTIONS request for auth endpoint
router.options('/auth', (req, res) => {
  res.status(200).end();
});

// Login to ResDiary API
// POST /api/auth
router.post('/auth', login);

// Auth health check
// GET /api/auth/health
router.get('/auth/health', authHealthCheck);

module.exports = router;