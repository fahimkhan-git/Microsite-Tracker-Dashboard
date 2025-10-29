# 🚀 Quick Deploy Guide (Free Options)

Since Railway has limits, here are **FREE alternatives** with step-by-step setup:

---

## ⭐ Option 1: Render.com (RECOMMENDED - Best Free Tier)

### Why Render?
- ✅ **750 hours/month FREE** (enough for 24/7)
- ✅ PostgreSQL database included free
- ✅ Auto-deploy from GitHub
- ✅ WebSocket support
- ✅ Similar to Railway (easy transition)

### 5-Minute Setup:

1. **Go to**: https://render.com
2. **Sign up** with your GitHub account
3. **Click**: "New +" → "Web Service"
4. **Connect Repository**: Select `khanfahim2025/Microsite-Tracker-Dashboard`
5. **Configure Settings:**
   ```
   Name: microsite-tracker-backend
   Environment: Node
   Region: (choose closest)
   Branch: main
   Root Directory: / (root)
   Build Command: npm install && npx prisma generate
   Start Command: npm start
   Instance Type: Free
   ```

6. **Add Environment Variables** (in Render dashboard):
   ```
   NODE_ENV = production
   IS_LOCAL = false
   USE_TEMP_STORAGE = false
   DATABASE_URL = <your-supabase-production-url> ⚠️ NEVER commit this!
   PORT = 3001
   CLIENT_URL = https://your-frontend-domain.com
   ```

7. **Click "Create Web Service"**
8. **Wait 3-5 minutes** for deployment
9. **Get your URL**: `https://your-app.onrender.com`

### ⚠️ Free Tier Note:
- App sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (wake-up time)
- Subsequent requests are fast

**Total Cost: $0/month** ✅

---

## 🥈 Option 2: Fly.io (Always-On Free)

### Why Fly.io?
- ✅ Always-on (doesn't sleep)
- ✅ 3 free VMs (256MB each)
- ✅ WebSocket support
- ✅ PostgreSQL available

### Setup Steps:

1. **Install Fly CLI:**
```bash
# macOS
brew install flyctl

# Or download from: https://fly.io/docs/hands-on/install-flyctl/
```

2. **Login:**
```bash
fly auth login
```

3. **In your project:**
```bash
cd "/Volumes/homesfy workspace/new-dash"
fly launch
```
   - Follow prompts
   - Select region (closest to you)
   - Don't deploy database (use Supabase instead)

4. **Set Secrets:**
```bash
fly secrets set NODE_ENV=production
fly secrets set IS_LOCAL=false
fly secrets set USE_TEMP_STORAGE=false
fly secrets set DATABASE_URL="<your-supabase-url>" # ⚠️ Never commit!
fly secrets set PORT=3001
```

5. **Deploy:**
```bash
fly deploy
```

6. **Get URL:**
```bash
fly open
```

**Total Cost: $0/month** ✅ (if within free tier limits)

---

## 🥉 Option 3: Cyclic.sh (Simple Auto-Deploy)

### Setup:

1. **Go to**: https://www.cyclic.sh
2. **Sign up** with GitHub
3. **New App** → Connect `khanfahim2025/Microsite-Tracker-Dashboard`
4. **Configure:**
   - Root: `/`
   - Build: `npm install && npx prisma generate`
   - Start: `npm start`
   - Port: `3001`

5. **Environment Variables** (same as Render)
6. **Deploy**

**Total Cost: $0/month** ✅

---

## Comparison

| Feature | Render | Fly.io | Cyclic |
|---------|--------|--------|--------|
| **Free Tier** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Always-On** | ⚠️ Sleeps | ✅ Yes | ✅ Yes |
| **Setup Time** | 5 min | 10 min | 5 min |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **WebSocket** | ✅ | ✅ | ✅ |
| **Best For** | Most users | Always-on needs | Simple setup |

---

## ✅ Recommended: Render.com

**Reasons:**
1. Easiest setup (5 minutes)
2. Best free tier
3. PostgreSQL included
4. Auto-deploy from GitHub
5. Similar to Railway

**Setup Time:** 5 minutes  
**Monthly Cost:** $0  
**Free Tier:** 750 hours/month (enough for 24/7)

---

## After Deployment

### 1. Get Your Backend URL:
- Render: `https://your-app.onrender.com`
- Fly.io: `https://your-app.fly.dev`
- Cyclic: `https://your-app.cyclic.app`

### 2. Update Tracking Script:
In each microsite, update the script URL:
```html
<script>
  window.LiveAnalyticsConfig = {
    apiUrl: 'https://your-backend-url.onrender.com/api',
    domain: 'your-microsite-domain.com'
  };
</script>
<script src="https://your-backend-url.onrender.com/tracking.js"></script>
```

### 3. Update Frontend (if separate):
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

---

## Testing Deployment

### 1. Check Health Endpoint:
```bash
curl https://your-backend-url.onrender.com/health
```
Should return: `{"status":"ok",...}`

### 2. Check Root Endpoint:
```bash
curl https://your-backend-url.onrender.com/
```
Should return API info

### 3. Test in Browser:
Visit: `https://your-backend-url.onrender.com/health`

---

## Troubleshooting

### Issue: "App is sleeping"
- **Render**: Normal for free tier, wakes on first request
- **Solution**: Use Fly.io for always-on

### Issue: "Database connection error"
- Check `DATABASE_URL` in hosting platform
- Verify Supabase project is active
- Check firewall/network settings

### Issue: "Build failed"
- Check build logs in hosting dashboard
- Verify `package.json` scripts are correct
- Ensure Prisma generates client

---

## Cost Summary

| Platform | Free Tier | Paid After |
|----------|-----------|------------|
| **Render** | 750 hrs/mo | If exceeded |
| **Fly.io** | 3 VMs free | If exceeded |
| **Cyclic** | Generous free | Paid plans available |

**Recommendation:** Start with **Render** (easiest), switch to **Fly.io** if you need always-on.

---

## Need Help?

- Render Docs: https://render.com/docs
- Fly.io Docs: https://fly.io/docs
- Check deployment logs in platform dashboard

