# Cloudflare Pages - Correct Configuration

## ✅ For Cloudflare Pages (Static Site - NO Wrangler Needed)

Cloudflare Pages deploys static sites automatically - **NO deploy command needed!**

### Configuration in Cloudflare Pages Dashboard:

#### 1. Project Name:
```
microsite-tracker-dashboard
```

#### 2. Production Branch:
```
main
```

#### 3. Framework Preset:
```
None
```

#### 4. Build Command:
```
npm install && cd client && npm install && cd .. && npm run client:build
```

#### 5. Build Output Directory:
```
client/build
```

#### 6. Root Directory:
```
/
```

#### 7. Environment Variables:
Add this:
- **Variable Name**: `REACT_APP_API_URL`
- **Value**: `https://your-backend-url.onrender.com/api` (your actual backend URL)

---

## ⚠️ Important: NO Deploy Command Needed!

**Cloudflare Pages** does NOT need:
- ❌ Deploy command
- ❌ Wrangler
- ❌ Any deploy script

Pages automatically:
1. Runs your build command
2. Deploys the `client/build` folder
3. Serves it as a static site

---

## If Cloudflare Pages is Running Wrangler

This should **NOT happen** with Cloudflare Pages. If it does:

1. **Check if you have a deploy command set** - Remove it
2. **Check if you're using Workers instead** - Workers ≠ Pages
3. **Make sure you selected "Pages" not "Workers"**

---

## Two Different Cloudflare Services:

### Cloudflare Pages (What you're setting up)
- For: Static sites (React, Next.js static, etc.)
- Builds and deploys automatically
- No deploy command needed
- Output: Static files from `client/build`

### Cloudflare Workers (Separate - in `workers/` folder)
- For: Backend API code
- Needs: Wrangler + `wrangler.toml`
- Deploy separately: `cd workers && wrangler deploy`

---

## Summary

**For Cloudflare Pages:**
- ✅ Build command: `npm install && cd client && npm install && cd .. && npm run client:build`
- ✅ Output: `client/build`
- ✅ Environment: `REACT_APP_API_URL` = your backend URL
- ❌ NO deploy command
- ❌ NO wrangler

**Just fill in the build settings and deploy - Pages handles the rest!** 🚀

