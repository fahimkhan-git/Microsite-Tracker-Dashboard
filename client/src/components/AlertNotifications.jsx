import React from 'react';
import { FiAlertTriangle, FiAlertCircle, FiAlertOctagon, FiInfo } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import './AlertNotifications.css';

const AlertNotifications = ({ microsites, dateRange }) => {
  const getAlerts = () => {
    const alerts = [];
    const now = new Date();
    
    // Determine time ranges based on date filter or default to 24h
    let checkPeriod = 24; // Default to 24 hours
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      checkPeriod = (end - start) / (1000 * 60 * 60); // Hours in date range
    }
    
    microsites.forEach((site, index) => {
      const lastActivity = new Date(site.lastActivity);
      const hoursAgo = (now - lastActivity) / (1000 * 60 * 60);
      
      // Check visits - based on date range or time since last activity
      const visits24h = site.stats.visits24h || 0;
      
      if (visits24h === 0) {
        if (hoursAgo >= 24 && hoursAgo < 48) {
          alerts.push({
            serial: index + 1,
            domain: site.domain,
            campaign: site.topCampaign || 'N/A',
            type: 'no-visits-24h',
            severity: 'warning',
            message: 'No visits in last 24 hours',
            timeAgo: formatDistanceToNow(new Date(now.getTime() - 24 * 60 * 60 * 1000), { addSuffix: false })
          });
        } else if (hoursAgo >= 48 && hoursAgo < 72) {
          alerts.push({
            serial: index + 1,
            domain: site.domain,
            campaign: site.topCampaign || 'N/A',
            type: 'no-visits-48h',
            severity: 'error',
            message: 'No visits in last 48 hours',
            timeAgo: formatDistanceToNow(new Date(now.getTime() - 48 * 60 * 60 * 1000), { addSuffix: false })
          });
        } else if (hoursAgo >= 72) {
          alerts.push({
            serial: index + 1,
            domain: site.domain,
            campaign: site.topCampaign || 'N/A',
            type: 'no-visits-72h',
            severity: 'critical',
            message: 'No visits in last 72 hours',
            timeAgo: formatDistanceToNow(new Date(now.getTime() - 72 * 60 * 60 * 1000), { addSuffix: false })
          });
        }
      }
      
      // Check leads - 24h, 48h, 72h
      const leads24h = site.stats.leads24h || 0;
      
      if (leads24h === 0 && visits24h > 0) {
        if (hoursAgo >= 24 && hoursAgo < 48) {
          alerts.push({
            serial: index + 1,
            domain: site.domain,
            campaign: site.topCampaign || 'N/A',
            type: 'no-leads-24h',
            severity: 'warning',
            message: 'No leads in last 24 hours',
            timeAgo: formatDistanceToNow(new Date(now.getTime() - 24 * 60 * 60 * 1000), { addSuffix: false })
          });
        } else if (hoursAgo >= 48 && hoursAgo < 72) {
          alerts.push({
            serial: index + 1,
            domain: site.domain,
            campaign: site.topCampaign || 'N/A',
            type: 'no-leads-48h',
            severity: 'error',
            message: 'No leads in last 48 hours',
            timeAgo: formatDistanceToNow(new Date(now.getTime() - 48 * 60 * 60 * 1000), { addSuffix: false })
          });
        } else if (hoursAgo >= 72) {
          alerts.push({
            serial: index + 1,
            domain: site.domain,
            campaign: site.topCampaign || 'N/A',
            type: 'no-leads-72h',
            severity: 'critical',
            message: 'No leads in last 72 hours',
            timeAgo: formatDistanceToNow(new Date(now.getTime() - 72 * 60 * 60 * 1000), { addSuffix: false })
          });
        }
      }
      
      // Check conversion rate - low conversion
      const conversionRate = parseFloat(site.stats.conversionRate) || 0;
      if (conversionRate > 0 && conversionRate < 1 && visits24h >= 10) {
        alerts.push({
          serial: index + 1,
          domain: site.domain,
          campaign: site.topCampaign || 'N/A',
          type: 'low-conversion',
          severity: 'warning',
          message: `Low conversion rate: ${conversionRate}%`,
          timeAgo: 'Current'
        });
      }
      
      // Check form status - form not working
      if (site.formStatus) {
        const formStatus = site.formStatus.label || '';
        const formWorking = site.formWorking !== false; // Default to true if not checked
        
        // Check if form has error or is not working
        if (formStatus.includes('Error') || formStatus.includes('No Form') || !formWorking) {
          // Get form last checked time from the microsite data
          // We need to check when form was last checked
          const websiteLastChecked = site.websiteLastChecked ? new Date(site.websiteLastChecked) : null;
          const formLastChecked = site.formLastChecked ? new Date(site.formLastChecked) : websiteLastChecked;
          
          if (formLastChecked) {
            const formHoursAgo = (now - formLastChecked) / (1000 * 60 * 60);
            
            if (formHoursAgo >= 1 && formHoursAgo < 2) {
              alerts.push({
                serial: index + 1,
                domain: site.domain,
                campaign: site.topCampaign || 'N/A',
                type: 'form-error-1h',
                severity: 'warning',
                message: `Form not working (${formStatus})`,
                timeAgo: formatDistanceToNow(formLastChecked, { addSuffix: true })
              });
            } else if (formHoursAgo >= 2 && formHoursAgo < 24) {
              alerts.push({
                serial: index + 1,
                domain: site.domain,
                campaign: site.topCampaign || 'N/A',
                type: 'form-error-2h',
                severity: 'error',
                message: `Form not working (${formStatus})`,
                timeAgo: formatDistanceToNow(formLastChecked, { addSuffix: true })
              });
            } else if (formHoursAgo >= 24) {
              alerts.push({
                serial: index + 1,
                domain: site.domain,
                campaign: site.topCampaign || 'N/A',
                type: 'form-error-1day',
                severity: 'critical',
                message: `Form not working (${formStatus})`,
                timeAgo: formatDistanceToNow(formLastChecked, { addSuffix: true })
              });
            }
          } else if (formStatus.includes('Error') || formStatus.includes('No Form')) {
            // Form has error but no check time available
            alerts.push({
              serial: index + 1,
              domain: site.domain,
              campaign: site.topCampaign || 'N/A',
              type: 'form-error',
              severity: 'error',
              message: `Form not working (${formStatus})`,
              timeAgo: 'Not checked recently'
            });
          }
        }
      }
    });
    
    // Sort by severity: critical > error > warning > info
    const severityOrder = { critical: 4, error: 3, warning: 2, info: 1 };
    return alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  };

  const alerts = getAlerts();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '🔴' };
      case 'error':
        return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '🟠' };
      case 'warning':
        return { bg: '#fef9c3', border: '#eab308', text: '#713f12', icon: '🟡' };
      default:
        return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' };
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <FiAlertOctagon />;
      case 'error':
        return <FiAlertCircle />;
      case 'warning':
        return <FiAlertTriangle />;
      default:
        return <FiInfo />;
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="alert-notifications-container">
        <div className="alerts-header">
          <h3>Alert Notifications</h3>
          <span className="alerts-count">0 Alerts</span>
        </div>
        <div className="alerts-empty">
          <p>✅ No alerts at this time. All systems are running smoothly!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-notifications-container">
      <div className="alerts-header">
        <h3>Alert Notifications</h3>
        <span className="alerts-count-badge">{alerts.length} Alert{alerts.length > 1 ? 's' : ''}</span>
      </div>
      <div className="alerts-scroll-box">
        {alerts.map((alert, index) => {
          const severity = getSeverityColor(alert.severity);
          return (
            <div
              key={`${alert.domain}-${alert.type}-${index}`}
              className="alert-item"
              style={{
                backgroundColor: severity.bg,
                borderLeft: `4px solid ${severity.border}`
              }}
            >
              <div className="alert-serial">{alert.serial}</div>
              <div className="alert-icon" style={{ color: severity.border }}>
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="alert-content">
                <div className="alert-main">
                  <span className="alert-domain">{alert.domain}</span>
                  <span className="alert-campaign">Campaign: {alert.campaign}</span>
                </div>
                <div className="alert-message" style={{ color: severity.text }}>
                  {alert.message}
                </div>
              </div>
              <div className="alert-time" style={{ color: severity.text }}>
                {alert.timeAgo}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertNotifications;

