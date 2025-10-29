/**
 * Website Status and Form Status Checker
 * Checks if website is live, SSL status, and form functionality
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Status checking functions
const statusChecker = {
  /**
   * Check if website is live and accessible
   */
  async checkWebsiteStatus(domain) {
    const status = {
      isLive: false,
      statusCode: null,
      sslValid: false,
      sslExpiry: null,
      error: null,
      responseTime: null,
      lastChecked: new Date()
    };

    try {
      // Normalize domain
      let url = domain;
      if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        url = `https://${domain}`;
      }

      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      const port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      return new Promise((resolve) => {
        const startTime = Date.now();
        const timeout = 10000; // 10 second timeout

        const req = protocol.request({
          hostname,
          port,
          path: parsedUrl.pathname || '/',
          method: 'HEAD',
          timeout,
          rejectUnauthorized: false // Allow self-signed certs to check if site is accessible
        }, (res) => {
          const responseTime = Date.now() - startTime;
          
          status.isLive = true;
          status.statusCode = res.statusCode;
          status.responseTime = responseTime;

          // Check SSL if HTTPS
          if (protocol === https && res.socket) {
            const cert = res.socket.getPeerCertificate(false);
            if (cert && cert.valid_to) {
              status.sslValid = true;
              status.sslExpiry = new Date(cert.valid_to);
              
              // Check if SSL is expired or expiring soon (within 7 days)
              const now = new Date();
              const daysUntilExpiry = (status.sslExpiry - now) / (1000 * 60 * 60 * 24);
              if (daysUntilExpiry < 0) {
                status.error = 'SSL Certificate Expired';
              } else if (daysUntilExpiry < 7) {
                status.error = `SSL Expiring in ${Math.floor(daysUntilExpiry)} days`;
              }
            }
          }

          if (res.statusCode >= 400) {
            status.error = `HTTP Error ${res.statusCode}`;
          }

          resolve(status);
        });

        req.on('error', (err) => {
          status.error = err.message;
          status.isLive = false;
          
          // Try HTTP if HTTPS failed
          if (url.startsWith('https://')) {
            return statusChecker.checkWebsiteStatus(`http://${domain}`).then(resolve);
          }
          
          resolve(status);
        });

        req.on('timeout', () => {
          req.destroy();
          status.error = 'Connection Timeout';
          status.isLive = false;
          resolve(status);
        });

        req.end();
      });
    } catch (error) {
      status.error = error.message;
      status.isLive = false;
      return status;
    }
  },

  /**
   * Check form status by attempting to find forms on the page
   */
  async checkFormStatus(domain) {
    const status = {
      hasForm: false,
      formCount: 0,
      formWorking: null, // null = unknown, true = working, false = broken
      error: null,
      lastChecked: new Date()
    };

    try {
      let url = domain;
      if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        url = `https://${domain}`;
      }

      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      const port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      return new Promise((resolve) => {
        protocol.get({
          hostname,
          port,
          path: '/',
          timeout: 10000,
          rejectUnauthorized: false
        }, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            // Simple form detection (look for form tags)
            const formRegex = /<form[^>]*>/gi;
            const forms = data.match(formRegex);

            if (forms && forms.length > 0) {
              status.hasForm = true;
              status.formCount = forms.length;
              status.formWorking = true; // Assume working if forms found
            } else {
              status.hasForm = false;
              status.formWorking = false;
            }

            resolve(status);
          });
        }).on('error', (err) => {
          status.error = err.message;
          status.formWorking = false;
          resolve(status);
        }).on('timeout', () => {
          status.error = 'Request Timeout';
          status.formWorking = false;
          resolve(status);
        });
      });
    } catch (error) {
      status.error = error.message;
      status.formWorking = false;
      return status;
    }
  },

  /**
   * Get overall website status
   */
  getStatusLabel(websiteStatus) {
    if (!websiteStatus || !websiteStatus.isLive) {
      return { label: 'Offline', color: 'red', icon: '🔴' };
    }

    if (websiteStatus.error) {
      if (websiteStatus.error.includes('SSL')) {
        return { label: 'SSL Issue', color: 'orange', icon: '⚠️' };
      }
      if (websiteStatus.error.includes('HTTP Error')) {
        return { label: 'Error', color: 'orange', icon: '⚠️' };
      }
    }

    if (websiteStatus.statusCode >= 400) {
      return { label: 'Error', color: 'orange', icon: '⚠️' };
    }

    if (!websiteStatus.sslValid && websiteStatus.lastChecked) {
      return { label: 'HTTP Only', color: 'yellow', icon: '🟡' };
    }

    return { label: 'Live', color: 'green', icon: '🟢' };
  },

  /**
   * Get form status label
   */
  getFormStatusLabel(formStatus) {
    if (!formStatus) {
      return { label: 'Unknown', color: 'gray', icon: '❓' };
    }

    if (!formStatus.hasForm) {
      return { label: 'No Form', color: 'red', icon: '❌' };
    }

    if (formStatus.formWorking === false) {
      return { label: 'Form Error', color: 'red', icon: '❌' };
    }

    if (formStatus.formWorking === true) {
      return { label: 'Active', color: 'green', icon: '✅' };
    }

    return { label: 'Checking...', color: 'yellow', icon: '⏳' };
  }
};

module.exports = statusChecker;

