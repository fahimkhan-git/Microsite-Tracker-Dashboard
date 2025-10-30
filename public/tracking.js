/**
 * Universal Microsite Tracking Script
 * Load this script on any microsite to track Google Ads visits and leads
 * 
 * Usage:
 * <script src="https://your-api-domain.com/tracking.js"></script>
 * <script>
 *   window.LiveAnalyticsConfig = {
 *     gtmId: "GTM-5PHH5D6T",
 *     siteName: "www.example.com",
 *     siteUrl: "https://www.example.com"
 *   };
 * </script>
 */

(function() {
  'use strict';

  // Wait for config to be set (give it 100ms)
  function initTracking() {
    const config = window.LiveAnalyticsConfig;
    
    if (!config) {
      console.warn('LiveAnalytics: Config not found. Make sure window.LiveAnalyticsConfig is set.');
      return;
    }

    if (!config.siteName || !config.siteUrl) {
      console.error('LiveAnalytics: siteName and siteUrl are required in config');
      return;
    }

    // Get API URL from script src or use default
    const scriptTag = document.currentScript || document.querySelector('script[src*="tracking.js"]');
    let apiUrl = 'http://localhost:3001/api';
    
    if (scriptTag && scriptTag.src) {
      try {
        const url = new URL(scriptTag.src);
        apiUrl = url.origin + '/api';
      } catch (e) {
        // If URL parsing fails (e.g., relative path), use default
        console.warn('LiveAnalytics: Could not parse script URL, using default');
      }
    }
    
    // Log API URL for debugging (remove in production if needed)
    if (window.console && console.log) {
      console.log('LiveAnalytics: API URL set to', apiUrl);
    }

    // Extract domain from siteUrl or siteName
    const domain = config.siteName.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Get URL parameters
    function getUrlParameter(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      const results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Check if traffic is from Google Ads
    function isFromGoogleAds() {
      const gclid = getUrlParameter('gclid');
      const utmSource = getUrlParameter('utm_source');
      const utmMedium = getUrlParameter('utm_medium');
      
      // Google Click ID is the primary indicator
      if (gclid) return true;
      
      // Check UTM parameters
      if (utmSource && utmSource.toLowerCase() === 'google' && 
          utmMedium && (utmMedium.toLowerCase() === 'cpc' || utmMedium.toLowerCase() === 'ppc')) {
        return true;
      }
      
      return false;
    }

    // Track visit from Google Ads
    function trackVisit() {
      if (!isFromGoogleAds()) {
        return; // Only track Google Ads traffic
      }

      const visitData = {
        domain: domain,
        gclid: getUrlParameter('gclid'),
        utm_source: getUrlParameter('utm_source'),
        utm_medium: getUrlParameter('utm_medium'),
        utm_campaign: getUrlParameter('utm_campaign'),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      };

      // Send tracking data
      fetch(apiUrl + '/track/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitData)
      }).catch(err => {
        if (window.console && console.error) {
          console.error('LiveAnalytics: Visit tracking error:', err);
        }
      });
    }

    // Track lead (called when form is submitted)
    window.trackMicrositeLead = function(formData) {
      if (!isFromGoogleAds()) {
        return; // Only track Google Ads traffic
      }

      const leadData = {
        domain: domain,
        gclid: getUrlParameter('gclid'),
        utm_source: getUrlParameter('utm_source'),
        utm_medium: getUrlParameter('utm_medium'),
        utm_campaign: getUrlParameter('utm_campaign'),
        email: formData.email || '',
        phone: formData.phone || '',
        name: formData.name || '',
        form_data: formData
      };

      // Send tracking data
      fetch(apiUrl + '/track/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      }).catch(err => {
        if (window.console && console.error) {
          console.error('LiveAnalytics: Lead tracking error:', err);
        }
      });
    };

    // Initialize GTM if gtmId is provided
    if (config.gtmId) {
      // Defer GTM to improve LCP
      setTimeout(function() {
        (function(w,d,s,l,i){
          if(!w[l]){w[l]=[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});}
          var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;
          j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
          if(f && f.parentNode){f.parentNode.insertBefore(j,f);}
        })(window,document,'script','dataLayer',config.gtmId);
      }, 2000);
    }

    // Track page view when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trackVisit);
    } else {
      trackVisit();
    }

    // Auto-track form submissions
    document.addEventListener('submit', function(e) {
      const form = e.target;
      if (form.tagName === 'FORM' && isFromGoogleAds()) {
        const formData = new FormData(form);
        const formObj = {};
        
        // Extract common form fields
        if (formData.has('email')) formObj.email = formData.get('email');
        if (formData.has('phone')) formObj.phone = formData.get('phone');
        if (formData.has('name')) formObj.name = formData.get('name');
        if (formData.has('full_name')) formObj.name = formData.get('full_name');
        
        // Collect all form data
        for (let [key, value] of formData.entries()) {
          if (!formObj[key]) {
            formObj[key] = value;
          }
        }
        
        // Track lead after a short delay to ensure form submission
        setTimeout(function() {
          window.trackMicrositeLead(formObj);
        }, 100);
      }
    }, true);

    // Log successful initialization
    if (window.console && console.log) {
      console.log('LiveAnalytics: Tracking initialized for', domain);
    }
  }

  // Initialize immediately or wait for config
  if (window.LiveAnalyticsConfig) {
    initTracking();
  } else {
    // Wait a bit for config to be set (if script loads before config)
    setTimeout(function() {
      if (window.LiveAnalyticsConfig) {
        initTracking();
      }
    }, 100);
  }
})();

