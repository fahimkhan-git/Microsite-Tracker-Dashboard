// Centralized API/WS URL resolution for all environments
function resolveApiBase() {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && typeof envUrl === 'string') return envUrl;

  try {
    const origin = window.location.origin;
    // If running on Cloudflare Pages or Workers, default to the Worker API
    if (origin.includes('pages.dev') || origin.includes('workers.dev')) {
      return 'https://microsite-tracker-dashboard.fahimkhann2022.workers.dev/api';
    }
    // Otherwise assume same-origin backend
    return origin + '/api';
  } catch (e) {
    // Safe fallback to Worker API
    return 'https://microsite-tracker-dashboard.fahimkhann2022.workers.dev/api';
  }
}

function toWsUrl(httpUrl) {
  try {
    if (!httpUrl) return '';
    return httpUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:').replace(/\/?api$/, '');
  } catch {
    return '';
  }
}

export const API_URL = resolveApiBase();
export const WS_URL = process.env.REACT_APP_WS_URL || toWsUrl(API_URL);


