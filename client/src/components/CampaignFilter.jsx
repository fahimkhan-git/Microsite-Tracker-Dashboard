import React, { useState, useEffect, useCallback } from 'react';
import { FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import axios from 'axios';
import { API_URL } from '../config';
import './CampaignFilter.css';

// Use centralized resolved API URL

const CampaignFilter = ({ campaignFilter, setCampaignFilter, regionFilter, dateRange, sortBy, setSortBy, sortOrder, setSortOrder }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (regionFilter && regionFilter !== 'all') params.region = regionFilter;
      
      const response = await axios.get(`${API_URL}/campaigns`, { params });
      const sortedCampaigns = response.data.sort((a, b) => b.visits - a.visits);
      setCampaigns(sortedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [regionFilter, dateRange]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc'); // Default to descending
    }
  };

  return (
    <div className="campaign-filter-container">
      <div className="filter-group">
        <label className="filter-label">
          <FiFilter className="filter-icon" />
          Campaign Filter
        </label>
        <select
          className="campaign-select"
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
        >
          <option value="all">All Campaigns</option>
          {loading ? (
            <option disabled>Loading campaigns...</option>
          ) : (
            campaigns.map((campaign) => (
              <option key={campaign.name} value={campaign.name}>
                {campaign.name} ({campaign.visits} visits, {campaign.conversionRate}% conv.)
              </option>
            ))
          )}
        </select>
      </div>
      
      <div className="sort-group">
        <label className="filter-label">Sort By</label>
        <div className="sort-buttons">
          <button
            className={`sort-btn ${sortBy === 'visits' ? 'active' : ''}`}
            onClick={() => handleSortChange('visits')}
            title="Sort by visits"
          >
            Visits
            {sortBy === 'visits' && (
              sortOrder === 'desc' ? <FiArrowDown /> : <FiArrowUp />
            )}
          </button>
          <button
            className={`sort-btn ${sortBy === 'leads' ? 'active' : ''}`}
            onClick={() => handleSortChange('leads')}
            title="Sort by leads"
          >
            Leads
            {sortBy === 'leads' && (
              sortOrder === 'desc' ? <FiArrowDown /> : <FiArrowUp />
            )}
          </button>
          <button
            className={`sort-btn ${sortBy === 'conversion' ? 'active' : ''}`}
            onClick={() => handleSortChange('conversion')}
            title="Sort by conversion rate"
          >
            Conversion
            {sortBy === 'conversion' && (
              sortOrder === 'desc' ? <FiArrowDown /> : <FiArrowUp />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignFilter;

