# ✅ Deployment Checklist

## Pre-Deployment

- [ ] Code pushed to GitHub (main branch)
- [ ] All dependencies installed
- [ ] Build successful locally
- [ ] `.env` file NOT committed
- [ ] `.gitignore` includes `.env*`

## Render Deployment

- [ ] Service created in Render dashboard
- [ ] GitHub repository connected
- [ ] **Build Command**: `npm install && cd client && npm install && cd .. && npx prisma generate && npm run client:build`
- [ ] **Start Command**: `npm start`
- [ ] **Deploy Command**: (empty/blank)
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `IS_LOCAL=false`
  - [ ] `USE_TEMP_STORAGE=false`
  - [ ] `DATABASE_URL=<your-supabase-url>`
  - [ ] `PORT=3001` (or let Render auto-assign)
  - [ ] `CLIENT_URL=<your-render-url>`
- [ ] Build successful
- [ ] Server running

## Cloudflare Worker Deployment

- [ ] Node.js v20+ installed
- [ ] Wrangler CLI installed: `npm install -g wrangler`
- [ ] Logged in: `wrangler login`
- [ ] Navigated to workers directory: `cd workers`
- [ ] Dependencies installed: `npm install`
- [ ] Backend URL set: `wrangler secret put BACKEND_URL`
- [ ] Worker deployed: `wrangler deploy`
- [ ] Worker URL obtained
- [ ] Tracking script updated in microsites to use Worker URL

## Testing

- [ ] Dashboard accessible at Render URL
- [ ] API endpoints responding (`/health`, `/api/health`)
- [ ] Tracking script accessible (`/tracking.js`)
- [ ] Test visit tracking works
- [ ] Test lead tracking works
- [ ] WebSocket connection works
- [ ] Real-time updates working

## Post-Deployment

- [ ] Update microsite tracking scripts with new URLs
- [ ] Monitor logs for errors
- [ ] Check database connection
- [ ] Verify all features working

---

## Troubleshooting

**Build fails?**
- Check `package.json` scripts
- Verify Node.js version (18+)
- Check for missing dependencies

**Deploy command still runs wrangler?**
- Clear deploy command in Render dashboard (see [CLEAR_RENDER_DEPLOY.md](./CLEAR_RENDER_DEPLOY.md))

**Server not starting?**
- Check environment variables
- Verify `DATABASE_URL` is correct
- Check Render logs

**Worker deployment fails?**
- Ensure Node.js v20+
- Verify `BACKEND_URL` secret is set
- Check `wrangler.toml` configuration

