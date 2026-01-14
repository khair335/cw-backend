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
 * Cancel/Refund Stripe payment session
 * GET /api/cancel-payment?session_id=xxx
 */
const cancelPayment = async (req, res, next) => {
  try {
    const { session_id } = req.query;

    // Validate session_id parameter
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'session_id is required'
      });
    }

    console.log('Cancelling payment for session:', session_id);

    // For testing: skip Stripe calls and simulate success
    console.log('TEST MODE: Simulating successful cancellation');
    return res.json({
      success: true,
      type: 'cancelled',
      message: 'Order has been cancelled successfully (TEST MODE)',
      session_id: session_id
    });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log('Session retrieved for cancellation:', {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status
    });

    // Check payment status and handle accordingly
    if (session.payment_status === 'paid') {
      // Payment was completed - issue a refund
      console.log('Payment was completed, issuing refund...');

      const refund = await stripe.refunds.create({
        payment_intent: session.payment_intent,
        reason: 'requested_by_customer'
      });

      console.log('Refund created:', refund.id);

      return res.json({
        success: true,
        type: 'refund',
        message: 'Payment has been refunded successfully',
        refund: {
          id: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status
        },
        session_id: session.id
      });

    } else if (session.status === 'open') {
      // Session is still open (not paid) - expire it
      console.log('Session is open, expiring session...');

      await stripe.checkout.sessions.expire(session_id);

      return res.json({
        success: true,
        type: 'cancelled',
        message: 'Order has been cancelled successfully',
        session_id: session.id
      });

    } else {
      // Session is already expired or in another state
      return res.json({
        success: true,
        type: 'already_cancelled',
        message: 'Order was already cancelled or expired',
        session_id: session.id,
        status: session.status
      });
    }

  } catch (error) {
    console.error('Error cancelling payment:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID or session not found'
      });
    }

    // Handle refund errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        error: 'Refund could not be processed'
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
  cancelPayment,
  healthCheck
};


