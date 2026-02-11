# Deployment Guide - GlobalEats

Complete guide for deploying GlobalEats to production using Vercel (frontend) and Render (backend + database).

## 📋 Prerequisites

- ✅ GitHub account with GlobalEats repository
- ✅ Vercel account (https://vercel.com)
- ✅ Render account (https://render.com)
- ✅ DBeaver installed (for database management)
- ✅ Required API keys:
  - Google Maps API Key
  - Razorpay Key ID & Secret
  - Gmail SMTP credentials (optional for emails)

---

## 🗂️ Architecture Overview

```
┌─────────────────┐
│  Vercel         │ Frontend (React + Vite)
│  (Frontend)     │ https://your-app.vercel.app
└────────┬────────┘
         │ API Calls
         ↓
┌─────────────────┐
│  Render         │ Backend (Node.js + Express)
│  (Backend)      │ https://your-api.onrender.com
└────────┬────────┘
         │ SQL Queries
         ↓
┌─────────────────┐
│  Render         │ PostgreSQL Database
│  (Database)     │ Managed by Render
└─────────────────┘
```

---

## 🚀 Deployment Steps

### PHASE 1: Deploy Backend to Render

#### Step 1.1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   - **Name**: `globaleats-db`
   - **Database**: `globaleats`
   - **User**: (auto-generated)
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free (or Starter $7/month)
4. Click **"Create Database"**
5. ⏳ Wait ~2 minutes for provisioning
6. **Save the connection details**:
   - Internal Database URL (for Render services)
   - External Database URL (for DBeaver)

#### Step 1.2: Create Web Service (Backend)

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `GlobalEats2`
3. Configure service:
   - **Name**: `globaleats-api`
   - **Region**: Same as database (Oregon)
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter $7/month)

#### Step 1.3: Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add all these:

```env
# Required - Copy from database connection info
DATABASE_URL=<copy from Render PostgreSQL "Internal Database URL">

# Required - Generate a secure random string (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Required - Application settings
NODE_ENV=production
PORT=5000

# Required - Frontend URL (add after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app

# Required - Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=Global-Eats <your-email@gmail.com>

# Required - Payment gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Optional - Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Click **"Create Web Service"**
5. ⏳ Wait ~5-10 minutes for first deploy

#### Step 1.4: Verify Migrations (Automatic)

**Migrations run automatically** on every deployment - no Shell access needed!

1. Go to your service dashboard
2. Click **"Logs"** tab
3. Look for migration output:
   ```
   Running migrations...
   ✅ Migrations completed successfully
   🔗 Connecting to database using DATABASE_URL
   ✅ Database connection established successfully
   🚀 Server running on port 5000
   ```
4. If migrations fail, deployment will stop (server won't start)

#### Step 1.5: Test Backend

1. Copy your backend URL: `https://globaleats-api.onrender.com`
2. Test health endpoint:
   ```bash
   curl https://globaleats-api.onrender.com/health
   ```
3. Expected response:
   ```json
   {
     "status": "success",
     "message": "Server is running",
     "timestamp": "2026-02-11T..."
   }
   ```

---

### PHASE 2: Deploy Frontend to Vercel

#### Step 2.1: Create New Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `GlobalEats2`
4. Configure project:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

#### Step 2.2: Configure Environment Variables

Before deploying, add these environment variables:

```env
VITE_API_URL=https://globaleats-api.onrender.com/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Optional:

```env
VITE_APP_NAME=Global Eats
VITE_APP_VERSION=1.0.0
```

5. Click **"Deploy"**
6. ⏳ Wait ~2-3 minutes for build and deployment

#### Step 2.3: Copy Vercel URL

1. Once deployed, copy your Vercel URL: `https://your-app.vercel.app`
2. Go back to **Render backend** dashboard
3. Update environment variables:
   - `FRONTEND_URL` = `https://your-app.vercel.app`
   - `APP_URL` = `https://your-app.vercel.app`
4. Save and **redeploy** backend (to apply CORS changes)

---

### PHASE 3: Connect DBeaver to Database

#### Step 3.1: Get Database Connection String

1. Go to Render Dashboard → PostgreSQL database
2. Click **"Info"** tab
3. Find **"External Database URL"**:
   ```
   postgresql://user:password@host:5432/database
   ```

#### Step 3.2: Configure DBeaver

1. Open DBeaver
2. Click **"Database"** → **"New Database Connection"**
3. Select **"PostgreSQL"**
4. Fill in connection details (from External Database URL):
   - **Host**: `dpg-xxxxx.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `globaleats`
   - **Username**: `globaleats_user` (or whatever was generated)
   - **Password**: (copy from URL)
5. Click **"Test Connection"**
6. ✅ Should show "Connected"
7. Click **"Finish"**

#### Step 3.3: Verify Tables

1. Expand database → **"Schemas"** → **"public"** → **"Tables"**
2. You should see:
   - users
   - brands
   - outlets
   - menu_items
   - orders
   - order_items
   - addresses
   - payments
   - categories
   - outlet_brands
   - ratings
   - user_sessions
   - sequelize_meta

---

## ✅ Post-Deployment Verification

### Test Complete User Flow

1. **Frontend loads**: Visit `https://your-app.vercel.app`
2. **API connectivity**: Open browser console, check for CORS errors
3. **User registration**:
   - Click "Sign Up"
   - Register new account
   - Check DBeaver → `users` table for new entry
4. **Login**:
   - Login with registered account
   - Should receive JWT token (check localStorage)
5. **Browse outlets**:
   - View outlet listings
   - Check location services working
6. **Menu items**:
   - Click on outlet
   - View menu items by category
7. **Cart & Checkout**:
   - Add items to cart
   - Proceed to checkout
   - Test Razorpay (use test card in test mode)
8. **Order history**:
   - View profile → Orders tab
   - Should show completed order
   - Check DBeaver → `orders` table

---

## 🔧 Environment Variables Checklist

### Backend (Render) - 13 Variables Required

- [ ] `DATABASE_URL` (from Render PostgreSQL)
- [ ] `JWT_SECRET` (generate random 32+ char string)
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `FRONTEND_URL` (Vercel URL)
- [ ] `APP_URL` (Vercel URL)
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `SMTP_FROM`
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `GOOGLE_MAPS_API_KEY` (optional)

### Frontend (Vercel) - 2 Variables Required

- [ ] `VITE_API_URL` (Render backend URL + `/api`)
- [ ] `VITE_GOOGLE_MAPS_API_KEY`
- [ ] `VITE_RAZORPAY_KEY_ID` (optional)

---

## 🐛 Troubleshooting

### Issue: "CORS Error" in Browser Console

**Cause**: Backend not allowing frontend origin

**Solution**:

1. Verify `FRONTEND_URL` in Render backend matches Vercel URL exactly
2. Redeploy backend after updating env vars
3. Check Render logs for CORS errors

### Issue: "Cannot connect to database"

**Cause**: DATABASE_URL incorrectly formatted or SSL issue

**Solution**:

1. Verify `DATABASE_URL` is the "Internal Database URL" from Render
2. Check database is in "Available" status
3. Review backend logs in Render dashboard

### Issue: "Unauthorized" or JWT errors

**Cause**: JWT_SECRET mismatch or missing

**Solution**:

1. Ensure `JWT_SECRET` is set in Render
2. Must be same secret for all backend instances
3. Clear browser localStorage and login again

### Issue: Images not showing after upload

**Cause**: File storage is ephemeral on Render free tier

**Solution**:

- Expected behavior (mentioned in plan)
- Files are lost on restart/redeploy
- Upgrade to Render Starter + Persistent Disk or integrate S3/Cloudinary

### Issue: "Cold start" - First request takes 50+ seconds

**Cause**: Render free tier spins down after 15 minutes of inactivity

**Solution**:

- Expected behavior on free tier
- Upgrade to Render Starter ($7/month) for always-on
- Or implement a keep-alive ping service

### Issue: Database "Too many connections"

**Cause**: Connection pool exhausted

**Solution**:

1. Check connection pool settings in `database.js`
2. Reduce `max` pool size to 5 for free tier
3. Ensure connections are properly closed

---

## 📊 Monitoring & Logs

### Backend Logs (Render)

1. Go to Render Dashboard → Your web service
2. Click **"Logs"** tab
3. Monitor for:
   - Database connection errors
   - CORS errors
   - API endpoint errors
   - 500 Internal Server errors

### Frontend Logs (Vercel)

1. Go to Vercel Dashboard → Your project
2. Click **"Deployments"** → Select deployment → **"Functions"** tab
3. Or check browser console for client-side errors

### Database Queries (DBeaver)

Query recent orders:

```sql
SELECT o.id, o.order_number, o.status, o.total_amount, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 10;
```

Query active users:

```sql
SELECT COUNT(*) as total_users,
       COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users
FROM users;
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] DATABASE_URL uses SSL (automatic on Render)
- [ ] CORS only allows your Vercel frontend
- [ ] Environment variables never committed to Git
- [ ] Razorpay keys are in test mode initially
- [ ] SMTP password is an "App Password" (not account password)
- [ ] Rate limiting enabled (already configured)
- [ ] Helmet security headers enabled (already configured)

---

## 💰 Cost Breakdown

### Free Tier (90 days)

| Service           | Plan  | Cost         | Limits                                 |
| ----------------- | ----- | ------------ | -------------------------------------- |
| Vercel            | Hobby | **Free**     | Unlimited bandwidth, 100 GB-hrs        |
| Render Backend    | Free  | **Free**     | 750 hrs/month, spins down after 15 min |
| Render PostgreSQL | Free  | **Free**     | 1GB storage, 90 days then expires      |
| **Total**         |       | **$0/month** | Good for testing/MVP                   |

### Production Tier

| Service           | Plan    | Cost          | Benefits                    |
| ----------------- | ------- | ------------- | --------------------------- |
| Vercel            | Pro     | $20/month     | Custom domains, analytics   |
| Render Backend    | Starter | $7/month      | Always on, faster           |
| Render PostgreSQL | Starter | $7/month      | No expiration, 10GB storage |
| **Total**         |         | **$34/month** | Production-ready            |

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (optional):
   - Vercel: Add custom domain in project settings
   - Update `FRONTEND_URL` in Render backend
2. **Database Backups**:
   - Render Starter plan includes daily backups
   - Or export manually using DBeaver

3. **Monitoring**:
   - Set up error tracking (Sentry)
   - Enable Vercel Analytics
   - Monitor Render service health

4. **Performance**:
   - Enable Vercel Edge caching
   - Optimize images and assets
   - Monitor Render response times

5. **Feature Additions**:
   - Implement cloud storage (S3/Cloudinary) for uploads
   - Add search functionality
   - Integrate real-time order tracking
   - Add admin analytics dashboard

---

## 📞 Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **DBeaver Guide**: https://dbeaver.com/docs/
- **GitHub Repository**: https://github.com/Itskartike/GlobalEats2

---

**Deployment Date**: February 11, 2026  
**Version**: 1.0.0  
**Status**: Ready for Production ✅
