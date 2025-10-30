# Cloudflare Worker - Microsite Tracker

This directory contains the Cloudflare Worker for handling tracking endpoints in a hybrid architecture.

## Architecture

```
Microsite → Cloudflare Worker (edge) → Express Backend → PostgreSQL
```

- **Worker**: Fast, no sleep, global edge network
- **Backend**: Complex queries, WebSockets, dashboard

## Quick Start

```bash
# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Set backend URL (your Express backend)
wrangler secret put BACKEND_URL

# Deploy
wrangler deploy
```

## Development

```bash
# Run locally
wrangler dev

# View logs
wrangler tail
```

## Configuration

- `wrangler.toml` - Worker configuration
- `src/worker.js` - Worker code
- Backend URL set via: `wrangler secret put BACKEND_URL`

## Documentation

See [../CLOUDFLARE_WORKER_SETUP.md](../CLOUDFLARE_WORKER_SETUP.md) for detailed setup guide.

