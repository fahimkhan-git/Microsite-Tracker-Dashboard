# 🚀 Render Deployment - Step by Step Guide

## Pre-Deployment Checklist

✅ Repository pushed to GitHub: `khanfahim2025/Microsite-Tracker-Dashboard`  
✅ `.env` files protected (not in Git)  
✅ Health check endpoint added (`/health`)  
✅ Render config file ready (`render.yaml`)

---

## Step-by-Step Render Setup

### Step 1: Create Render Account

1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (recommended)
   - Or use email
4. Verify your email if required

---

### Step 2: Create Web Service

1. In Render Dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect GitHub"** (or connect your account)
4. If prompted, authorize Render to access your GitHub repos

---

### Step 3: Connect Repository

1. Search for: `Microsite-Tracker-Dashboard`
2. Click on **`khanfahim2025/Microsite-Tracker-Dashboard`**
3. Render will detect it's a Node.js project

---

### Step 4: Configure Service Settings

**Service Details:**
- **Name:** `microsite-tracker-backend` (or any name you prefer)
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main`
- **Root Directory:** `/` (leave empty or `/`)

**Build & Deploy:**
- **Environment:** `Node` (should auto-detect)
- **Build Command:** 
  ```
  npm install && npx prisma generate
  ```
- **Start Command:**
  ```
  npm start
  ```

**Instance Type:**
- **Plan:** Select **"Free"** ✅

**Advanced Settings (Optional):**
- Health Check Path: `/health`
- Auto-Deploy: ✅ **Yes** (deploy on every push to `main`)

---

### Step 5: Add Environment Variables

⚠️ **CRITICAL:** Add these in Render Dashboard → Environment section

Click **"Add Environment Variable"** for each:

1. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

2. **IS_LOCAL**
   - Key: `IS_LOCAL`
   - Value: `false`

3. **USE_TEMP_STORAGE**
   - Key: `USE_TEMP_STORAGE`
   - Value: `false` ⚠️ **Must be false for production!**

4. **DATABASE_URL** ⚠️ **IMPORTANT**
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:password@db.supabase.co:5432/postgres`
   - ⚠️ **Use your PRODUCTION Supabase URL here**
   - ⚠️ **NEVER commit this to Git!**

5. **PORT** (Optional - Render sets this automatically)
   - Key: `PORT`
   - Value: `3001` (or leave Render's default)

6. **CLIENT_URL** (Optional)
   - Key: `CLIENT_URL`
   - Value: `https://your-frontend-domain.com` (if you have separate frontend)

---

### Step 6: Deploy!

1. Click **"Create Web Service"** (bottom of page)
2. Render will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Generate Prisma client (`npx prisma generate`)
   - Build your application
   - Start the server (`npm start`)
3. Wait **3-5 minutes** for first deployment
4. Watch the build logs (they'll appear on screen)

---

### Step 7: Get Your Backend URL

Once deployment completes:
1. You'll see your service dashboard
2. Look for **"Your Service URL"** at the top
3. It will be like: `https://microsite-tracker-backend.onrender.com`
4. **Copy this URL** - you'll need it!

---

### Step 8: Test Your Deployment

1. **Health Check:**
   ```
   https://your-service-name.onrender.com/health
   ```
   Should return: `{"status":"ok",...}`

2. **Root Endpoint:**
   ```
   https://your-service-name.onrender.com/
   ```
   Should return API info

3. **Track Endpoint (test):**
   ```
   https://your-service-name.onrender.com/tracking.js
   ```
   Should return the tracking script

---

### Step 9: Update Your Microsites

Update the tracking script in all your microsites:

**Old (Railway):**
```html
<script src="https://web-production-19751.up.railway.app/tracking.js"></script>
```

**New (Render):**
```html
<script>
  window.LiveAnalyticsConfig = {
    apiUrl: 'https://your-service-name.onrender.com/api',
    domain: 'your-microsite-domain.com'
  };
</script>
<script src="https://your-service-name.onrender.com/tracking.js"></script>
```

---

### Step 10: Update Frontend (if separate)

If your frontend is separate, update API URL:

```env
REACT_APP_API_URL=https://your-service-name.onrender.com/api
```

---

## 🎉 You're Done!

Your backend is now live on Render and will:
- ✅ Auto-deploy on every push to `main`
- ✅ Run 24/7 (with free tier sleep after inactivity)
- ✅ Store data permanently in Supabase
- ✅ Handle real-time tracking from all microsites

---

## Troubleshooting

### Issue: "Build Failed"

**Check build logs:**
- Go to Render dashboard → Your service → Logs
- Look for error messages
- Common issues:
  - `DATABASE_URL` not set → Add environment variable
  - Prisma error → Check `npx prisma generate` ran
  - Port conflict → Remove `PORT` env var (Render auto-assigns)

### Issue: "App Crashes After Deploy"

1. **Check Logs:** Render Dashboard → Your Service → Logs
2. **Common causes:**
   - Missing `DATABASE_URL` → Add it!
   - `USE_TEMP_STORAGE=false` not set → Add environment variable
   - Database connection failed → Check Supabase URL is correct

### Issue: "First Request Takes 30 Seconds"

- **This is normal for free tier!**
- Render free tier sleeps after 15 min inactivity
- First request wakes it up (takes ~30 seconds)
- Subsequent requests are fast
- **Solution:** Upgrade to paid plan for always-on

### Issue: "WebSocket Not Working"

- Check Render supports WebSockets: ✅ Yes
- Verify `WS_PORT` matches main port (or remove it)
- Check CORS settings in `server.js`

---

## Free Tier Limitations

- ⚠️ **Sleeps after 15 minutes** of no activity
- ⚠️ **Wake-up time:** ~30 seconds for first request
- ✅ **Solution:** Requests wake it automatically
- ✅ **Alternative:** Use Fly.io for always-on free tier

---

## Updating After Code Changes

### Auto-Deploy (Recommended):
1. Push changes to GitHub `main` branch
2. Render automatically detects changes
3. Auto-deploys in ~3 minutes
4. ✅ No manual steps needed!

### Manual Deploy:
1. Go to Render Dashboard
2. Your Service → **"Manual Deploy"**
3. Select branch: `main`
4. Click **"Deploy"**

---

## Monitor Your Service

**Render Dashboard shows:**
- ✅ Service status (Live/Sleeping)
- ✅ Recent deployments
- ✅ Real-time logs
- ✅ Resource usage
- ✅ Environment variables
- ✅ Custom domain (upgrade for this)

---

## Need More Help?

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Check your Render dashboard logs for errors
- Review `DEPLOYMENT.md` in repository

---

## Cost

**Current:** $0/month (Free Tier)  
**If exceeded:** Render will notify you before charging

**Upgrade Options:**
- **Starter:** $7/month (always-on, faster)
- **Professional:** $25/month (more resources)

---

## Success Checklist

After deployment, verify:
- [ ] Service shows "Live" status
- [ ] `/health` endpoint returns 200
- [ ] `/tracking.js` loads correctly
- [ ] Can track visits/leads from microsites
- [ ] Data persists in Supabase (not temporary)
- [ ] Auto-deploy enabled for future updates

✅ **All done! Your backend is live!** 🚀

