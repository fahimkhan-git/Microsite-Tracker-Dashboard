# Microsite Tracker Dashboard

A professional real-time tracking dashboard for monitoring 60-70 microsites with Google Ads visitor and lead tracking.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (Supabase recommended)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/khanfahim2025/Microsite-Tracker-Dashboard.git
cd Microsite-Tracker-Dashboard

# Install dependencies
npm run setup

# Copy environment template
cp .env.example .env

# Edit .env for local development
# See DEPLOYMENT.md for detailed setup
```

### Local Development

```bash
# Start backend (Terminal 1)
npm run dev

# Start frontend (Terminal 2)
npm run client
```

Visit: http://localhost:3000

---

## 🔒 Security & Production Protection

### ⚠️ CRITICAL: Protecting Production Data

**NEVER do these:**
- ❌ Commit `.env` files with production credentials
- ❌ Use production database in local development
- ❌ Set `USE_TEMP_STORAGE=false` in local `.env`

**ALWAYS do these:**
- ✅ Use `.env.example` as template
- ✅ Use separate databases for dev and production
- ✅ Use `USE_TEMP_STORAGE=true` for quick local testing
- ✅ Store production credentials only in hosting platform

See [SECURITY.md](./SECURITY.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guidelines.

---

## Features

- ✅ Real-time tracking of visits and leads from Google Ads only
- ✅ Automatic filtering (no test/random traffic)
- ✅ Search and filter by domain name
- ✅ Region and campaign filtering
- ✅ Date range filtering (Day, Week, Month, Custom)
- ✅ Sorting by visits, leads, or conversion rate
- ✅ Alert system for sites with no visits/leads (24h, 48h, 72h)
- ✅ Website and form status monitoring
- ✅ Professional, modern dashboard UI
- ✅ WebSocket real-time updates
- ✅ Conversion rate tracking
- ✅ Universal tracking script (no GTM container needed)
- ✅ CSV/Excel export functionality
- ✅ Responsive design (mobile-friendly)

---

## Tech Stack

- **Frontend**: React.js with JSX
- **Backend**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Real-time**: WebSockets
- **Deployment**: Railway / Render

---

## Project Structure

```
new-dash/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── index.js       # Entry point
│   └── public/
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Prisma schema
│   └── migrations/        # Database migrations
├── public/                # Static files
│   └── tracking.js        # Universal tracking script
├── utils/                 # Backend utilities
│   ├── storage.js         # Storage abstraction (dev/prod)
│   └── statusChecker.js  # Website/form status checking
├── server.js              # Express backend server
├── .env.example           # Environment template
├── DEPLOYMENT.md          # Deployment guide
└── SECURITY.md            # Security guidelines
```

---

## Environment Setup

### Local Development

Create `.env` file:
```env
NODE_ENV=development
IS_LOCAL=true
USE_TEMP_STORAGE=true
DATABASE_URL="postgresql://user:password@localhost:5432/microsite_tracker_dev"
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Production

Set in hosting platform (Railway/Render):
```env
NODE_ENV=production
IS_LOCAL=false
USE_TEMP_STORAGE=false
DATABASE_URL=<production-database-url>
PORT=3001
CLIENT_URL=https://your-frontend-domain.com
```

---

## Database Setup

### Development

1. **Quick Testing (Temporary Storage):**
   - Set `USE_TEMP_STORAGE=true`
   - No database needed
   - Data auto-deletes after 1 minute

2. **Persistent Local Testing:**
   - Create separate Supabase project or local PostgreSQL
   - Set `DATABASE_URL` to dev database
   - Run: `npm run prisma:migrate`

### Production

- Use production Supabase database
- Store `DATABASE_URL` only in hosting platform
- Never commit to Git

---

## Tracking Script Installation

### Recommended: Use Cloudflare Worker (No Sleep, Fast)

Add to each microsite's HTML:

```html
<script>
  window.LiveAnalyticsConfig = {
    apiUrl: 'https://microsite-tracker.your-subdomain.workers.dev/api',
    domain: 'your-microsite-domain.com'
  };
</script>
<script src="https://microsite-tracker.your-subdomain.workers.dev/tracking.js"></script>
```

**Benefits:** ✅ Always available (no sleep), ✅ Global edge network, ✅ Free

### Alternative: Direct to Backend

```html
<script>
  window.LiveAnalyticsConfig = {
    apiUrl: 'https://your-backend-url.onrender.com/api',
    domain: 'your-microsite-domain.com'
  };
</script>
<script src="https://your-backend-url.onrender.com/tracking.js"></script>
```

---

## Git Workflow

### Branch Strategy

- `main` - Production (protected)
- `develop` - Development/Staging
- `feature/*` - Feature branches
- `fix/*` - Bug fixes

### Development Flow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes (use USE_TEMP_STORAGE=true locally)

# 3. Commit
git add .
git commit -m "Add feature: description"

# 4. Push and create PR
git push origin feature/my-feature
# Create PR on GitHub
```

### PR Requirements

- Code review required
- No `.env` files
- All checks pass
- No production credentials in code

---

## Deployment

### Architecture (Hybrid Approach)

- **Cloudflare Worker**: Tracking endpoints (edge, no sleep, free)
- **Express Backend**: Dashboard APIs (Render/Fly.io/any hosting)

### Cloudflare Worker Setup

**Recommended for tracking endpoints:**
1. See [CLOUDFLARE_WORKER_SETUP.md](./CLOUDFLARE_WORKER_SETUP.md) for full guide
2. Quick setup:
   ```bash
   cd workers
   npm install
   wrangler login
   wrangler secret put BACKEND_URL  # Your Express backend URL
   wrangler deploy
   ```
3. Get Worker URL: `https://microsite-tracker.your-subdomain.workers.dev`
4. Update tracking script in microsites to use Worker URL

### Express Backend Setup

**Option 1: Render (Recommended)**
- See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
- 750 hours/month free
- Auto-deploy from GitHub

**Option 2: Fly.io**
- Always-on free tier
- See [HOSTING_OPTIONS.md](./HOSTING_OPTIONS.md)

**Option 3: Railway**
- Similar to Render
- Good if within limits

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## Scripts

```bash
npm start              # Start production server
npm run dev           # Start development server (nodemon)
npm run client        # Start React dev server
npm run client:build  # Build React app for production
npm run prisma:migrate   # Run database migrations (dev)
npm run prisma:deploy    # Deploy migrations (production)
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open Prisma Studio
npm run setup         # Full setup (install + generate)
```

---

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `GET /api/microsites` - Get all microsites with stats
- `GET /api/campaigns` - Get campaign statistics
- `GET /api/microsites/export` - Export to CSV
- `POST /api/track/visit` - Track visit
- `POST /api/track/lead` - Track lead
- `POST /api/microsites/:domain/check-status` - Check website status

---

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment and setup guide
- [SECURITY.md](./SECURITY.md) - Security best practices
- `.env.example` - Environment variables template

---

## Contributing

1. Create feature branch from `develop`
2. Make changes with proper testing
3. Follow security guidelines
4. Create PR with description
5. Wait for code review

---

## License

ISC

---

## Support

- GitHub Issues: https://github.com/khanfahim2025/Microsite-Tracker-Dashboard/issues
- Check logs in Railway/Render dashboard
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting
