# Free Hosting Options for Backend

Since Railway has usage limits, here are the best **FREE** alternatives:

---

## 🥇 Option 1: Render (Recommended - Best Free Tier)

**Free Tier Includes:**
- 750 hours/month free (enough for 24/7)
- PostgreSQL database included
- Automatic SSL
- Auto-deploy from GitHub
- WebSocket support ✅

### Setup Steps:

1. **Go to Render**: https://render.com
2. **Sign up** with GitHub
3. **New → Web Service**
4. **Connect Repository**: `khanfahim2025/Microsite-Tracker-Dashboard`
5. **Configure:**
   ```
   Name: microsite-tracker-backend
   Environment: Node
   Build Command: npm install && npx prisma generate
   Start Command: npm start
   Instance Type: Free
   ```

6. **Add Environment Variables:**
   ```
   NODE_ENV=production
   IS_LOCAL=false
   USE_TEMP_STORAGE=false
   DATABASE_URL=<your-supabase-production-url>
   PORT=3001
   CLIENT_URL=https://your-frontend-domain.com
   ```

7. **Add PostgreSQL Database (Optional):**
   - New → PostgreSQL
   - Connect to your service
   - Use provided `DATABASE_URL`

8. **Deploy!** (Takes ~5 minutes)

**Pros:** ✅ Most reliable free tier, PostgreSQL included, WebSocket support  
**Cons:** ⚠️ App sleeps after 15 min inactivity (wakes on request)

---

## 🥈 Option 2: Fly.io (Good for Always-On)

**Free Tier Includes:**
- 3 shared-cpu VMs free (256MB RAM each)
- 160GB outbound data/month
- PostgreSQL available
- Always-on option
- Great for WebSockets ✅

### Setup Steps:

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login:**
```bash
fly auth login
```

3. **Initialize:**
```bash
cd "/Volumes/homesfy workspace/new-dash"
fly launch
# Follow prompts, select region
```

4. **Set Secrets:**
```bash
fly secrets set NODE_ENV=production
fly secrets set IS_LOCAL=false
fly secrets set USE_TEMP_STORAGE=false
fly secrets set DATABASE_URL=<your-database-url>
fly secrets set PORT=3001
```

5. **Deploy:**
```bash
fly deploy
```

**Note:** Uses `Dockerfile` (already created above)

**Pros:** ✅ Always-on, faster than Render, WebSocket support  
**Cons:** ⚠️ Requires CLI, more setup steps

---

## 🥉 Option 3: Cyclic.sh (Simple, Auto-Deploy)

**Free Tier Includes:**
- Unlimited deploys
- Auto-scaling
- PostgreSQL option
- Auto-deploy from GitHub

### Setup Steps:

1. **Go to**: https://cyclic.sh
2. **Sign up with GitHub**
3. **Connect Repository**
4. **Configure:**
   - Root Directory: `/` (root)
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
   - Port: `3001`

5. **Add Environment Variables** (same as Render)

6. **Deploy**

**Pros:** ✅ Simple setup, auto-deploy, good free tier  
**Cons:** ⚠️ May have limits on free tier

---

## Option 4: Vercel (For Frontend + API Routes)

**Free Tier:**
- Unlimited deployments
- Serverless functions
- PostgreSQL integration

### Setup Steps:

1. **Go to**: https://vercel.com
2. **Import GitHub Repository**
3. **Configure:**
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

4. **Add Environment Variables**

**Note:** Best for frontend, backend runs as serverless functions

**Pros:** ✅ Great for frontend, CDN included  
**Cons:** ⚠️ Serverless may have limitations for WebSockets

---

## Option 5: DigitalOcean App Platform (Free Trial)

**Free Trial:**
- $200 credit for 60 days
- Then paid ($5/month for basic)

### Setup:
1. Go to: https://www.digitalocean.com/products/app-platform
2. Create App from GitHub
3. Configure similar to Render
4. Add environment variables

**Pros:** ✅ Full control, managed database  
**Cons:** ⚠️ Not completely free after trial

---

## Comparison Table

| Platform | Free Tier | Always-On | PostgreSQL | WebSocket | Ease |
|----------|-----------|-----------|------------|-----------|------|
| **Render** | ⭐⭐⭐⭐⭐ | ⚠️ Sleeps | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Fly.io** | ⭐⭐⭐⭐ | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| **Cyclic** | ⭐⭐⭐⭐ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Vercel** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ⚠️ | ⭐⭐⭐ |
| **Railway** | ⭐⭐⭐ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |

---

## 🎯 My Recommendation: **Render**

**Why Render?**
- ✅ Best free tier (750 hours/month = 24/7 possible)
- ✅ PostgreSQL database included free
- ✅ Easiest setup (just connect GitHub)
- ✅ WebSocket support
- ✅ Auto-deploy on push
- ✅ Similar to Railway (you'll feel at home)

**Only downside:** App sleeps after 15 min inactivity (but wakes instantly on request)

---

## Quick Render Setup

```bash
# 1. Go to render.com and sign up
# 2. New → Web Service
# 3. Connect: khanfahim2025/Microsite-Tracker-Dashboard
# 4. Settings:
#    - Build: npm install && npx prisma generate
#    - Start: npm start
# 5. Environment Variables:
#    - NODE_ENV=production
#    - IS_LOCAL=false
#    - USE_TEMP_STORAGE=false
#    - DATABASE_URL=<your-supabase-url>
# 6. Deploy!
```

**Done! Your backend will be live in ~5 minutes** 🚀

---

## After Deployment

1. Get your Render URL: `https://your-app.onrender.com`
2. Update tracking script URL in microsites:
   ```html
   <script src="https://your-app.onrender.com/tracking.js"></script>
   ```
3. Update frontend API URL:
   ```
   REACT_APP_API_URL=https://your-app.onrender.com/api
   ```

---

## Tips

- **Render free tier sleeps** → First request may take 30 seconds (wake up time)
- **Fly.io** → Best for always-on (if within free tier limits)
- **Multiple deployments** → Use different platforms for different environments
- **Database** → Supabase free tier is great (separate from hosting)

