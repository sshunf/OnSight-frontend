import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/DashboardDemo.css';

function DashboardDemo() {
  const [demoStats] = useState({
    currentOccupancy: 45,
    peakHours: '2PM - 5PM',
    activeDevices: 8,
    totalVisitors: 234
  });
  
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };
  
  return (
    <div className="dashboard-demo-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Demo</h1>
          <p className="demo-notice">This is a preview of our dashboard interface</p>
          <button onClick={handleBackToHome} className="back-button">
            Back to Home
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Current Occupancy</h3>
          <p className="stat-value">{demoStats.currentOccupancy}</p>
          <p className="stat-label">people</p>
        </div>

        <div className="stat-card">
          <h3>Peak Hours</h3>
          <p className="stat-value">{demoStats.peakHours}</p>
          <p className="stat-label">today</p>
        </div>

        <div className="stat-card">
          <h3>Active Devices</h3>
          <p className="stat-value">{demoStats.activeDevices}</p>
          <p className="stat-label">connected</p>
        </div>

        <div className="stat-card">
          <h3>Total Visitors</h3>
          <p className="stat-value">{demoStats.totalVisitors}</p>
          <p className="stat-label">today</p>
        </div>
      </div>

      <div className="data-section">
        <h2>Sample Data Visualization</h2>
        <div className="chart-placeholder">
          Demo Chart Area
        </div>
      </div>
    </div>
  );
}

export default DashboardDemo;