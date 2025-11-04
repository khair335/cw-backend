# 🚀 Vercel Deployment Guide for Backend

This guide will help you deploy the backend payment verification server to Vercel.

---

## 📋 Prerequisites

- GitHub account with backend repository: https://github.com/khair335/cw-backend
- Vercel account (free): https://vercel.com/signup
- Stripe API keys (Test & Live)

---

## 🎯 Quick Deployment Steps

### Step 1: Connect to Vercel

1. **Go to Vercel**: https://vercel.com/
2. **Sign up or Log in** (use GitHub account for easy integration)
3. **Click "Add New..."** → **"Project"**
4. **Import Git Repository**:
   - Select **GitHub** 
   - Find and select: **`khair335/cw-backend`**
   - Click **"Import"**

---

### Step 2: Configure Project Settings

On the configuration screen:

#### **Framework Preset:**
- Select: **"Other"** (or leave as detected)

#### **Root Directory:**
- Leave as: **`.`** (root)

#### **Build Command:**
- Leave empty or use: `npm install`

#### **Output Directory:**
- Leave empty

#### **Install Command:**
- Auto-detected: `npm install`

---

### Step 3: Add Environment Variables

This is **CRITICAL** - add these environment variables:

Click **"Environment Variables"** and add:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_YOUR_KEY_HERE` | Get from Stripe Dashboard (Test) |
| `FRONTEND_URL` | `https://c-w-booking-widget.vercel.app` | Your frontend URL |
| `NODE_ENV` | `production` | Production mode |

⚠️ **How to get Stripe Secret Key:**
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **"Secret key"** (starts with `sk_test_`)
3. For production, use **Live Mode** key (starts with `sk_live_`)

**Screenshot of where to add:**
```
Environment Variables
┌──────────────────────────────────────────────┐
│ Key: STRIPE_SECRET_KEY                       │
│ Value: sk_test_YOUR_KEY_HERE                 │
│ [x] Production [x] Preview [x] Development   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Key: FRONTEND_URL                            │
│ Value: https://c-w-booking-widget.vercel.app │
│ [x] Production [x] Preview [x] Development   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Key: NODE_ENV                                │
│ Value: production                            │
│ [x] Production [x] Preview [x] Development   │
└──────────────────────────────────────────────┘
```

---

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment (1-2 minutes)
3. You'll get a URL like: `https://cw-backend.vercel.app`

---

## ✅ Verify Deployment

### Test 1: Health Check

Open in browser:
```
https://your-backend.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Payment verification server is running",
  "timestamp": "2025-11-04T..."
}
```

### Test 2: Root Endpoint

Open in browser:
```
https://your-backend.vercel.app/
```

**Expected Response:**
```json
{
  "message": "Booking Widget Payment Verification API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "verifyPayment": "/api/verify-payment?session_id=xxx"
  }
}
```

---

## 🔧 Update Frontend to Use Production Backend

### Step 1: Get Your Backend URL

From Vercel dashboard, copy your deployment URL:
```
https://cw-backend.vercel.app
```

### Step 2: Update Frontend Code

**Option A: Update PaymentSuccess.js directly**

Open: `/src/Pages/PaymentSuccess/PaymentSuccess.js`

Change line ~23 from:
```javascript
const response = await axios.get(
  `http://localhost:5000/api/verify-payment?session_id=${sessionId}`
);
```

To:
```javascript
const response = await axios.get(
  `https://cw-backend.vercel.app/api/verify-payment?session_id=${sessionId}`
);
```

**Option B: Use Environment Variable (Recommended)**

1. Create/Update frontend `.env`:
```env
REACT_APP_BACKEND_URL=https://cw-backend.vercel.app
```

2. Update `PaymentSuccess.js`:
```javascript
const response = await axios.get(
  `${process.env.REACT_APP_BACKEND_URL}/api/verify-payment?session_id=${sessionId}`
);
```

3. Add to Vercel environment variables for frontend deployment

---

## 🔄 Update Stripe Payment Links

Now that backend is deployed, update Stripe Payment Links:

### For Production (Live Mode):

1. **Switch to Live Mode** in Stripe Dashboard (toggle top-right)
2. **Go to Payment Links**
3. **Edit each payment link** (CW-BOOKING, Prosecco, etc.)
4. **Update URLs**:

**Success URL:**
```
https://c-w-booking-widget.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}
```

**Cancel URL:**
```
https://c-w-booking-widget.vercel.app/payment-cancelled
```

5. **Save changes**

### For Testing (Test Mode):

Keep test mode links pointing to:
```
http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}
```

---

## 🔐 Environment Variables Reference

### Production Environment Variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE

# Frontend URL (CORS)
FRONTEND_URL=https://c-w-booking-widget.vercel.app

# Environment
NODE_ENV=production
```

### Development Environment Variables:

```env
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Port (not needed for Vercel)
PORT=5000
```

---

## 🧪 Testing Production Deployment

### Full Flow Test:

