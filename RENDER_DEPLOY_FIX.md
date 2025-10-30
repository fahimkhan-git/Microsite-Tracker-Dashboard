# Fix: Render Deploy Command Issue

## Problem
Render is trying to run `npx wrangler deploy` after the build completes, but Wrangler is for Cloudflare Workers, not Render deployment.

## ✅ Solution (Updated)

We've added a no-op deploy command in `render.yaml` to override the dashboard setting. **You still need to clear it in the dashboard for this to work properly.**

## Solution Options

### Option 1: Remove Deploy Command in Render Dashboard (REQUIRED - DO THIS FIRST)

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your service: `microsite-tracker-backend`
3. Go to **Settings** tab
4. Scroll to **Build & Deploy** section
5. **Clear/remove** the "Deploy Command" field (leave it empty)
6. Click **Save Changes**
7. Trigger a new deployment

**Render should only have:**
- ✅ Build Command: `npm install && cd client && npm install && cd .. && npx prisma generate && npm run client:build`
- ✅ Start Command: `npm start`
- ❌ Deploy Command: (empty or not set)

### Option 2: Set Deploy Command to Empty String (Alternative)

If you can't remove the deploy command field entirely in the dashboard:

1. Go to **Settings** → **Build & Deploy**
2. Set **Deploy Command** to:
   ```
   echo "Build complete"
   ```
3. Click **Save Changes**

**Note:** The `render.yaml` already has a deploy command that does this. Clearing it in the dashboard is still the best option.

---

## Why This Happens

Render might auto-detect deploy commands from:
- `package.json` scripts (though we don't have a "deploy" script)
- Other config files
- Manual configuration in the dashboard

**Important:** The `workers/` directory is for Cloudflare Workers deployment (separate service), not for Render. Render should only build and run the Express server.

---

## What Should Happen

After fixing:
1. ✅ Build completes successfully (already working!)
2. ✅ Server starts with `npm start`
3. ✅ Express serves the built React app
4. ✅ Dashboard accessible at your Render URL

---

## Cloudflare Worker (Separate)

The Cloudflare Worker should be deployed separately:
1. `cd workers`
2. `wrangler login`
3. `wrangler secret put BACKEND_URL` (your Render URL)
4. `wrangler deploy`

This is independent of Render deployment.

