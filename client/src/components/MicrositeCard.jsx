import React from 'react';
import { FiTrendingUp, FiUsers, FiMail, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import './MicrositeCard.css';

const MicrositeCard = ({ microsite }) => {
  const { stats, alerts, domain, updatedAt } = microsite;
  const conversionRate = parseFloat(stats.conversionRate);

  return (
    <div className={`microsite-card ${alerts.noVisit24h || alerts.noLead24h ? 'has-alert' : ''}`}>
      <div className="card-header">
        <div className="domain-info">
          <h3 className="domain-name">
            <FiExternalLink className="link-icon" />
            {domain}
          </h3>
          <p className="last-updated">
            Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
          </p>
        </div>
        {(alerts.noVisit24h || alerts.noLead24h) && (
          <div className="alert-indicator">
            <FiAlertCircle />
          </div>
        )}
      </div>

      <div className="card-stats">
        <div className="stat-item">
          <div className="stat-header">
            <FiUsers className="stat-icon" />
            <span className="stat-label">Total Visits</span>
          </div>
          <div className="stat-value">{stats.totalVisits.toLocaleString()}</div>
          <div className="stat-sub">Last 24h: {stats.visits24h}</div>
        </div>

        <div className="stat-item">
          <div className="stat-header">
            <FiMail className="stat-icon" />
            <span className="stat-label">Total Leads</span>
          </div>
          <div className="stat-value">{stats.totalLeads.toLocaleString()}</div>
          <div className="stat-sub">Last 24h: {stats.leads24h}</div>
        </div>

        <div className="stat-item">
          <div className="stat-header">
            <FiTrendingUp className="stat-icon" />
            <span className="stat-label">Conversion Rate</span>
          </div>
          <div className="stat-value">{conversionRate}%</div>
          <div className="stat-sub">From Google Ads</div>
        </div>
      </div>

      {(alerts.noVisit24h || alerts.noLead24h) && (
        <div className="alert-message">
          {alerts.noVisit24h && (
            <span className="alert-text">⚠️ No visits in 24h</span>
          )}
          {alerts.noLead24h && (
            <span className="alert-text">⚠️ No leads in 24h</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MicrositeCard;