1. **Go to your frontend**: `https://c-w-booking-widget.vercel.app`
2. **Make a booking** and select drink
3. **Pay with test card**: `4242 4242 4242 4242` (if in test mode)
4. **Verify redirect** to payment success page
5. **Check browser console** (F12):
   - Should see: "Verifying payment session: cs_test_..."
   - Should see: "Payment verification response: {success: true, ...}"
6. **Verify form data** restored with drink info

### Debug in Production:

**Check Vercel Logs:**
1. Go to Vercel Dashboard
2. Click on your **cw-backend** project
3. Go to **"Deployments"** tab
4. Click on latest deployment
5. Click **"Functions"** → **"Logs"**
6. See real-time logs

**Check Network Tab:**
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Make a test payment
4. Look for request to: `/api/verify-payment`
5. Check Response tab for errors

---

## 🚨 Troubleshooting

### Issue: "CORS Error"

**Problem**: Frontend can't reach backend

**Solution:**
1. Check `FRONTEND_URL` in Vercel environment variables
2. Make sure it matches exactly: `https://c-w-booking-widget.vercel.app`
3. Redeploy backend after changing env vars

---

### Issue: "Invalid Stripe Key"

**Problem**: Backend can't connect to Stripe

**Solution:**
1. Go to Vercel → Project Settings → Environment Variables
2. Check `STRIPE_SECRET_KEY` is correct
3. Make sure it starts with `sk_test_` (test) or `sk_live_` (live)
4. Redeploy after fixing

---

### Issue: "404 Not Found on /api/verify-payment"

**Problem**: Vercel routing not working

**Solution:**
1. Check `vercel.json` exists in backend root
2. Redeploy project
3. Check deployment logs for errors

---

### Issue: "Payment verification failed"

**Problem**: Session ID not valid or Stripe error

**Solution:**
1. Check Vercel function logs
2. Verify session_id is passed in URL
3. Check Stripe Dashboard → Logs for API errors
4. Make sure using same Stripe account (test/live mode)

---

## 📊 Vercel Project Settings

### Recommended Settings:

**General:**
- Framework: Other
- Node Version: 18.x (or latest)
- Build Command: `npm install`

**Domains:**
- Add custom domain if needed (optional)
- Example: `api.yourdomain.com`

**Git:**
- Production Branch: `main`
- Auto-deploy: ✓ Enabled

**Environment Variables:**
- Production: Use live Stripe keys
- Preview: Use test Stripe keys
- Development: Use test Stripe keys

---

## 🔄 Update Deployment

### When you make changes:

1. **Commit and push to GitHub:**
```bash
cd backend
git add .
git commit -m "Update backend code"
git push origin main
```

2. **Vercel auto-deploys** (if enabled)
3. **Or manually redeploy**:
   - Go to Vercel Dashboard
   - Click project
   - Go to Deployments
   - Click "⋯" → "Redeploy"

---

## 🌐 Custom Domain (Optional)

### To use custom domain:

1. **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. **Add Domain**: `api.yourdomain.com`
3. **Configure DNS** (in your domain provider):
   - Add CNAME record: `api` → `cw-backend.vercel.app`
4. **Wait for propagation** (5-60 minutes)
5. **Update frontend** to use: `https://api.yourdomain.com`

---

## 📝 Checklist

### Pre-Deployment:
- [x] Backend code in GitHub repository
- [x] `.env` file NOT in repository
- [x] `.env.example` exists as template
- [x] `vercel.json` configuration file created

### During Deployment:
- [ ] Connected GitHub repository to Vercel
- [ ] Added environment variables:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `FRONTEND_URL`
  - [ ] `NODE_ENV`
- [ ] Deployed successfully

### Post-Deployment:
- [ ] Tested `/api/health` endpoint
- [ ] Updated frontend with backend URL
- [ ] Updated Stripe Payment Links with production URLs
- [ ] Tested complete payment flow
- [ ] Verified in production with test payment

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Health check returns `{"status": "ok"}`
✅ Frontend can reach backend (no CORS errors)
✅ Payment verification works in production
✅ Stripe Payment Links redirect correctly
✅ Form data persists through payment flow
✅ Drink info added to Special Requests
✅ Complete booking works end-to-end

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Node.js**: https://vercel.com/docs/functions/serverless-functions/runtimes/node-js
- **Stripe API**: https://stripe.com/docs/api
- **Deployment Logs**: Vercel Dashboard → Project → Deployments → Logs

---

## 🔒 Security Notes

⚠️ **Never commit:**
- `.env` file
- Stripe secret keys
- API credentials

✅ **Always use:**
- Environment variables in Vercel
- Test keys for development
- Live keys only in production
- HTTPS in production

---

## 📈 Monitoring

### Check Backend Health:
```bash
# Quick health check
curl https://cw-backend.vercel.app/api/health
```

### Monitor in Vercel:
- **Dashboard** → Project → **Analytics**
- View request counts, errors, and performance
- Set up alerts for errors (optional)

---

## 🎯 Next Steps After Deployment

1. ✅ Test in production with real payment
2. ✅ Monitor Vercel logs for errors
3. ✅ Switch Stripe to Live Mode (when ready)
4. ✅ Update payment links with live keys
5. ✅ Monitor transactions in Stripe Dashboard

---

**Your backend is now live on Vercel! 🚀**

