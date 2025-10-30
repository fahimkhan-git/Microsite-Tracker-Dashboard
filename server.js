const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { WebSocketServer } = require('ws');
const http = require('http');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const { storage, init } = require('./utils/storage');
const statusChecker = require('./utils/statusChecker');

// Detect if running locally (development) or production
const IS_LOCAL = process.env.NODE_ENV !== 'production' && (process.env.IS_LOCAL === 'true' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost'));
const USE_TEMP_STORAGE = IS_LOCAL && process.env.USE_TEMP_STORAGE !== 'false'; // Default to temp storage in local

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize storage utility
const { setStatusChecker } = require('./utils/storage');
init(prisma, USE_TEMP_STORAGE);
setStatusChecker(statusChecker);

// Log storage mode
console.log(`📊 Storage Mode: ${storage.getStorageMode()}`);

const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration
// Allow all origins for tracking script and API endpoints
app.use((req, res, next) => {
  // Allow tracking endpoints from any origin
  if (req.path.startsWith('/tracking.js') || req.path.startsWith('/api/track') || req.path.startsWith('/test-local.html')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  } else {
    // Restrict dashboard API to client URL only
    const origin = req.headers.origin;
    const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
    if (origin === allowedOrigin || !origin) {
      res.header('Access-Control-Allow-Origin', allowedOrigin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Serve tracking.js file
app.get('/tracking.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow from any origin
  res.sendFile(path.join(__dirname, 'public', 'tracking.js'));
});

// Serve test page for local testing
app.get('/test-local.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-local.html'));
});

// Helper function to check if traffic is from Google Ads
function isFromGoogleAds(req) {
  const gclid = req.body.gclid || req.query.gclid;
  const utmSource = req.body.utm_source || req.query.utm_source;
  const utmMedium = req.body.utm_medium || req.query.utm_medium;
  
  // Check for Google Click ID (gclid) - primary indicator
  if (gclid) return true;
  
  // Check for UTM parameters indicating Google Ads
  if (utmSource?.toLowerCase() === 'google' && 
      (utmMedium?.toLowerCase() === 'cpc' || utmMedium?.toLowerCase() === 'ppc')) {
    return true;
  }
  
  return false;
}

// Health check endpoint (for Railway/Render monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    storage: storage.getStorageMode(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Microsite Tracker API',
    version: '1.0.0',
    storage: storage.getStorageMode(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Track visit from Google Ads
app.post('/api/track/visit', async (req, res) => {
  try {
    const { domain, gclid, utm_source, utm_medium, utm_campaign, ip, user_agent, referrer } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const isGoogleAds = isFromGoogleAds(req);

    // Only track if from Google Ads
    if (!isGoogleAds) {
      return res.status(200).json({ message: 'Not from Google Ads, not tracked' });
    }

    // Find or create microsite
    const microsite = await storage.findOrCreateMicrosite(domain);

    // Create visit record
    const visit = await storage.createVisit(microsite.id, {
      gclid: gclid || null,
      utmSource: utm_source || null,
      utmMedium: utm_medium || null,
      utmCampaign: utm_campaign || null,
      isFromGoogleAds: true,
      ipAddress: ip || req.ip || null,
      userAgent: user_agent || req.headers['user-agent'] || null,
      referrer: referrer || req.headers.referer || null
    });

    // Broadcast to connected clients
    broadcastUpdate('visit', { micrositeId: microsite.id, domain, visit });

    res.json({ success: true, visit });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track lead from Google Ads
app.post('/api/track/lead', async (req, res) => {
  try {
    const { domain, gclid, utm_source, utm_medium, utm_campaign, email, phone, name, form_data } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const isGoogleAds = isFromGoogleAds(req);

    // Only track if from Google Ads
    if (!isGoogleAds) {
      return res.status(200).json({ message: 'Not from Google Ads, not tracked' });
    }

    // Find or create microsite
    const microsite = await storage.findOrCreateMicrosite(domain);

    // Create lead record
    const lead = await storage.createLead(microsite.id, {
      gclid: gclid || null,
      utmSource: utm_source || null,
      utmMedium: utm_medium || null,
      utmCampaign: utm_campaign || null,
      isFromGoogleAds: true,
      email: email || null,
      phone: phone || null,
      name: name || null,
      formData: form_data ? JSON.stringify(form_data) : null
    });

    // Broadcast to connected clients
    broadcastUpdate('lead', { micrositeId: microsite.id, domain, lead });

    res.json({ success: true, lead });
  } catch (error) {
    console.error('Error tracking lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all campaigns with stats
app.get('/api/campaigns', async (req, res) => {
  try {
    const { startDate, endDate, region } = req.query;
    const dateFilter = startDate && endDate ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    } : null;
    
    const campaigns = await storage.getCampaignStats(dateFilter, region);
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all microsites with stats
app.get('/api/microsites', async (req, res) => {
  try {
    const { search, startDate, endDate, campaign, sortBy, sortOrder } = req.query;
    const dateFilter = startDate && endDate ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    } : null;
    const microsites = await storage.getAllMicrosites(search, dateFilter, campaign);
    
    // Sort microsites
    const sorted = sortMicrosites(microsites, sortBy || 'visits', sortOrder || 'desc');
    
    res.json(sorted);
  } catch (error) {
    console.error('Error fetching microsites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to sort microsites
function sortMicrosites(microsites, sortBy, sortOrder) {
  const order = sortOrder === 'asc' ? 1 : -1;
  
  return [...microsites].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'visits':
        aValue = a.stats.visits24h || 0;
        bValue = b.stats.visits24h || 0;
        break;
      case 'leads':
        aValue = a.stats.leads24h || 0;
        bValue = b.stats.leads24h || 0;
        break;
      case 'conversion':
        aValue = parseFloat(a.stats.conversionRate) || 0;
        bValue = parseFloat(b.stats.conversionRate) || 0;
        break;
      default:
        return 0;
    }
    
    return (aValue - bValue) * order;
  });
}

// Export microsites data to CSV/Excel
app.get('/api/microsites/export', async (req, res) => {
  try {
    const { search, startDate, endDate, region, campaign, sortBy, sortOrder } = req.query;
    const dateFilter = startDate && endDate ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    } : null;
    
    const microsites = await storage.getAllMicrosites(search, dateFilter, campaign);
    
    // Filter by region if provided
    let filtered = region && region !== 'all' 
      ? microsites.filter(site => (site.region || 'unknown') === region)
      : microsites;
    
    // Sort microsites (same as main endpoint)
    const sorted = sortMicrosites(filtered, sortBy || 'visits', sortOrder || 'desc');
    
    // Generate CSV
    const headers = ['#', 'Website', 'Top Campaign', 'Region', 'Visitors (Date Range)', 'Leads (Date Range)', 'Total Visitors', 'Total Leads', 'Test Leads', 'Conversion %', 'Website Status', 'Form Status', 'Last Activity'];
    const rows = sorted.map((site, index) => [
      index + 1,
      site.domain,
      site.topCampaign || 'N/A',
      site.region || 'N/A',
      site.stats.visits24h, // Date range visits
      site.stats.leads24h, // Date range leads
      site.stats.totalVisits, // All time total
      site.stats.totalLeads, // All time total
      site.stats.testLeads || 0,
      `${site.stats.conversionRate}%`,
      site.websiteStatus?.label || 'Unknown',
      site.formStatus?.label || 'Unknown',
      new Date(site.lastActivity).toLocaleString()
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="microsites-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send('\ufeff' + csv); // Add BOM for Excel UTF-8 support
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check website status for a microsite
app.post('/api/microsites/:domain/check-status', async (req, res) => {
  try {
    const { domain } = req.params;
    const websiteStatus = await statusChecker.checkWebsiteStatus(domain);
    const formStatus = await statusChecker.checkFormStatus(domain);
    
    // Update microsite status in storage
    await storage.updateMicrositeStatus(domain, {
      websiteStatus,
      formStatus
    });
    
    res.json({
      success: true,
      websiteStatus,
      formStatus
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update microsite region
app.put('/api/microsites/:domain/region', async (req, res) => {
  try {
    const { domain } = req.params;
    const { region } = req.body;
    
    await storage.updateMicrositeRegion(domain, region);
    
    res.json({ success: true, domain, region });
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single microsite details
app.get('/api/microsites/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    const microsite = await prisma.microsite.findUnique({
      where: { domain },
      include: {
        visits: {
          where: {
            isFromGoogleAds: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 100
        },
        leads: {
          where: {
            isFromGoogleAds: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 100
        }
      }
    });

    if (!microsite) {
      return res.status(404).json({ error: 'Microsite not found' });
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [visits24h, leads24h] = await Promise.all([
      prisma.visit.count({
        where: {
          micrositeId: microsite.id,
          isFromGoogleAds: true,
          createdAt: { gte: yesterday }
        }
      }),
      prisma.lead.count({
        where: {
          micrositeId: microsite.id,
          isFromGoogleAds: true,
          createdAt: { gte: yesterday }
        }
      })
    ]);

    res.json({
      ...microsite,
      stats: {
        visits24h,
        leads24h
      }
    });
  } catch (error) {
    console.error('Error fetching microsite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket for real-time updates
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('WebSocket client connected');

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Serve static files from React app build (must be after all API routes)
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Serve React app for all non-API routes (catch-all, must be last)
app.get('*', (req, res) => {
  // Don't serve React app for API routes, tracking.js, or test page
  if (req.path.startsWith('/api') || req.path.startsWith('/tracking.js') || req.path.startsWith('/test-local.html')) {
    return res.status(404).json({ error: 'Not found' });
  }
  // Serve React app
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Start HTTP server with Express app
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
});

// Cron job to cleanup old data (every minute for local testing)
if (USE_TEMP_STORAGE) {
  cron.schedule('* * * * *', () => {
    storage.cleanupOldData();
  });
  console.log('🧹 Auto-cleanup enabled: Data older than 1 minute will be deleted');
}

// Cron job to check website and form status (every 30 minutes)
cron.schedule('*/30 * * * *', async () => {
  try {
    console.log('🔍 Checking website and form statuses...');
    const microsites = await storage.getAllMicrosites();
    
    // Check status for each microsite (limit to 5 at a time to avoid overload)
    const micrositesToCheck = microsites.slice(0, 5);
    
    for (const microsite of micrositesToCheck) {
      try {
        const websiteStatus = await statusChecker.checkWebsiteStatus(microsite.domain);
        const formStatus = await statusChecker.checkFormStatus(microsite.domain);
        
        await storage.updateMicrositeStatus(microsite.domain, {
          websiteStatus,
          formStatus
        });
        
        console.log(`✅ Checked ${microsite.domain}: ${websiteStatus.isLive ? 'Live' : 'Offline'}`);
      } catch (error) {
        console.error(`❌ Error checking ${microsite.domain}:`, error.message);
      }
    }
    
    // Broadcast update
    broadcastUpdate('status-update', { microsites: micrositesToCheck });
  } catch (error) {
    console.error('Error in status check cron job:', error);
  }
});

// Cron job to check for alerts (every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const microsites = await storage.getAllMicrosites();
    const alerts = microsites
      .filter(site => site.alerts.noVisit24h || site.alerts.noLead24h)
      .map(site => ({
        domain: site.domain,
        noVisit24h: site.alerts.noVisit24h,
        noLead24h: site.alerts.noLead24h
      }));

    if (alerts.length > 0) {
      broadcastUpdate('alerts', { alerts });
      console.log('⚠️ Alerts generated:', alerts);
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

