# Backend API Server

This is a standalone Express.js server for handling authentication with ResDiary API and verifying Stripe payment sessions.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Stripe Secret Key from https://dashboard.stripe.com/apikeys
   ```bash
   cp .env.example .env
   # Then edit .env and add your STRIPE_SECRET_KEY
   ```

3. **Start the server:**
   
   **Development mode (with auto-restart):**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

#### Login to ResDiary API
```
POST /api/auth
```
Authenticates with the ResDiary API and returns an access token.

**Request Body:** None (credentials configured server-side)

**Success Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpiryUtc": "2025-11-04T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Authentication failed with ResDiary API"
}
```

#### Auth Health Check
```
GET /api/auth/health
```
Returns authentication service status.

**Response:**
```json
{
  "status": "ok",
  "message": "Auth service is running",
  "credentialsConfigured": true,
  "timestamp": "2025-11-04T10:00:00.000Z"
}
```

### Health Check
```
GET /api/health
```
Returns server status.

**Response:**
```json
{
  "status": "ok",
  "message": "Payment verification server is running",
  "timestamp": "2025-11-04T10:00:00.000Z"
}
```

### Verify Payment
```
GET /api/verify-payment?session_id=cs_test_xxxxx
```
Verifies a Stripe checkout session.

**Parameters:**
- `session_id` (required) - Stripe checkout session ID

**Success Response:**
```json
{
  "success": true,
  "paid": true,
  "drink": "Premium Lager",
  "amount": 10.00,
  "session_id": "cs_test_xxxxx",
  "customer_email": "user@example.com"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid session ID"
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `RESDIARY_USERNAME` | ResDiary API username | `resdiaryapi@thecatandwickets.com` |
| `RESDIARY_PASSWORD` | ResDiary API password | `your_password_here` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_xxxxx` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Project Structure

```
backend/
├── config/
│   └── stripe.js           # Stripe configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   └── paymentController.js # Payment logic
├── middleware/
│   └── errorHandler.js     # Error handling
├── routes/
│   ├── auth.js             # Authentication routes
│   └── payment.js          # Payment API routes
├── .env                    # Environment variables (create from .env.example)
├── .env.example            # Environment template
├── package.json            # Dependencies
├── README.md               # This file
└── server.js               # Main server file
```

## Testing

Test the server is running:
```bash
curl http://localhost:5000/api/health
```

Test payment verification (use a real session_id from Stripe):
```bash
curl "http://localhost:5000/api/verify-payment?session_id=cs_test_xxxxx"
```

## Notes

- Make sure to use your **test** Stripe keys during development
- The server must be running for the frontend payment flow to work
- For production, deploy this to a hosting service (Heroku, Railway, DigitalOcean, etc.)


