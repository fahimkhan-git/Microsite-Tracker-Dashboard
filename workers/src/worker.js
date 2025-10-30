/**
 * Cloudflare Worker for Microsite Tracking (Hybrid Approach)
 * 
 * This worker:
 * 1. Serves tracking.js script (proxies from Express backend)
 * 2. Handles /api/track/visit and /api/track/lead (forwards to Express backend)
 * 
 * Benefits:
 * - No sleep (always available)
 * - Global edge network (fast)
 * - Free tier (100k requests/day)
 * - Dashboard stays on Express (full features)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Get backend URL from environment
    const backendUrl = env.BACKEND_URL || 'https://your-backend.onrender.com';

    // Serve tracking.js script (proxy from Express backend)
    if (url.pathname === '/tracking.js' || url.pathname === '/tracking.js') {
      return handleTrackingScript(request, backendUrl, corsHeaders);
    }

    // Track visit endpoint (forward to Express backend)
    if (url.pathname === '/api/track/visit' && request.method === 'POST') {
      return handleTrackVisit(request, backendUrl, corsHeaders);
    }

    // Track lead endpoint (forward to Express backend)
    if (url.pathname === '/api/track/lead' && request.method === 'POST') {
      return handleTrackLead(request, backendUrl, corsHeaders);
    }

    // Health check
    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'Cloudflare Worker',
        timestamp: new Date().toISOString(),
        backend: backendUrl,
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Not found
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  },
};

/**
 * Serve tracking.js script
 * Proxies from Express backend with edge caching
 */
async function handleTrackingScript(request, backendUrl, corsHeaders) {
  try {
    // Fetch tracking.js from Express backend
    const backendResponse = await fetch(`${backendUrl}/tracking.js`, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'Cloudflare-Worker',
      },
    });

    if (!backendResponse.ok) {
      return new Response(`// Error loading tracking script from ${backendUrl}`, {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/javascript',
        },
      });
    }

    const script = await backendResponse.text();

    // Return with caching headers
    return new Response(script, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache at edge for 1 hour
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return new Response(`// Error: ${error.message}`, {
      status: 502,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/javascript',
      },
    });
  }
}

/**
 * Handle visit tracking
 * Forwards to Express backend for database storage
 */
async function handleTrackVisit(request, backendUrl, corsHeaders) {
  try {
    // Get request body
    const data = await request.json();

    // Basic validation
    if (!data.domain) {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Forward to Express backend
    const backendResponse = await fetch(`${backendUrl}/api/track/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('User-Agent') || 'Cloudflare-Worker',
        'CF-Connecting-IP': request.headers.get('CF-Connecting-IP') || '',
      },
      body: JSON.stringify(data),
    });

    const responseData = await backendResponse.text();
    let jsonData;
    try {
      jsonData = JSON.parse(responseData);
    } catch {
      jsonData = { message: responseData };
    }

    // Return response from backend
    return new Response(JSON.stringify(jsonData), {
      status: backendResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * Handle lead tracking
 * Forwards to Express backend for database storage
 */
async function handleTrackLead(request, backendUrl, corsHeaders) {
  try {
    // Get request body
    const data = await request.json();

    // Basic validation
    if (!data.domain) {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Forward to Express backend
    const backendResponse = await fetch(`${backendUrl}/api/track/lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('User-Agent') || 'Cloudflare-Worker',
        'CF-Connecting-IP': request.headers.get('CF-Connecting-IP') || '',
      },
      body: JSON.stringify(data),
    });

    const responseData = await backendResponse.text();
    let jsonData;
    try {
      jsonData = JSON.parse(responseData);
    } catch {
      jsonData = { message: responseData };
    }

    // Return response from backend
    return new Response(JSON.stringify(jsonData), {
      status: backendResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}

