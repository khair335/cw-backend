const stripe = require('../config/stripe');

/**
 * Verify Stripe payment session
 * GET /api/verify-payment?session_id=xxx
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { session_id } = req.query;

    // Validate session_id parameter
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'session_id is required'
      });
    }

    console.log('Verifying payment for session:', session_id);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log('Session retrieved:', {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status
    });

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      // Extract product information
      // Get line items to see what was purchased
      const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
      
      let drinkName = 'Unknown Drink';
      let amount = 0;

      if (lineItems.data && lineItems.data.length > 0) {
        const item = lineItems.data[0];
        drinkName = item.description || item.price?.product?.name || 'Drink Package';
        amount = (item.amount_total / 100).toFixed(2); // Convert from cents to dollars/pounds
      }

      // Return success with drink information
      return res.json({
        success: true,
        paid: true,
        drink: drinkName,
        amount: parseFloat(amount),
        session_id: session.id,
        customer_email: session.customer_details?.email || null
      });
    } else {
      // Payment not completed
      return res.json({
        success: false,
        paid: false,
        payment_status: session.payment_status,
        error: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID'
      });
    }

    // Pass to error handler
    next(error);
  }
};

/**
 * Health check endpoint
 * GET /api/health
 */
const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Payment verification server is running',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  verifyPayment,
  healthCheck
};


