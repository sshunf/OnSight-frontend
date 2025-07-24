import React, { useState, useEffect, useRef } from 'react';
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
import DashboardSidebar from './DashboardSidebar';
import '../css/Dashboard.css';
import '../css/DashboardSidebar.css';

const backendURL = import.meta.env.VITE_BACKEND_URL;

function Dashboard() {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
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
  const [selectedTimeframe, setSelectedTimeframe] = useState('24hours');
  const welcomeHeaderRef = useRef(null);
  const analyticsSectionRef = useRef(null);
  const devicesSectionRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentData, setEquipmentData] = useState([
    { name: 'Plate Loaded Shoulder Press', status: 'In Use', usage: '2.5 hours' },
    { name: 'Leg Extension Machine', status: 'Available', usage: '1.2 hours' },
    { name: 'Smith Machine', status: 'Maintenance', usage: '0 hours' }
  ]);
  const [highlightedSection, setHighlightedSection] = useState('');

  const sectionRefs = {
    dashboard: welcomeHeaderRef,
    devices: devicesSectionRef,
  };

  const handleSidebarLinkClick = (section) => {
    if (sectionRefs[section]?.current) {
      sectionRefs[section].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedSection(section);
      setTimeout(() => setHighlightedSection(''), 1000); // Highlight for 1 second
    }
  };

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
      fetchSensorData(user, selectedTimeframe);
    }
    
    if (window.location.hash === '#devices' && devicesSectionRef.current) {
      devicesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (window.location.hash === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [user, selectedTimeframe]);
  
  const fetchSensorData = async (currentUser, timeframe) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${backendURL}/api/sensor-data/${timeframe}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLiveData(data);
      } else {
        console.error(`Failed to fetch data for ${timeframe}`);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
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
    new Date(label).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const tooltipStyle = {
    backgroundColor: '#2d3748',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'In Use':
        return 'status-in-use';
      case 'Available':
        return 'status-available';
      case 'Maintenance':
        return 'status-maintenance';
      default:
        return '';
    }
  };

  const handleStatusClick = (equipment) => {
    setSelectedEquipment(equipment);
    if (equipment.status === 'Maintenance') {
      setIsFixedModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsFixedModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleFlagForMaintenance = () => {
    if (selectedEquipment) {
      setEquipmentData(prevData =>
        prevData.map(item =>
          item.name === selectedEquipment.name
            ? { ...item, status: 'Maintenance' }
            : item
        )
      );
    }
    handleCloseModal();
  };

  const handleMarkAsFixed = () => {
    if (selectedEquipment) {
      setEquipmentData(prevData =>
        prevData.map(item =>
          item.name === selectedEquipment.name
            ? { ...item, status: 'Available' }
            : item
        )
      );
    }
    handleCloseModal();
  };

  if (!user) return null;

  return (
    <div id="top" className="dashboard-layout">
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        ☰
      </button>

      <DashboardSidebar
        user={user}
        collapsed={collapsed}
        onLogout={handleLogout}
        onLinkClick={handleSidebarLinkClick}
      />

      <main className={`dashboard-main ${collapsed ? 'collapsed' : ''}`}>
        <div
          ref={welcomeHeaderRef}
          className={`dashboard-header ${highlightedSection === 'dashboard' ? 'highlight' : ''}`}
        >
          <div className="header-content">
            <h1>Welcome, {user.displayName || 'User'}</h1>
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

        <div ref={analyticsSectionRef} className="data-section">
          <div className="timeframe-selector" style={{ marginBottom: '1rem' }}>
            <label htmlFor="timeframe" style={{ marginRight: '0.5rem' }}>Timeframe:</label>
            <select
              id="timeframe"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.25rem' }}
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <h2>Live Sensor Data</h2>
          <div className="data-container">
            <div className="chart-card">
              <h3>Occupancy</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={liveData.occupancy}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(str) =>
                      new Date(str).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip labelFormatter={formatTimeLabel} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke="#5902db" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Force</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={liveData.force}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(str) =>
                      new Date(str).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }
                  />
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
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(str) =>
                      new Date(str).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip labelFormatter={formatTimeLabel} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke="#5902db" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div
          ref={devicesSectionRef}
          className={`equipment-status-section ${highlightedSection === 'devices' ? 'highlight' : ''}`}
        >
          <h2 className="section-title">Equipment Status</h2>
          <div className="equipment-list">
            <div className="equipment-header">
              <div className="header-item">EQUIPMENT</div>
              <div className="header-item">STATUS</div>
              <div className="header-item">DAILY USAGE</div>
            </div>
            {equipmentData.map((item, index) => (
              <div className="equipment-row" key={index}>
                <div className="equipment-name">{item.name}</div>
                <div className="equipment-status">
                  <span 
                    className={`status-badge ${getStatusClass(item.status)}`}
                    onClick={() => handleStatusClick(item)}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="equipment-usage">{item.usage}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Is this machine broken?</h3>
              <button className="close-button" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <p>You are about to flag the <strong>{selectedEquipment?.name}</strong> as needing maintenance.</p>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={handleCloseModal}>Cancel</button>
              <button className="button-danger" onClick={handleFlagForMaintenance}>Flag for Maintenance</button>
            </div>
          </div>
        </div>
      )}

      {isFixedModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Is this machine fixed?</h3>
              <button className="close-button" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <p>You are about to mark the <strong>{selectedEquipment?.name}</strong> as available.</p>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={handleCloseModal}>Cancel</button>
              <button className="button-primary" onClick={handleMarkAsFixed}>Mark as Fixed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
