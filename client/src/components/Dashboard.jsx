import React, { useState } from 'react';
import MicrositeCard from './MicrositeCard';
import MicrositeTable from './MicrositeTable';
import StatsOverview from './StatsOverview';
import DateFilter from './DateFilter';
import CampaignFilter from './CampaignFilter';
import AlertNotifications from './AlertNotifications';
import './Dashboard.css';

const Dashboard = ({ microsites, loading, onRefresh, dateRange, setDateRange, regionFilter, campaignFilter, setCampaignFilter, sortBy, setSortBy, sortOrder, setSortOrder }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  
  // Calculate stats from filtered microsites (based on date range)
  const totalStats = microsites.reduce(
    (acc, site) => ({
      totalVisits: acc.totalVisits + site.stats.totalVisits,
      totalLeads: acc.totalLeads + site.stats.totalLeads,
      visits24h: acc.visits24h + site.stats.visits24h, // This is already filtered by date range
      leads24h: acc.leads24h + site.stats.leads24h, // This is already filtered by date range
      testLeads: acc.testLeads + (site.stats.testLeads || 0)
    }),
    { totalVisits: 0, totalLeads: 0, visits24h: 0, leads24h: 0, testLeads: 0 }
  );
  
  const handleDateChange = (startDate, endDate) => {
    onRefresh();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading microsite data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <StatsOverview stats={totalStats} micrositeCount={microsites.length} />
        
        <div className="microsites-section">
          <div className="section-header">
            <h2 className="section-title">
              All Microsites ({microsites.length})
            </h2>
            <div className="view-toggle">
              <button
                className={viewMode === 'table' ? 'active' : ''}
                onClick={() => setViewMode('table')}
              >
                Table View
              </button>
              <button
                className={viewMode === 'cards' ? 'active' : ''}
                onClick={() => setViewMode('cards')}
              >
                Card View
              </button>
            </div>
          </div>
          
          {viewMode === 'table' && (
            <>
              <CampaignFilter
                campaignFilter={campaignFilter}
                setCampaignFilter={setCampaignFilter}
                regionFilter={regionFilter}
                dateRange={dateRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
              <DateFilter 
                dateRange={dateRange}
                setDateRange={setDateRange}
                onDateChange={handleDateChange}
                regionFilter={regionFilter}
                campaignFilter={campaignFilter}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            </>
          )}
          
          {microsites.length === 0 ? (
            <div className="empty-state">
              <p>No microsites found. Start tracking by adding tracking script to your sites.</p>
            </div>
          ) : viewMode === 'table' ? (
            <MicrositeTable microsites={microsites} onRefresh={onRefresh} />
          ) : (
            <div className="microsites-grid">
              {microsites.map((microsite) => (
                <MicrositeCard key={microsite.id} microsite={microsite} />
              ))}
            </div>
          )}
          
          {viewMode === 'table' && <AlertNotifications microsites={microsites} dateRange={dateRange} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

