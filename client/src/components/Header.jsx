import React from 'react';
import { FiSearch, FiBell, FiAlertCircle, FiX } from 'react-icons/fi';
import './Header.css';

const Header = ({ searchTerm, setSearchTerm, regionFilter, setRegionFilter, alerts }) => {
  const alertCount = alerts.length;

  const filterByRegion = (selectedRegion) => {
    setRegionFilter(selectedRegion);
  };

  const clearRegionFilter = () => {
    setRegionFilter('all');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>Microsite Tracker Dashboard</h1>
          <p>Real-time Google Ads Tracking</p>
        </div>
        
        <div className="header-actions">
          <div className="search-filters-row">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by domain name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="region-filter-container">
              <select
                id="regionFilter"
                className="region-select"
                value={regionFilter}
                onChange={(e) => filterByRegion(e.target.value)}
              >
                <option value="all">All Regions</option>
                <option value="navi-mumbai">Navi Mumbai</option>
                <option value="thane">Thane</option>
                <option value="western-mumbai">Western Mumbai</option>
                <option value="soha-harbour">Soha Harbour</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="pune">Pune</option>
                <option value="bangalore">Bangalore</option>
                <option value="noida">Noida</option>
              </select>
              {regionFilter !== 'all' && (
                <button
                  onClick={clearRegionFilter}
                  className="clear-filter-btn"
                  title="Clear region filter"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
          
          <div className="alerts-badge">
            {alertCount > 0 && (
              <>
                <FiBell className="bell-icon" />
                <span className="badge">{alertCount}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {alertCount > 0 && (
        <div className="alert-banner">
          <FiAlertCircle />
          <span>
            {alertCount} microsite{alertCount > 1 ? 's' : ''} need attention
            (no visits or leads in last 24 hours)
          </span>
        </div>
      )}

      {regionFilter !== 'all' && (
        <div className="region-status-banner" id="regionStatus">
          Showing websites from {regionFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      )}
    </header>
  );
};

export default Header;

