import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { API_URL } from '../../config';
import './MicrositeTable.css';

// Use centralized resolved API URL

const MicrositeTable = ({ microsites, onRefresh }) => {
  const handleCheckStatus = async (domain) => {
    try {
      await axios.post(`${API_URL}/microsites/${encodeURIComponent(domain)}/check-status`);
      onRefresh();
    } catch (error) {
      console.error('Error checking status:', error);
      alert('Failed to check status. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return { label: 'Unknown', color: 'gray', icon: '❓' };
    
    const colors = {
      green: '#10b981',
      red: '#ef4444',
      orange: '#f59e0b',
      yellow: '#eab308',
      gray: '#6b7280'
    };
    
    return (
      <span 
        className="status-badge" 
        style={{ 
          backgroundColor: colors[status.color] || colors.gray,
          color: 'white'
        }}
      >
        <span className="status-icon">{status.icon}</span>
        {status.label}
      </span>
    );
  };


  return (
    <div className="microsite-table-container">
      <table className="microsite-table">
            <thead>
              <tr>
                <th className="sticky-col serial-col">#</th>
                <th className="sticky-col website-col">Website</th>
                <th className="align-right">Visitors</th>
                <th className="align-right">Leads</th>
                <th className="align-right">Test Leads</th>
                <th className="align-right">Conversion %</th>
                <th className="align-center">Website Status</th>
                <th className="align-center">Form Status</th>
                <th className="align-center">Last Activity</th>
                <th className="align-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {microsites.length === 0 ? (
                <tr>
                  <td colSpan="10" className="empty-state">
                    No microsites found. Start tracking by adding the tracking script to your sites.
                  </td>
                </tr>
              ) : (
                microsites.map((microsite, index) => {
                  const conversionRate = parseFloat(microsite.stats.conversionRate) || 0;
                  
                  return (
                    <tr 
                      key={microsite.id} 
                      className={microsite.alerts.noVisit24h || microsite.alerts.noLead24h ? 'has-alert' : ''}
                      data-region={microsite.region || 'unknown'}
                    >
                      <td className="serial-cell sticky-col">{index + 1}</td>
                      <td className="website-cell sticky-col">
                        <a 
                          href={`https://${microsite.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="domain-link"
                        >
                          <FiExternalLink className="link-icon" />
                          {microsite.domain}
                        </a>
                      </td>
                  <td className="number-cell align-right">
                    <strong>{microsite.stats.visits24h.toLocaleString()}</strong>
                    <span className="sub-text">Total: {microsite.stats.totalVisits.toLocaleString()}</span>
                  </td>
                  <td className="number-cell align-right">
                    <strong>{microsite.stats.leads24h.toLocaleString()}</strong>
                    <span className="sub-text">Total: {microsite.stats.totalLeads.toLocaleString()}</span>
                  </td>
                  <td className="number-cell align-right">
                    <span className="test-leads">{microsite.stats.testLeads || 0}</span>
                  </td>
                  <td className="number-cell align-right">
                    <strong>{conversionRate}%</strong>
                  </td>
                  <td className="status-cell align-center">
                    {getStatusBadge(microsite.websiteStatus)}
                  </td>
                  <td className="status-cell align-center">
                    {getStatusBadge(microsite.formStatus)}
                  </td>
                  <td className="activity-cell align-center">
                    {formatDistanceToNow(new Date(microsite.lastActivity), { addSuffix: true })}
                  </td>
                  <td className="actions-cell align-center">
                    <button
                      onClick={() => handleCheckStatus(microsite.domain)}
                      className="check-status-btn"
                      title="Check website and form status"
                    >
                      <FiRefreshCw />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MicrositeTable;

