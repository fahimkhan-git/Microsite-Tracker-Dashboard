# Deployment Guide

## 🚨 Important Security Notes

### ⚠️ NEVER do these:
- ❌ Commit `.env` files with production credentials
- ❌ Use production database in local development
- ❌ Set `USE_TEMP_STORAGE=false` in local development
- ❌ Share production database URLs in code or documentation

### ✅ ALWAYS do these:
- ✅ Use `.env.example` as a template
- ✅ Use separate databases for dev and production
- ✅ Use `USE_TEMP_STORAGE=true` for quick local testing
- ✅ Store production credentials in hosting platform (Railway/Render) only

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/khanfahim2025/Microsite-Tracker-Dashboard.git
cd Microsite-Tracker-Dashboard
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### 3. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

**Edit `.env` file for LOCAL development:**

```env
NODE_ENV=development
IS_LOCAL=true
USE_TEMP_STORAGE=true

PORT=3001
WS_PORT=3001

# Use a SEPARATE database for development (not production!)
DATABASE_URL="postgresql://user:password@localhost:5432/microsite_tracker_dev"

CLIENT_URL=http://localhost:3000
```

### 4. Setup Development Database

**Option A: Quick Testing (Temporary Storage)**
- Just use `USE_TEMP_STORAGE=true`
- Data auto-deletes after 1 minute
- No database setup needed

**Option B: Persistent Local Testing**
```bash
# Create a separate development database
createdb microsite_tracker_dev

# Or in Supabase: Create a NEW project for development
# Then use that project's DATABASE_URL
```

### 5. Run Database Migrations

```bash
# Only for persistent database setup
npx prisma migrate dev
npx prisma generate
```

### 6. Start Development Servers

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
npm run client
```

---

## Production Deployment

### Environment Variables for Production

Set these in your hosting platform (Railway/Render):

```env
NODE_ENV=production
IS_LOCAL=false
USE_TEMP_STORAGE=false
DATABASE_URL=<your-production-supabase-url>
PORT=3001
CLIENT_URL=https://your-frontend-domain.com
```

### Deployment on Railway

1. **Go to Railway Dashboard**: https://railway.app
2. **Create New Project** → Deploy from GitHub repo
3. **Connect Repository**: Select `khanfahim2025/Microsite-Tracker-Dashboard`
4. **Add Environment Variables** (in Railway dashboard):
   - `NODE_ENV=production`
   - `IS_LOCAL=false`
   - `USE_TEMP_STORAGE=false`
   - `DATABASE_URL=<your-production-database-url>` ⚠️ **Never commit this!**
   - `PORT=3001`
   - `CLIENT_URL=<your-frontend-url>`

5. **Railway automatically**:
   - Detects Node.js project
   - Runs `npm install`
   - Runs `npm start` (starts `server.js`)
   - Keeps server running 24/7

6. **Get your backend URL**: Railway provides a public URL
   - Example: `web-production-xxx.up.railway.app`
   - Update tracking script URL in microsites to this URL

### Deployment on Render

1. **Go to Render Dashboard**: https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** → Select repository
4. **Configure**:
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
   - Environment: `Node`
5. **Add Environment Variables** (same as Railway above)
6. **Deploy**

---

## Git Workflow (Protecting Production Data)

### Branch Strategy

- `main` - **Production** (protected, requires PR approval)
- `develop` - Development/Staging
- `feature/*` - Feature branches
- `fix/*` - Bug fixes

### Development Workflow

1. **Create feature branch:**
```bash
git checkout -b feature/my-feature
```

2. **Make changes and test locally:**
   - Always use `USE_TEMP_STORAGE=true` or separate DEV database
   - Never connect to production database in local `.env`

3. **Commit changes:**
```bash
git add .
git commit -m "Add feature: description"
```

4. **Push and create PR:**
```bash
git push origin feature/my-feature
# Then create PR on GitHub
```

5. **PR Requirements:**
   - ✅ Code review required
   - ✅ No `.env` files in PR
   - ✅ Automated checks pass
   - ✅ Environment variables reviewed (no production secrets)

### Protecting Main Branch

**In GitHub Settings → Branches:**
1. Add branch protection rule for `main`
2. Require pull request reviews (1+ reviewers)
3. Require status checks to pass
4. Restrict pushes (nobody can push directly)
5. Require conversation resolution before merging

---

## Environment Variables Reference

| Variable | Development | Production |
|----------|------------|------------|
| `NODE_ENV` | `development` | `production` |
| `IS_LOCAL` | `true` | `false` |
| `USE_TEMP_STORAGE` | `true` | `false` |
| `DATABASE_URL` | Dev database ⚠️ | Production database |
| `PORT` | `3001` | `3001` or auto |
| `CLIENT_URL` | `http://localhost:3000` | Production frontend URL |

---

## Database Setup

### Development Database

Create a separate Supabase project or local PostgreSQL database:
- Name: `microsite_tracker_dev`
- Use for: Local testing only
- ⚠️ Never use production data here

### Production Database

- Use your existing Supabase production project
- Store `DATABASE_URL` only in hosting platform (Railway/Render)
- ⚠️ Never commit to Git

### Running Migrations

**Development:**
```bash
npx prisma migrate dev
```

**Production:**
```bash
npx prisma migrate deploy  # Only migrations, no schema changes
```

---

## Testing Checklist Before Deploying

- [ ] `.env` file is in `.gitignore`
- [ ] `.env` is not committed to Git
- [ ] Using separate DEV database locally
- [ ] `USE_TEMP_STORAGE=true` in local `.env`
- [ ] Production credentials stored only in hosting platform
- [ ] Branch protection enabled on `main`
- [ ] PR reviews required
- [ ] Health check endpoint working (`/health`)

---

## Troubleshooting

### Issue: "Cannot connect to database"
- Check `DATABASE_URL` is correct
- Verify database is accessible
- Check firewall/network settings

### Issue: "Data not persisting"
- Check `USE_TEMP_STORAGE=false` in production
- Verify production `DATABASE_URL` is set
- Check database connection in logs

### Issue: "Production data accidentally used in dev"
- ⚠️ **STOP IMMEDIATELY**
- Change `DATABASE_URL` to dev database
- Verify no production data was modified
- Review `.env` file and Git history

---

## Support

For issues or questions:
- Check GitHub Issues: https://github.com/khanfahim2025/Microsite-Tracker-Dashboard/issues
- Review logs in Railway/Render dashboard
- Check database connection in Supabase dashboard

