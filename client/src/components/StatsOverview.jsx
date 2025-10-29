import React from 'react';
import { FiBarChart2, FiUsers, FiMail, FiTrendingUp } from 'react-icons/fi';
import './StatsOverview.css';

const StatsOverview = ({ stats, micrositeCount }) => {
  const overallConversionRate = stats.visits24h > 0 
    ? ((stats.leads24h / stats.visits24h) * 100).toFixed(2)
    : 0;

  return (
    <div className="stats-overview">
      <div className="overview-header">
        <h2>Overview</h2>
        <span className="microsite-count">{micrositeCount} Microsites</span>
      </div>
      
      <div className="stats-grid">
        <div className="overview-stat-card">
          <div className="stat-icon-wrapper blue">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.visits24h.toLocaleString()}</div>
            <div className="stat-title">Visits (Date Range)</div>
            <div className="stat-change">Total: {stats.totalVisits.toLocaleString()}</div>
          </div>
        </div>

        <div className="overview-stat-card">
          <div className="stat-icon-wrapper green">
            <FiMail />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.leads24h.toLocaleString()}</div>
            <div className="stat-title">Leads (Date Range)</div>
            <div className="stat-change">Total: {stats.totalLeads.toLocaleString()}</div>
          </div>
        </div>

        <div className="overview-stat-card">
          <div className="stat-icon-wrapper purple">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-number">{overallConversionRate}%</div>
            <div className="stat-title">Conversion Rate</div>
            <div className="stat-change">{stats.visits24h > 0 ? `${stats.leads24h}/${stats.visits24h}` : 'N/A'}</div>
          </div>
        </div>

        <div className="overview-stat-card">
          <div className="stat-icon-wrapper orange">
            <FiBarChart2 />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.testLeads || 0}</div>
            <div className="stat-title">Test Leads</div>
            <div className="stat-change">In Date Range</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;

