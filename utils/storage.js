/**
 * Storage utility for handling local (temporary) vs production (permanent) storage
 */

let prisma = null;
let USE_TEMP_STORAGE = false;

// Initialize storage mode
function init(prismaClient, useTempStorage) {
  prisma = prismaClient;
  USE_TEMP_STORAGE = useTempStorage;
}

// In-memory storage for local testing
const tempStorage = {
  microsites: new Map(),
  visits: new Map(),
  leads: new Map(),
  visitsByMicrosite: new Map(), // domain -> [visitIds]
  leadsByMicrosite: new Map()   // domain -> [leadIds]
};

let visitIdCounter = 0;
let leadIdCounter = 0;
let micrositeIdCounter = 0;

// Storage interface
const storage = {
  // Microsite operations
  async findOrCreateMicrosite(domain) {
    if (USE_TEMP_STORAGE) {
      // Check if exists
      for (const [id, microsite] of tempStorage.microsites.entries()) {
        if (microsite.domain === domain) {
          return microsite;
        }
      }
      
      // Create new
      const id = `microsite-${++micrositeIdCounter}`;
      const microsite = {
        id,
        domain,
        name: domain,
        region: null, // Will be set when tracking or manually
        createdAt: new Date(),
        updatedAt: new Date(),
        // Initialize status fields
        isLive: null,
        statusCode: null,
        sslValid: null,
        sslExpiry: null,
        websiteError: null,
        responseTime: null,
        websiteLastChecked: null,
        hasForm: null,
        formCount: null,
        formWorking: null,
        formError: null,
        formLastChecked: null
      };
      tempStorage.microsites.set(id, microsite);
      return microsite;
    } else {
      // Use Prisma for production
      let microsite = await prisma.microsite.findUnique({
        where: { domain }
      });
      
      if (!microsite) {
        microsite = await prisma.microsite.create({
          data: {
            domain,
            name: domain,
            region: null
          }
        });
      }
      return microsite;
    }
  },

  // Visit operations
  async createVisit(micrositeId, visitData) {
    if (USE_TEMP_STORAGE) {
      const id = `visit-${++visitIdCounter}`;
      const visit = {
        id,
        micrositeId,
        ...visitData,
        createdAt: new Date()
      };
      tempStorage.visits.set(id, visit);
      
      // Track by microsite
      const domain = Array.from(tempStorage.microsites.values())
        .find(m => m.id === micrositeId)?.domain || 'unknown';
      if (!tempStorage.visitsByMicrosite.has(domain)) {
        tempStorage.visitsByMicrosite.set(domain, []);
      }
      tempStorage.visitsByMicrosite.get(domain).push(id);
      
      return visit;
    } else {
      return await prisma.visit.create({
        data: {
          micrositeId,
          ...visitData
        }
      });
    }
  },

  // Lead operations
  async createLead(micrositeId, leadData) {
    if (USE_TEMP_STORAGE) {
      const id = `lead-${++leadIdCounter}`;
      const lead = {
        id,
        micrositeId,
        ...leadData,
        createdAt: new Date()
      };
      tempStorage.leads.set(id, lead);
      
      // Track by microsite
      const domain = Array.from(tempStorage.microsites.values())
        .find(m => m.id === micrositeId)?.domain || 'unknown';
      if (!tempStorage.leadsByMicrosite.has(domain)) {
        tempStorage.leadsByMicrosite.set(domain, []);
      }
      tempStorage.leadsByMicrosite.get(domain).push(id);
      
      return lead;
    } else {
      return await prisma.lead.create({
        data: {
          micrositeId,
          ...leadData
        }
      });
    }
  },

  // Update microsite region
  async updateMicrositeRegion(domain, region) {
    if (USE_TEMP_STORAGE) {
      // Find microsite
      for (const [id, microsite] of tempStorage.microsites.entries()) {
        if (microsite.domain === domain) {
          microsite.region = region;
          microsite.updatedAt = new Date();
          break;
        }
      }
      return { success: true };
    } else {
      // Update in database
      await prisma.microsite.updateMany({
        where: { domain },
        data: {
          region: region || null
        }
      });
      return { success: true };
    }
  },

  // Update microsite status
  async updateMicrositeStatus(domain, { websiteStatus, formStatus }) {
    if (USE_TEMP_STORAGE) {
      // Find microsite
      for (const [id, microsite] of tempStorage.microsites.entries()) {
        if (microsite.domain === domain) {
          // Update website status
          microsite.isLive = websiteStatus.isLive;
          microsite.statusCode = websiteStatus.statusCode;
          microsite.sslValid = websiteStatus.sslValid;
          microsite.sslExpiry = websiteStatus.sslExpiry;
          microsite.websiteError = websiteStatus.error;
          microsite.responseTime = websiteStatus.responseTime;
          microsite.websiteLastChecked = websiteStatus.lastChecked;
          
          // Update form status
          microsite.hasForm = formStatus.hasForm;
          microsite.formCount = formStatus.formCount;
          microsite.formWorking = formStatus.formWorking;
          microsite.formError = formStatus.error;
          microsite.formLastChecked = formStatus.lastChecked;
          
          microsite.updatedAt = new Date();
          break;
        }
      }
      return { success: true };
    } else {
      // Update in database
      await prisma.microsite.updateMany({
        where: { domain },
        data: {
          isLive: websiteStatus.isLive,
          statusCode: websiteStatus.statusCode,
          sslValid: websiteStatus.sslValid,
          sslExpiry: websiteStatus.sslExpiry,
          websiteError: websiteStatus.error,
          responseTime: websiteStatus.responseTime,
          websiteLastChecked: websiteStatus.lastChecked,
          hasForm: formStatus.hasForm,
          formCount: formStatus.formCount,
          formWorking: formStatus.formWorking,
          formError: formStatus.error,
          formLastChecked: formStatus.lastChecked
        }
      });
      return { success: true };
    }
  },

  // Get campaign statistics
  async getCampaignStats(dateFilter = null, region = null) {
    if (USE_TEMP_STORAGE) {
      // Aggregate campaigns from temporary storage
      const campaignMap = new Map();
      
      for (const [id, visit] of tempStorage.visits.entries()) {
        const domain = Array.from(tempStorage.microsites.values())
          .find(m => m.id === visit.micrositeId)?.domain;
        
        if (!domain) continue;
        if (region && region !== 'all') {
          const microsite = Array.from(tempStorage.microsites.values())
            .find(m => m.domain === domain);
          if ((microsite?.region || 'unknown') !== region) continue;
        }
        
        const campaign = visit.utmCampaign || 'Unknown Campaign';
        const visitDate = new Date(visit.createdAt);
        
        if (!dateFilter || (visitDate >= dateFilter.startDate && visitDate <= dateFilter.endDate)) {
          if (!campaignMap.has(campaign)) {
            campaignMap.set(campaign, { visits: 0, leads: 0 });
          }
          campaignMap.get(campaign).visits++;
        }
      }
      
      for (const [id, lead] of tempStorage.leads.entries()) {
        const domain = Array.from(tempStorage.microsites.values())
          .find(m => m.id === lead.micrositeId)?.domain;
        
        if (!domain) continue;
        if (region && region !== 'all') {
          const microsite = Array.from(tempStorage.microsites.values())
            .find(m => m.domain === domain);
          if ((microsite?.region || 'unknown') !== region) continue;
        }
        
        const campaign = lead.utmCampaign || 'Unknown Campaign';
        const leadDate = new Date(lead.createdAt);
        
        if (!dateFilter || (leadDate >= dateFilter.startDate && leadDate <= dateFilter.endDate)) {
          if (!campaignMap.has(campaign)) {
            campaignMap.set(campaign, { visits: 0, leads: 0 });
          }
          campaignMap.get(campaign).leads++;
        }
      }
      
      return Array.from(campaignMap.entries()).map(([name, stats]) => ({
        name,
        visits: stats.visits,
        leads: stats.leads,
        conversionRate: stats.visits > 0 ? ((stats.leads / stats.visits) * 100).toFixed(2) : 0
      }));
    } else {
      // Use Prisma for production
      let startDate, endDate;
      if (dateFilter) {
        startDate = dateFilter.startDate;
        endDate = dateFilter.endDate;
      } else {
        endDate = new Date();
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }
      
      const visitWhere = {
        isFromGoogleAds: true,
        createdAt: { gte: startDate, lte: endDate },
        utmCampaign: { not: null }
      };
      
      const leadWhere = {
        isFromGoogleAds: true,
        createdAt: { gte: startDate, lte: endDate },
        utmCampaign: { not: null }
      };
      
      if (region && region !== 'all') {
        // Filter by region through microsite relation
        const micrositesInRegion = await prisma.microsite.findMany({
          where: { region },
          select: { id: true }
        });
        const micrositeIds = micrositesInRegion.map(m => m.id);
        
        visitWhere.micrositeId = { in: micrositeIds };
        leadWhere.micrositeId = { in: micrositeIds };
      }
      
      const [visits, leads] = await Promise.all([
        prisma.visit.groupBy({
          by: ['utmCampaign'],
          where: visitWhere,
          _count: { id: true }
        }),
        prisma.lead.groupBy({
          by: ['utmCampaign'],
          where: leadWhere,
          _count: { id: true }
        })
      ]);
      
      const campaignMap = new Map();
      
      visits.forEach(v => {
        const campaign = v.utmCampaign || 'Unknown Campaign';
        campaignMap.set(campaign, {
          visits: v._count.id,
          leads: 0
        });
      });
      
      leads.forEach(l => {
        const campaign = l.utmCampaign || 'Unknown Campaign';
        if (!campaignMap.has(campaign)) {
          campaignMap.set(campaign, { visits: 0, leads: 0 });
        }
        campaignMap.get(campaign).leads = l._count.id;
      });
      
      return Array.from(campaignMap.entries()).map(([name, stats]) => ({
        name,
        visits: stats.visits,
        leads: stats.leads,
        conversionRate: stats.visits > 0 ? ((stats.leads / stats.visits) * 100).toFixed(2) : 0
      }));
    }
  },

  // Get all microsites with stats
  async getAllMicrosites(search = null, dateFilter = null, campaignFilter = null) {
    if (USE_TEMP_STORAGE) {
      // Determine date range
      let startDate, endDate;
      if (dateFilter) {
        startDate = dateFilter.startDate;
        endDate = dateFilter.endDate;
      } else {
        // Default to last 24 hours
        endDate = new Date();
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }
      
      const microsites = Array.from(tempStorage.microsites.values())
        .filter(m => !search || m.domain.toLowerCase().includes(search.toLowerCase()))
        .map(microsite => {
          const domain = microsite.domain;
          const visitIds = tempStorage.visitsByMicrosite.get(domain) || [];
          const leadIds = tempStorage.leadsByMicrosite.get(domain) || [];
          
          const visits = visitIds.map(id => tempStorage.visits.get(id)).filter(Boolean);
          const leads = leadIds.map(id => tempStorage.leads.get(id)).filter(Boolean);
          
          // Filter by date range
          const visitsInRange = visits.filter(v => {
            const visitDate = new Date(v.createdAt);
            return visitDate >= startDate && visitDate <= endDate;
          });
          const leadsInRange = leads.filter(l => {
            const leadDate = new Date(l.createdAt);
            return leadDate >= startDate && leadDate <= endDate;
          });
          
          // Filter by campaign if specified
          let filteredVisitsInRange = visitsInRange;
          let filteredLeadsInRange = leadsInRange;
          
          if (campaignFilter && campaignFilter !== 'all') {
            filteredVisitsInRange = visitsInRange.filter(v => 
              (v.utmCampaign || 'Unknown Campaign') === campaignFilter
            );
            filteredLeadsInRange = leadsInRange.filter(l => 
              (l.utmCampaign || 'Unknown Campaign') === campaignFilter
            );
          }
          
          // Get top campaign for this microsite (from date range visits)
          const campaignStats = new Map();
          filteredVisitsInRange.forEach(v => {
            const campaign = v.utmCampaign || 'Unknown Campaign';
            if (!campaignStats.has(campaign)) {
              campaignStats.set(campaign, { visits: 0, leads: 0 });
            }
            campaignStats.get(campaign).visits++;
          });
          filteredLeadsInRange.forEach(l => {
            const campaign = l.utmCampaign || 'Unknown Campaign';
            if (!campaignStats.has(campaign)) {
              campaignStats.set(campaign, { visits: 0, leads: 0 });
            }
            campaignStats.get(campaign).leads++;
          });
          
          // Find top campaign by visits
          let topCampaign = null;
          let maxVisits = 0;
          for (const [campaign, stats] of campaignStats.entries()) {
            if (stats.visits > maxVisits) {
              maxVisits = stats.visits;
              topCampaign = campaign;
            }
          }
          
          // All time stats
          const totalVisits = visits.length;
          const totalLeads = leads.length;
          
          // Date range stats for display (filtered by campaign if needed)
          const displayVisits = filteredVisitsInRange.length;
          const displayLeads = filteredLeadsInRange.length;
          
          // Separate test leads (leads without real email/phone) - in date range
          const testLeads = filteredLeadsInRange.filter(l => 
            !l.email || !l.phone || 
            (l.email && (l.email.includes('test') || l.email.includes('example')))
          ).length;
          
          // Conversion rate based on date range
          const conversionRate = displayVisits > 0 
            ? ((displayLeads / displayVisits) * 100).toFixed(2) 
            : 0;
          
          // Get status labels (use default if statusChecker not initialized)
          let websiteStatusLabel, formStatusLabel;
          if (statusChecker) {
            websiteStatusLabel = statusChecker.getStatusLabel({
              isLive: microsite.isLive,
              statusCode: microsite.statusCode,
              sslValid: microsite.sslValid,
              error: microsite.websiteError
            });
            formStatusLabel = statusChecker.getFormStatusLabel({
              hasForm: microsite.hasForm,
              formWorking: microsite.formWorking,
              error: microsite.formError
            });
          } else {
            websiteStatusLabel = { label: 'Unknown', color: 'gray', icon: '❓' };
            formStatusLabel = { label: 'Unknown', color: 'gray', icon: '❓' };
          }
          
          return {
            ...microsite,
            topCampaign, // Add top campaign info
            formWorking: microsite.formWorking,
            formLastChecked: microsite.formLastChecked,
            websiteLastChecked: microsite.websiteLastChecked,
            stats: {
              totalVisits,
              totalLeads,
              testLeads,
              visits24h: displayVisits,
              leads24h: displayLeads,
              conversionRate
            },
            alerts: {
              noVisit24h: displayVisits === 0,
              noLead24h: displayLeads === 0
            },
            websiteStatus: websiteStatusLabel,
            formStatus: formStatusLabel,
            lastActivity: microsite.updatedAt || microsite.createdAt
          };
        });
      
      return microsites.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else {
      // Use Prisma for production
      const where = search ? {
        domain: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};

      // Determine date range
      let startDate, endDate;
      if (dateFilter) {
        startDate = dateFilter.startDate;
        endDate = dateFilter.endDate;
      } else {
        // Default to last 24 hours
        endDate = new Date();
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      const microsites = await prisma.microsite.findMany({
        where,
        include: {
          _count: {
            select: {
              visits: true,
              leads: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return await Promise.all(
        microsites.map(async (site) => {
          // Date range filters
          const visitDateFilter = {
            micrositeId: site.id,
            isFromGoogleAds: true,
            createdAt: { gte: startDate, lte: endDate }
          };
          
          const leadDateFilter = {
            micrositeId: site.id,
            isFromGoogleAds: true,
            createdAt: { gte: startDate, lte: endDate }
          };
          
          // Add campaign filter if specified
          if (campaignFilter && campaignFilter !== 'all') {
            visitDateFilter.utmCampaign = campaignFilter;
            leadDateFilter.utmCampaign = campaignFilter;
          }

          const [totalVisits, totalLeads, visitsInRange, leadsInRange, testLeadsCount, topCampaignData] = await Promise.all([
            prisma.visit.count({
              where: {
                micrositeId: site.id,
                isFromGoogleAds: true
              }
            }),
            prisma.lead.count({
              where: {
                micrositeId: site.id,
                isFromGoogleAds: true
              }
            }),
            prisma.visit.count({
              where: visitDateFilter
            }),
            prisma.lead.count({
              where: leadDateFilter
            }),
            prisma.lead.count({
              where: {
                ...leadDateFilter,
                OR: [
                  { email: { contains: 'test' } },
                  { email: { contains: 'example' } },
                  { email: null },
                  { phone: null }
                ]
              }
            }),
            // Get top campaign for this microsite
            prisma.visit.groupBy({
              by: ['utmCampaign'],
              where: visitDateFilter,
              _count: { id: true },
              orderBy: { _count: { id: 'desc' } },
              take: 1
            })
          ]);
          
          const topCampaign = topCampaignData.length > 0 
            ? (topCampaignData[0].utmCampaign || 'Unknown Campaign')
            : null;

          // Conversion rate based on date range
          const conversionRate = visitsInRange > 0 
            ? ((leadsInRange / visitsInRange) * 100).toFixed(2) 
            : 0;

          // Get status labels
          const websiteStatusLabel = statusChecker ? statusChecker.getStatusLabel({
            isLive: site.isLive,
            statusCode: site.statusCode,
            sslValid: site.sslValid,
            error: site.websiteError
          }) : { label: 'Unknown', color: 'gray', icon: '❓' };
          
          const formStatusLabel = statusChecker ? statusChecker.getFormStatusLabel({
            hasForm: site.hasForm,
            formWorking: site.formWorking,
            error: site.formError
          }) : { label: 'Unknown', color: 'gray', icon: '❓' };

          return {
            ...site,
            topCampaign, // Add top campaign info
            formWorking: site.formWorking,
            formLastChecked: site.formLastChecked,
            websiteLastChecked: site.websiteLastChecked,
            stats: {
              totalVisits,
              totalLeads,
              testLeads: testLeadsCount,
              visits24h: visitsInRange,
              leads24h: leadsInRange,
              conversionRate
            },
            alerts: {
              noVisit24h: visitsInRange === 0,
              noLead24h: leadsInRange === 0
            },
            websiteStatus: websiteStatusLabel,
            formStatus: formStatusLabel,
            lastActivity: site.updatedAt || site.createdAt
          };
        })
      );
    }
  },

  // Cleanup old data (for local testing - delete data older than 1 minute)
  cleanupOldData() {
    if (!USE_TEMP_STORAGE) return 0;
    
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    let deleted = 0;
    
    // Delete old visits
    for (const [id, visit] of tempStorage.visits.entries()) {
      if (new Date(visit.createdAt) < oneMinuteAgo) {
        tempStorage.visits.delete(id);
        deleted++;
        
        // Remove from microsite tracking
        const domain = Array.from(tempStorage.microsites.values())
          .find(m => m.id === visit.micrositeId)?.domain;
        if (domain && tempStorage.visitsByMicrosite.has(domain)) {
          const visitIds = tempStorage.visitsByMicrosite.get(domain);
          const index = visitIds.indexOf(id);
          if (index > -1) visitIds.splice(index, 1);
        }
      }
    }
    
    // Delete old leads
    for (const [id, lead] of tempStorage.leads.entries()) {
      if (new Date(lead.createdAt) < oneMinuteAgo) {
        tempStorage.leads.delete(id);
        deleted++;
        
        // Remove from microsite tracking
        const domain = Array.from(tempStorage.microsites.values())
          .find(m => m.id === lead.micrositeId)?.domain;
        if (domain && tempStorage.leadsByMicrosite.has(domain)) {
          const leadIds = tempStorage.leadsByMicrosite.get(domain);
          const index = leadIds.indexOf(id);
          if (index > -1) leadIds.splice(index, 1);
        }
      }
    }
    
    // Clean up empty microsites (no visits or leads)
    for (const [id, microsite] of tempStorage.microsites.entries()) {
      const domain = microsite.domain;
      const visitIds = tempStorage.visitsByMicrosite.get(domain) || [];
      const leadIds = tempStorage.leadsByMicrosite.get(domain) || [];
      
      if (visitIds.length === 0 && leadIds.length === 0) {
        tempStorage.microsites.delete(id);
      }
    }
    
    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} old records (older than 1 minute)`);
    }
    
    return deleted;
  },

  // Get storage mode
  getStorageMode() {
    return USE_TEMP_STORAGE ? 'TEMPORARY (Local - Auto-deletes after 1 min)' : 'PERMANENT (Production - Database)';
  }
};

// Import status checker (will be set by init)
let statusChecker = null;

function setStatusChecker(checker) {
  statusChecker = checker;
}

module.exports = { storage, init, tempStorage, setStatusChecker };
