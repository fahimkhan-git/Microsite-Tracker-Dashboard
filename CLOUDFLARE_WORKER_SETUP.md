# Cloudflare Worker Setup (Hybrid Approach)

This project uses a **hybrid architecture**:
- **Cloudflare Worker**: Handles tracking endpoints (edge, no sleep, free)
- **Express Backend**: Handles dashboard APIs (complex queries, WebSockets)

---

## 🎯 Benefits

✅ **No Sleep** - Worker is always available  
✅ **Global Edge Network** - Fast worldwide  
✅ **Free Tier** - 100,000 requests/day  
✅ **Dashboard Features** - Full Express features preserved  
✅ **Best of Both** - Fast tracking + powerful dashboard  

---

## 📋 Prerequisites

1. **Cloudflare Account** (free): https://dash.cloudflare.com/sign-up
2. **Wrangler CLI** (Cloudflare's CLI tool)
3. **Express Backend** already deployed (Render/Fly.io/etc.)

---

## 🚀 Setup Steps

### Step 1: Install Wrangler CLI

```bash
# Using npm
npm install -g wrangler

# OR using npx (no global install)
npx wrangler@latest --version
```

### Step 2: Login to Cloudflare

```bash
cd workers
wrangler login
```

This will open a browser to authenticate with Cloudflare.

### Step 3: Navigate to Workers Directory

```bash
cd "/Volumes/homesfy workspace/new-dash/workers"
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Set Backend URL Secret

This tells the Worker where to forward tracking requests:

```bash
# Set your Express backend URL
wrangler secret put BACKEND_URL

# When prompted, enter your backend URL:
# Example: https://your-app.onrender.com
# Example: https://your-app.fly.dev
```

**⚠️ Important:** This secret is stored securely in Cloudflare and never committed to Git.

### Step 6: Deploy Worker

```bash
# Deploy to Cloudflare
wrangler deploy

# OR deploy to production environment
wrangler deploy --env production
```

### Step 7: Get Your Worker URL

After deployment, you'll see:
```
✨  Uploaded microsite-tracker (X.XX sec)
Published microsite-tracker (X.XX sec)
  https://microsite-tracker.your-subdomain.workers.dev
```

**Save this URL!** This is your new tracking endpoint.

---

## 📝 Configuration

### Update `wrangler.toml`

Edit `workers/wrangler.toml` if needed:
- Change `name` to customize worker name
- Adjust `compatibility_date` if needed

### Environment Variables

**Set via Wrangler CLI (Secure):**
```bash
wrangler secret put BACKEND_URL
```

**Or set in Cloudflare Dashboard:**
1. Go to Workers & Pages → Your Worker → Settings
2. Variables → Environment Variables
3. Add `BACKEND_URL` = `https://your-backend.onrender.com`

---

## 🔄 How It Works

### Request Flow:

```
Microsite (with tracking.js)
    ↓
Cloudflare Worker (edge - fast, no sleep)
    ↓
Express Backend (Render/Fly.io - dashboard, database)
    ↓
PostgreSQL (Supabase - data storage)
```

### Endpoints:

| Endpoint | Handler | Destination |
|----------|---------|-------------|
| `/tracking.js` | Worker (proxy) | Express backend |
| `/api/track/visit` | Worker (forward) | Express backend |
| `/api/track/lead` | Worker (forward) | Express backend |
| `/api/microsites` | Express only | Express backend |
| `/api/campaigns` | Express only | Express backend |
| WebSocket | Express only | Express backend |

---

## 🔧 Update Tracking Script in Microsites

After deploying the Worker, update microsites to use the new URL:

### Old (direct to backend):
```html
<script src="https://your-backend.onrender.com/tracking.js"></script>
```

### New (via Cloudflare Worker):
```html
<script src="https://microsite-tracker.your-subdomain.workers.dev/tracking.js"></script>
```

**Config stays the same:**
```html
<script>
  window.LiveAnalyticsConfig = {
    apiUrl: 'https://microsite-tracker.your-subdomain.workers.dev/api',
    domain: 'your-microsite-domain.com'
  };
</script>
```

---

## 🧪 Testing

### Test Worker Locally:

```bash
cd workers
wrangler dev
```

Worker runs on: `http://localhost:8787`

### Test Endpoints:

```bash
# Health check
curl https://microsite-tracker.your-subdomain.workers.dev/health

# Test tracking.js
curl https://microsite-tracker.your-subdomain.workers.dev/tracking.js

# Test visit tracking
curl -X POST https://microsite-tracker.your-subdomain.workers.dev/api/track/visit \
  -H "Content-Type: application/json" \
  -d '{"domain":"test.com","gclid":"test123"}'
```

### View Logs:

```bash
# Watch logs in real-time
wrangler tail

# Production logs
wrangler tail --env production
```

---

## 📊 Monitoring

### Cloudflare Dashboard:

1. Go to: https://dash.cloudflare.com
2. Workers & Pages → Your Worker
3. **Metrics**: See requests, errors, CPU time
4. **Logs**: Real-time request logs
5. **Analytics**: Traffic patterns

### Free Tier Limits:

- **Requests**: 100,000/day (plenty for tracking)
- **CPU Time**: 50ms per request
- **Memory**: 128MB
- **Subdomain**: `*.workers.dev`

**Note:** Your Express backend still handles dashboard traffic (not counted in Worker limits).

---

## 🔄 Updates & Redeploy

### Update Worker Code:

```bash
cd workers
# Make changes to src/worker.js
wrangler deploy
```

### Update Backend URL:

```bash
wrangler secret put BACKEND_URL
# Enter new backend URL when prompted
```

---

## 🛠️ Troubleshooting

### Issue: "Worker not responding"
- Check `BACKEND_URL` secret is set correctly
- Verify Express backend is running
- Check Cloudflare dashboard logs

### Issue: "Backend timeout"
- Worker has 30-second timeout
- Check Express backend response times
- Verify backend health endpoint works

### Issue: "CORS errors"
- Worker handles CORS automatically
- Check browser console for details
- Verify request URL is correct

### Issue: "Script not loading"
- Check Worker URL is accessible
- Verify backend `/tracking.js` endpoint works
- Check Cloudflare dashboard for errors

---

## 📈 Performance

### Benefits:

- **Edge Network**: Requests served from nearest Cloudflare location
- **No Cold Starts**: Worker is always warm (unlike serverless)
- **Caching**: tracking.js cached at edge for 1 hour
- **Fast**: Sub-100ms response times typical

### Typical Response Times:

- **tracking.js**: ~50ms (cached)
- **Track Visit**: ~100-200ms (forwarded to backend)
- **Track Lead**: ~100-200ms (forwarded to backend)

---

## 🔐 Security

- ✅ Secrets stored securely in Cloudflare
- ✅ CORS handled automatically
- ✅ No credentials exposed
- ✅ HTTPS enforced

---

## 💰 Cost

### Free Tier:

- **100,000 requests/day** → FREE
- **50ms CPU per request** → FREE
- **Unlimited bandwidth** → FREE

### Beyond Free Tier:

- Paid plans available if needed
- Very affordable ($5/month for 10M requests)

---

## 📚 Resources

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Wrangler CLI Docs: https://developers.cloudflare.com/workers/wrangler/
- Dashboard: https://dash.cloudflare.com

---

## ✅ Quick Checklist

- [ ] Cloudflare account created
- [ ] Wrangler CLI installed
- [ ] Logged in: `wrangler login`
- [ ] Backend deployed (Render/Fly.io)
- [ ] BACKEND_URL secret set
- [ ] Worker deployed
- [ ] Worker URL obtained
- [ ] Tracking script updated in microsites
- [ ] Tested endpoints

---

## 🎉 You're Done!

Your tracking is now:
- ✅ Always available (no sleep)
- ✅ Globally fast (edge network)
- ✅ Completely free
- ✅ Backed by Express for dashboard

**Worker URL:** `https://microsite-tracker.your-subdomain.workers.dev`

