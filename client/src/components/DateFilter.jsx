import React from 'react';
import { FiCalendar, FiDownload } from 'react-icons/fi';
import './DateFilter.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const DateFilter = ({ dateRange, setDateRange, onDateChange, regionFilter, campaignFilter, sortBy, sortOrder }) => {
  const handleDatePreset = (preset) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    let startDate = new Date();
    
    switch (preset) {
      case 'day':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return;
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      preset
    });
    
    if (onDateChange) {
      onDateChange(startDate, today);
    }
  };

  const handleCustomDateChange = (type, value) => {
    const newRange = { ...dateRange, [type]: value };
    setDateRange(newRange);
    
    if (newRange.startDate && newRange.endDate && onDateChange) {
      onDateChange(new Date(newRange.startDate), new Date(newRange.endDate));
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (regionFilter && regionFilter !== 'all') params.append('region', regionFilter);
      if (campaignFilter && campaignFilter !== 'all') params.append('campaign', campaignFilter);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      
      const url = `${API_URL}/microsites/export?${params.toString()}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="date-filter-container">
      <div className="date-presets">
        <button
          className={dateRange.preset === 'day' ? 'active' : ''}
          onClick={() => handleDatePreset('day')}
        >
          Day
        </button>
        <button
          className={dateRange.preset === 'week' ? 'active' : ''}
          onClick={() => handleDatePreset('week')}
        >
          Week
        </button>
        <button
          className={dateRange.preset === 'month' ? 'active' : ''}
          onClick={() => handleDatePreset('month')}
        >
          Month
        </button>
      </div>
      
      <div className="date-picker-group">
        <FiCalendar className="calendar-icon" />
        <input
          type="date"
          className="date-picker"
          value={dateRange.startDate || ''}
          onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
          max={dateRange.endDate || new Date().toISOString().split('T')[0]}
        />
        <span className="date-separator">to</span>
        <input
          type="date"
          className="date-picker"
          value={dateRange.endDate || ''}
          onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
          min={dateRange.startDate || ''}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <button className="export-btn" onClick={handleExport} title="Export to CSV">
        <FiDownload />
        Export
      </button>
    </div>
  );
};

export default DateFilter;

