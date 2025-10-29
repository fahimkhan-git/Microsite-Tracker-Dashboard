import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

function App() {
  const [microsites, setMicrosites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [alerts, setAlerts] = useState([]);
  
  // Date range state
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const yesterday = new Date(today);
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);
  
  const [dateRange, setDateRange] = useState({
    startDate: yesterday.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    preset: 'day'
  });
  
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [sortBy, setSortBy] = useState('visits'); // 'visits', 'leads', 'conversion'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchMicrosites();
    
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'visit' || message.type === 'lead' || message.type === 'status-update') {
        // Refresh data when new visit/lead is tracked or status updated
        fetchMicrosites();
      } else if (message.type === 'alerts') {
        setAlerts(message.data.alerts);
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          message.data.alerts.forEach(alert => {
            if (alert.noVisit24h) {
              new Notification(`⚠️ No Visits Alert`, {
                body: `${alert.domain} has no visits in the last 24 hours`,
                icon: '/favicon.ico'
              });
            }
            if (alert.noLead24h) {
              new Notification(`⚠️ No Leads Alert`, {
                body: `${alert.domain} has no leads in the last 24 hours`,
                icon: '/favicon.ico'
              });
            }
          });
        }
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.CLOSED) {
          // This will be handled by useEffect cleanup
        }
      }, 3000);
    };
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => {
      ws.close();
    };
  }, []);

  const fetchMicrosites = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (campaignFilter && campaignFilter !== 'all') params.campaign = campaignFilter;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      
      const response = await axios.get(`${API_URL}/microsites`, { params });
      setMicrosites(response.data);
      
      // Update alerts based on current data
      const newAlerts = response.data
        .filter(site => site.alerts.noVisit24h || site.alerts.noLead24h)
        .map(site => ({
          domain: site.domain,
          noVisit24h: site.alerts.noVisit24h,
          noLead24h: site.alerts.noLead24h
        }));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error fetching microsites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMicrosites();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, regionFilter, dateRange, campaignFilter, sortBy, sortOrder]);

  const filteredMicrosites = microsites.filter(site => {
    // Filter by search term
    const matchesSearch = site.domain.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by region
    const matchesRegion = regionFilter === 'all' || (site.region || 'unknown') === regionFilter;
    
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="App">
      <Header 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        regionFilter={regionFilter}
        setRegionFilter={setRegionFilter}
        alerts={alerts} 
      />
      <Dashboard 
        microsites={filteredMicrosites} 
        loading={loading} 
        onRefresh={fetchMicrosites}
        dateRange={dateRange}
        setDateRange={setDateRange}
        regionFilter={regionFilter}
        campaignFilter={campaignFilter}
        setCampaignFilter={setCampaignFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
    </div>
  );
}

export default App;

