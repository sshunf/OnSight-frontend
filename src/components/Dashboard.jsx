import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import '../css/Dashboard.css';

const backendURL = import.meta.env.VITE_BACKEND_URL;

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    currentOccupancy: 0,
    peakHours: '--',
    activeDevices: 0,
    totalVisitors: 0,
  });
  const [liveData, setLiveData] = useState({
    force: [],
    motion: [],
    occupancy: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData(user);
    }
  }, [user]);

  const fetchDashboardData = async (currentUser) => {
    try {
      const token = await currentUser.getIdToken();
      // Fetch stats if needed

      // Fetch sensor data
      const response = await fetch(`${backendURL}/api/sensor-data/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLiveData(data);
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

  const formatTimeLabel = (label) =>
  new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const tooltipStyle = {
    backgroundColor: '#1f2937',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
  };

  if (!user) return null;

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
      </div>

      <div className="data-section">
        <h2>Live Sensor Data</h2>
        <div className="data-container">

          <div className="chart-card">
            <h3>Occupancy</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={liveData.occupancy}>
                <XAxis dataKey="timestamp" tickFormatter={(str) => new Date(str).toLocaleTimeString()} />
                <YAxis />
                <Tooltip labelFormatter={formatTimeLabel} contentStyle={tooltipStyle}/>
                <Line type="monotone" dataKey="value" stroke="#5902db"/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Force</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={liveData.force}>
                <XAxis dataKey="timestamp" tickFormatter={(str) => new Date(str).toLocaleTimeString()} />
                <YAxis />
                <Tooltip labelFormatter={formatTimeLabel} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#5902db" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="text-center w-full">Motion</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={liveData.motion}>
                <XAxis dataKey="timestamp" tickFormatter={(str) => new Date(str).toLocaleTimeString()} />
                <YAxis />
                <Tooltip labelFormatter={formatTimeLabel} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#5902db" />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;