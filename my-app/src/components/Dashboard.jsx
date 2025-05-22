import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import '../css/Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    currentOccupancy: 0,
    peakHours: '--',
    activeDevices: 0,
    totalVisitors: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchDashboardData(currentUser);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async (currentUser) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:3000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user.displayName || 'User'}</h1>
          <button onClick={handleLogout} className="logout-button">
            Sign Out
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Current Occupancy</h3>
          <p className="stat-value">{stats.currentOccupancy}</p>
          <p className="stat-label">people</p>
        </div>

        <div className="stat-card">
          <h3>Peak Hours</h3>
          <p className="stat-value">{stats.peakHours}</p>
          <p className="stat-label">today</p>
        </div>

        <div className="stat-card">
          <h3>Active Devices</h3>
          <p className="stat-value">{stats.activeDevices}</p>
          <p className="stat-label">connected</p>
        </div>

        <div className="stat-card">
          <h3>Total Visitors</h3>
          <p className="stat-value">{stats.totalVisitors}</p>
          <p className="stat-label">today</p>
        </div>
      </div>

      <div className="data-section">
        <h2>Live Data</h2>
        <div className="data-container">
          {/* Add your real-time data visualization components here */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;