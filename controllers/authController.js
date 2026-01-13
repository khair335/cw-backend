const axios = require('axios');
const https = require('https');

/**
 * Login to ResDiary API and return authentication token
 * POST /api/auth
 */
const login = async (req, res, next) => {
  try {
    console.log('Starting backend login process...');

    // Get credentials from environment variables
    const username = process.env.RESDIARY_USERNAME;
    const password = process.env.RESDIARY_PASSWORD;

    // Log that credentials are configured (without exposing values)
    console.log('ResDiary credentials configured:', {
      hasUsername: !!username,
      hasPassword: !!password
    });

    if (!username || !password) {
      console.error('Missing ResDiary credentials in environment variables');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing API credentials'
      });
    }

    const credentials = {
      username: username,
      password: password
    };

    console.log('Making ResDiary authentication request...');

    // Make request to ResDiary API
    // Try with object (axios should handle JSON serialization)
    const response = await axios({
      method: 'POST',
      url: `${process.env.RESDIARY_API_BASE_URL}/api/Jwt/v2/Authenticate`,
      data: {
        username: username,
        password: password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // In case of SSL issues
      })
    });

    console.log('ResDiary authentication response received:', {
      status: response.status,
      hasToken: !!response.data?.Token,
      hasExpiry: !!response.data?.TokenExpiryUtc
    });

    if (!response.data?.Token) {
      console.error('Invalid ResDiary authentication response:', response.data);
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication response from ResDiary API'
      });
    }

    const { Token, TokenExpiryUtc } = response.data;

    // Return the token and expiry to the frontend
    res.json({
      success: true,
      token: Token,
      tokenExpiryUtc: TokenExpiryUtc
    });

    console.log('Successfully authenticated with ResDiary API via backend');
  } catch (error) {
    console.error('Backend login failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Handle different error types
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return res.status(400).json({
            success: false,
            error: 'Invalid credentials provided to ResDiary API'
          });
        case 401:
          return res.status(401).json({
            success: false,
            error: 'Authentication failed with ResDiary API'
          });
        case 403:
          return res.status(403).json({
            success: false,
            error: 'Access denied by ResDiary API'
          });
        case 404:
          return res.status(404).json({
            success: false,
            error: 'ResDiary API endpoint not found'
          });
        case 500:
          return res.status(502).json({
            success: false,
            error: 'ResDiary API server error'
          });
        default:
          return res.status(error.response.status).json({
            success: false,
            error: error.response.data?.message || 'Authentication failed with ResDiary API'
          });
      }
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to ResDiary API. Please check network connectivity.'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Network error during authentication'
      });
    }
  }
};

/**
 * Health check for auth service
 * GET /api/auth/health
 */
const authHealthCheck = (req, res) => {
  const hasCredentials = !!(process.env.RESDIARY_USERNAME && process.env.RESDIARY_PASSWORD);

  res.json({
    status: 'ok',
    message: 'Auth service is running',
    credentialsConfigured: hasCredentials,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  login,
  authHealthCheck
};