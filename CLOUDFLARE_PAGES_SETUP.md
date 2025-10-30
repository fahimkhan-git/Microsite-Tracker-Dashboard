# Cloudflare Pages Setup Configuration

## ⚠️ Important Notes

**Cloudflare Pages** is designed for static sites. Your app has:
- **React Frontend** (can be deployed to Pages) ✅
- **Express Backend** (needs server - Render/Railway/etc. OR Cloudflare Workers)

## Recommended Setup:

1. **Cloudflare Pages** → Deploy React frontend (static)
2. **Render/Other** → Deploy Express backend (server)
3. **Cloudflare Worker** → Deploy tracking proxy (edge)

---

## Cloudflare Pages Configuration:

### Project Name:
```
microsite-tracker-dashboard
```

### Production Branch:
```
main
```

### Framework Preset:
```
None
```

### Build Command:
```
npm install && cd client && npm install && cd .. && npx prisma generate && npm run client:build
```

### Build Output Directory:
```
client/build
```

### Root Directory (Advanced):
```
/
```
(Leave as default unless project is in a subdirectory)

### Environment Variables (Advanced):
Add these if needed:
- `REACT_APP_API_URL` = Your backend URL (e.g., `https://your-backend.onrender.com/api`)

---

## Alternative: Deploy Full Stack to Cloudflare

If you want to deploy everything to Cloudflare:
- Use **Cloudflare Workers** for the backend API
- Use **Cloudflare Pages** for the frontend
- Connect them together

But this requires rewriting the Express backend as Cloudflare Workers/Functions.

---

## ⭐ Recommended Approach:

**Option 1: Hybrid (Easiest)**
- **Cloudflare Pages** → React frontend only
- **Render** → Express backend
- **Cloudflare Worker** → Tracking proxy

**Option 2: Full Cloudflare**
- **Cloudflare Workers** → Backend API (rewrite Express)
- **Cloudflare Pages** → React frontend
- Worker and Pages communicate

---

## For Your Current Setup (Cloudflare Pages for Frontend):

### Configuration:
- **Build Command**: `npm install && cd client && npm install && cd .. && npx prisma generate && npm run client:build`
- **Build Output**: `client/build`
- **Environment Variables**: 
  - `REACT_APP_API_URL` = `https://your-backend-url.onrender.com/api`

This will deploy just the React app to Cloudflare Pages, which will connect to your Express backend hosted elsewhere.

