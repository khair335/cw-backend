require('dotenv').config();
const Stripe = require('stripe');

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;


