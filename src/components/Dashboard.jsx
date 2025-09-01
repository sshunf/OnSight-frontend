import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import '../css/Dashboard.css';
import Sidebar from './Sidebar';

// utils
import { buildEquipmentRows } from '../utils/occupancyTable';

console.log("dashboard reached");
const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

function Dashboard() {
  const displayName = localStorage.getItem('displayName');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    currentOccupancy: 0,
    peakHours: '--',
    numDevices: 0,
    totalVisitors: 0,
});
  
const [selectedRange, setSelectedRange] = useState(12); // default 12 hour interval
const [selectedAvgRange, setSelectedAvgRange] = useState(12); // default 12 hour interval
const [selectedCumRange, setSelectedCumRange] = useState(12); // default 12 hour interval
const chartInstancesRef = useRef({});
const hourlyUsageChartRef = useRef(null);
const avgUsageChartRef = useRef(null);
const cumUsageChartRef = useRef(null);
const [machineOptions, setMachineOptions] = useState([]);
const TempLogoPath = '/logodraft.png';
const [selectedMachine, setSelectedMachine] = useState('');
const navigate = useNavigate();
const [isSidebarOpen, setSidebarOpen] = useState(false); 
const [equipmentRows, setEquipmentRows] = useState([]);

const statusLabel = (s) =>
s === 'active' ? 'In Use' :
s === 'inactive' ? 'Available' :
s === 'maintenance' ? 'Maintenance' :
s === 'charging' ? 'Charging' : (s || 'Unknown');

const statusClass = (s) =>
s === 'active' ? 'status--active' :
s === 'inactive' ? 'status--inactive' :
s === 'maintenance' ? 'status--maintenance' :
s === 'charging' ? 'status--charging' : 'status--unknown';

const formatLastSeen = (val, fallbackActiveWindowMins) => {
  if (!val) return fallbackActiveWindowMins != null ? `≤ ${fallbackActiveWindowMins} min` : '—';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  const diffM = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (diffM < 1) return 'just now';
  if (diffM < 60) return `${diffM} min ago`;
  const hrs = Math.floor(diffM / 60);
  return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
};

// Check for user in localStorage
useEffect(() => {
  const userEmail = localStorage.getItem('userEmail');
  const gymId = localStorage.getItem('gymId');
  if (!userEmail || !gymId) {
    navigate('/login');
  } else {
    setUser({ email: userEmail });
  }
}, [navigate]);

const buildUsageChart = async() => {
  const gymId = localStorage.getItem('gymId');
  if (!gymId) { console.error("No gymId in localStorage"); return; }
  console.log('GYMID:', gymId);
  try {
    const res = await fetch(`${backendURL}/api/hourly/usage?hours=${selectedRange}&gymId=${gymId}&machineId=${selectedMachine}`);
    const data = await res.json();
    if (!Array.isArray(data.result)) {
      console.error("Invalid data format from backend:", data);
      return;
    }
    data.result.sort((a, b) => new Date(a.hour) - new Date(b.hour));
    const grouped = {};
    data.result.forEach(entry => {
      if (!entry || !entry.hour) return;
      const start = new Date(entry.hour);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const format = (d) => {
        const h = d.getHours();
        const suffix = h < 12 ? 'AM' : 'PM';
        const hour12 = h % 12 || 12;

        if (selectedRange <= 24) {
          // Show just the time for past 6 or 24 hours
          return `${hour12}${suffix}`;
        } else {
          // Show date + time for longer ranges
          const month = d.getMonth() + 1;
          const day = d.getDate();
          return `${month}/${day} ${hour12}${suffix}`;
        }
      };

      const label = `${format(start)}`;        
      if (!grouped[label]) grouped[label] = 0;
      grouped[label] += entry.minutes;
    });

    const labels = Object.keys(grouped);
    const values = labels.map(label => grouped[label]);
    const maxValue = Math.max(...values);
    const yMax = (Math.ceil(maxValue + 5) >= 60) ? 60 : Math.ceil(maxValue + 5);
    console.log("total min:", maxValue);

    if (hourlyUsageChartRef.current) {
      const ctx = hourlyUsageChartRef.current.getContext('2d');
      if (chartInstancesRef.current.equipment) {
        chartInstancesRef.current.equipment.destroy();
      }
      chartInstancesRef.current.equipment = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: `Usage (min)`,
            data: values,
            backgroundColor: 'rgba(124, 58, 237, 0.7)',
            borderColor: 'rgba(93, 0, 255, 0.7)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: 'white',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, labels: { color: 'white' }},
            title: { display: true, text: 'Per-Hour Machine Usage', color: 'white' }
          },
          scales: {
            x: {
              ticks: { color: 'white', font: { size: 10}},
              title: { display: true, text: 'Hour Intervals', color: 'white' },
              grid: { 
                display: true,
                color: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                tickColor: 'rgba(255,255,255,0.4)',
                drawOnChartArea: true,
                drawTicks: true,
              }
            },
            y: {
              min: 0,
              max: yMax,
              ticks: { color: 'white' },
              beginAtZero: true,
              title: { display: true, text: 'Minutes', color: 'white' },
              grid: { 
                display: true,
                color: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                tickColor: 'rgba(255,255,255,0.4)',
                drawOnChartArea: true,
                drawTicks: true,
              }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error("Failed to fetch build chart and fetch analytics:", err);
  }
};

const buildWeeklyChart = async() => {
  const gymId = localStorage.getItem('gymId');
  if (!gymId) { console.error("No gymId in localStorage"); return; }
  console.log('GYMID:', gymId);
  try {
    const res = await fetch(`${backendURL}/api/weekly/usage?gymId=${gymId}&hours=${selectedAvgRange}`);
    const data = await res.json();
    if (!Array.isArray(data.result)) return;
    // Use machineName if available, fallback to machineId
    const sortedResult = [...data.result].sort((a, b) => (a.machineName || a.machineId).localeCompare(b.machineName || b.machineId));
    const labels = sortedResult.map(d => d.machineName || (d.machineId ? d.machineId : 'Unknown'));
    const values = sortedResult.map(d => d.avgMinutes);
    const maxValue = Math.max(...values);
    const yMax = Math.ceil(maxValue + 10);
    if (avgUsageChartRef.current) {
      const ctx = avgUsageChartRef.current.getContext('2d');
      if (chartInstancesRef.current.avgUsage) {
        chartInstancesRef.current.avgUsage.destroy();
      }
      chartInstancesRef.current.avgUsage = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Average Daily Usage (min)',
            data: values,
            backgroundColor: 'rgba(124, 58, 237, 0.7)',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, labels: { color: 'white' } },
            title: { display: true, text: 'Per-Machine Average Usage A Day', color: 'white' }
          },
          scales: {
            x: {
              ticks: { color: 'white' },
              title: { display: true, text: 'Machines', color: 'white' },
              grid: { color: 'rgba(255,255,255,0.2)' }
            },
            y: {
              min: 0,
              max: yMax,
              ticks: { color: 'white' },
              title: { display: true, text: 'Minutes', color: 'white' },
              grid: { color: 'rgba(255,255,255,0.2)' }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Failed to build weekly average chart:', err);
  }
}

const buildCumulativeChart = async() => {
  const gymId = localStorage.getItem('gymId');
  if (!gymId) { console.error("No gymId in localStorage"); return; }
  const url = `${backendURL}/api/cum/usage?hours=${selectedCumRange}&gymId=${gymId}`;
  console.log('Cumulative chart API request:', url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Cumulative API response:', data);
    if (!Array.isArray(data.result)) {
      console.error("Invalid data format from backend:", data);
      return;
    }
    // Use same grouping/labeling logic as buildUsageChart
    data.result.sort((a, b) => new Date(a.hour) - new Date(b.hour));
    const grouped = {};
    data.result.forEach(entry => {
      if (!entry || !entry.hour) return;
      const start = new Date(entry.hour);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const format = (d) => {
        const h = d.getHours();
        const suffix = h < 12 ? 'AM' : 'PM';
        const hour12 = h % 12 || 12;

        if (selectedCumRange <= 24) {
          // Show just the time for past 6 or 24 hours
          return `${hour12}${suffix}`;
        } else {
          // Show date + time for longer ranges
          const month = d.getMonth() + 1;
          const day = d.getDate();
          return `${month}/${day} ${hour12}${suffix}`;
        }
      };
      const label = `${format(start)}`;
      if (!grouped[label]) grouped[label] = 0;
      grouped[label] += entry.minutes;
    });
    const labels = Object.keys(grouped);
    const values = labels.map(label => grouped[label]);
    if (!labels.length || !values.length) {
      console.warn('No data for cumulative chart');
      return;
    }
    const maxValue = Math.max(...values);
    const yMax = (Math.ceil(maxValue + 5) >= 60) ? 60 : Math.ceil(maxValue + 5);
    if (cumUsageChartRef.current) {
      const ctx = cumUsageChartRef.current.getContext('2d');
      if (chartInstancesRef.current.cumulative) {
        chartInstancesRef.current.cumulative.destroy();
      }
      chartInstancesRef.current.cumulative = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: `Cumulative Usage`,
            data: values,
            backgroundColor: 'rgba(124, 58, 237, 0.7)',
            borderColor: 'rgba(93, 0, 255, 0.7)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: 'white',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, labels: { color: 'white' }},
            title: { display: true, text: 'Cumulative Machine Usage Across All Machines', color: 'white' }
          },
          scales: {
            x: {
              ticks: { color: 'white', font: { size: 10}},
              title: { display: true, text: 'Hour Intervals', color: 'white' },
              grid: {
                display: true,
                color: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                tickColor: 'rgba(255,255,255,0.4)',
                drawOnChartArea: true,
                drawTicks: true,
              }
            },
            y: {
              min: 0,
              max: yMax,
              ticks: { color: 'white' },
              beginAtZero: true,
              title: { display: true, text: 'Minutes', color: 'white' },
              grid: {
                display: true,
                color: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                tickColor: 'rgba(255,255,255,0.4)',
                drawOnChartArea: true,
                drawTicks: true,
              }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error("Failed to fetch build chart and fetch analytics:", err);
  }
}

const fetchMachineOptions = async() => {
  const gymId = localStorage.getItem('gymId');
  if (!gymId) return;
  try {
    const res = await fetch(`${backendURL}/api/hourly/options?gymId=${gymId}`);
    const data = await res.json();
    console.log("Machine options fetched:", data);
    // Now expect array of objects: { machineId, machineName }
    if (Array.isArray(data.machineIds)) {
      setMachineOptions(data.machineIds);
      if (!selectedMachine && data.machineIds.length > 0) {
        setSelectedMachine(data.machineIds[0].machineId);
      }
    } else {
      console.error("No machineIds array in response:", data);
    }
  } catch (err) {
    console.error('Failed to fetch machine options:', err);
  }
}

useEffect(() => {
  const userEmail = localStorage.getItem('userEmail');
  const gymId = localStorage.getItem('gymId');
  if (!userEmail || !gymId) {
    navigate('/login');
  } else {
    setUser({ email: userEmail });
  }
}, [navigate]);

useEffect(() => {
  console.log("built chart");
  if (user) {
    fetchDashboardData(user);
    fetchMachineOptions();
    buildWeeklyChart();
    buildUsageChart();
    buildCumulativeChart();
  }
}, [user, selectedAvgRange, selectedCumRange]);

useEffect(() => {
  if (selectedMachine){
    buildUsageChart();
  }
}, [selectedRange, selectedCumRange, selectedMachine]);

const fetchDashboardData = async () => {
  try {
    const gymId = localStorage.getItem('gymId');
    if (!gymId) return;
    const resOcc = await fetch(`${backendURL}/api/small/occupancy?gymId=${gymId}`);
    const occData = await resOcc.json();
    const resPeak = await fetch(`${backendURL}/api/small/peak?gymId=${gymId}`);
    const peakData = await resPeak.json();  
    const resActive = await fetch(`${backendURL}/api/small/active?gymId=${gymId}`);
    const activeData = await resActive.json();
    const resDaily = await fetch(`${backendURL}/api/small/daily?gymId=${gymId}`);
    const dailyData = await resDaily.json();
    const resWeekly = await fetch(`${backendURL}/api/small/weekly?gymId=${gymId}`);
    const weeklyData = await resWeekly.json();
    if (!resOcc.ok || !resPeak.ok || !resActive.ok || !resDaily.ok || !resWeekly.ok) {
      console.error("Failed to fetch one or more dashboard endpoints:", {
        occ:   { ok: resOcc.ok,   status: resOcc.status,   body: occData },
        peak:  { ok: resPeak.ok,  status: resPeak.status,  body: peakData },
        active:{ ok: resActive.ok,status: resActive.status,body: activeData },
        daily: { ok: resDaily.ok, status: resDaily.status, body: dailyData },
        weekly:{ ok: resWeekly.ok,status: resWeekly.status,body: weeklyData },
      });
      return;
    }

    setStats((prevStats) => ({
      ...prevStats,
      currentOccupancy: occData.currentOccupancy || 0,
      peakHours: peakData.peakHour || '--',
      numDevices: activeData.activeSensorCount || 0,
      dailyFav: dailyData.mostUsedMachine || '--',
      weeklyFav: weeklyData.weeklyFav || '--'
    }));

    const rows = buildEquipmentRows(occData);
    setEquipmentRows(rows);

    console.log("daily: ", dailyData.mostUsedMachine?.machineName);
    console.log("weekly: ", weeklyData.weeklyFav?.machineName);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

const handleLogout = async () => {
  try {
    //await signOut(auth);
    localStorage.clear();
    navigate('/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

if (!user) return null;

return (
  <div className="dashboard-container">
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => setSidebarOpen(false)}
      onLogout={handleLogout}
      displayName={displayName}
      email={user?.email}
    />
    <div className="dashboard-header">
        <div className="header-content">
        <div className="header-left">
          <h1>Welcome, {displayName || 'User'}</h1>
        </div>

        <div className="header-right">
          <button
            className="menu-button circle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            title="Open menu"
          >
            ☰
          </button>
        </div>
      </div>
    </div>

    <div className="stats-grid">
      <div className="stat-card">
        <h3>Daily Favorite</h3>
        <p className="stat-value">
          {stats.dailyFav?.machineId
            ? `${stats.dailyFav.machineName}`
            : '--'}
        </p>
        <p className="stat-label">Today's Most Used Machine</p>
      </div>
      <div className="stat-card">
        <h3>Peak Hours</h3>
        <p className="stat-value">{stats.peakHours}</p>
        <p className="stat-label">Time Interval With Most Activity Today</p>
      </div>
      <div className="stat-card">
        <h3>Weekly Favorite</h3>
        <p className="stat-value">
          {stats.weeklyFav?.machineId
            ? `${stats.weeklyFav.machineName}`
            : '--'}
        </p>
        <p className="stat-label">This Week's Most Used Machine</p>
      </div>
    </div>

    <div className="stats-grid">
        <div className="stat-card">
          <h3>Current Occupancy</h3>
          <p className="stat-value">{stats.currentOccupancy}</p>
          <p className="stat-label">Number Of Machines Currently In Use</p>
        </div>
            <div className="flex items-center justify-center w-full">
              <img 
                className="h-36 w-auto"
                src={TempLogoPath}
                alt="TempLogo"
              />
            </div>
            <div className="stat-card">
              <h3>Machine Sensors</h3>
              <p className="stat-value">{stats.numDevices}</p>
              <p className="stat-label">Number Of Sensors Connected</p>
            </div>
    </div>

    <div className="data-section">
        <h2>Live Sensor Data</h2>
        <div className="data-container">
          <div className="row">
            <div className="chart-card">
              <h3 className="text-xl font-semibold mb-4">
                Hourly Machine Usage For Machine {(() => {
                  const found = machineOptions.find(m => String(m.machineId) === String(selectedMachine));
                  return selectedMachine ? (found ? found.machineName : 'Unknown') : 'N/A';
                })()}
              </h3>
              <div className="chart" style={{height: '300px'}}>
                <canvas ref={hourlyUsageChartRef}></canvas>
              </div>
              <div className="interval-dropdown-wrapper">
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="interval-dropdown uppercase tracking-wider"
                >
                  {[...machineOptions]
                    .filter(machine => machine && machine.machineId)
                    .sort((a, b) => (a.machineName || a.machineId).localeCompare(b.machineName || b.machineId))
                    .map((machine) => (
                      <option key={machine.machineId} value={machine.machineId}>
                        {machine.machineName || machine.machineId}
                      </option>
                    ))}
                </select>
                <select
                  value={selectedRange}
                  onChange={e => setSelectedRange(parseInt(e.target.value))}
                  className="interval-dropdown uppercase tracking-wider"
                >
                  <option value={6}>Past 6 Hours</option>
                  <option value={8}>Past 8 Hours</option>
                  <option value={12}>Past 12 Hours</option>
                  <option value={24}>Past 24 Hours</option>
                  <option value={168}>Past Week</option>
                  <option value={720}>Past Month</option>
                  <option value={1000}>All Time</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="chart-card">
              <h3 className="text-xl font-semibold mb-4">Average Machine Usage Of {selectedAvgRange === 1000 ? 'All Time' : `${selectedAvgRange} Hours`}</h3>
              <div className="chart">
                <canvas ref={avgUsageChartRef}></canvas>
              </div>
              <div className="interval-dropdown-wrapper mt-2">
                <select
                  value={selectedAvgRange}
                  onChange={e => setSelectedAvgRange(parseInt(e.target.value))}
                  className="interval-dropdown font-medium text-gray-300 uppercase tracking-wider"
                >
                  <option value={6}>Past 6 Hours</option>
                  <option value={8}>Past 8 Hours</option>
                  <option value={12}>Past 12 Hours</option>
                  <option value={24}>Past 24 Hours</option>
                  <option value={168}>Past Week</option>
                  <option value={720}>Past Month</option>
                  <option value={1000}>All Time</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="chart-card">
              <h3 className="text-xl font-semibold mb-4">Cumulative Machine Usage Of {selectedCumRange === 1000 ? 'All Time' : `${selectedCumRange} Hours`}</h3>
              <div className="chart" style={{height: '300px'}}>
                <canvas ref={cumUsageChartRef}></canvas>
              </div>
              <div className="interval-dropdown-wrapper mt-2">
                <select
                  value={selectedCumRange}
                  onChange={e => setSelectedCumRange(parseInt(e.target.value))}
                  className="interval-dropdown font-medium text-gray-300 uppercase tracking-wider"
                >
                  <option value={6}>Past 6 Hours</option>
                  <option value={8}>Past 8 Hours</option>
                  <option value={12}>Past 12 Hours</option>
                  <option value={24}>Past 24 Hours</option>
                  <option value={168}>Past Week</option>
                  <option value={720}>Past Month</option>
                  <option value={1000}>All Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* Equipment Status table */}
      <div className="data-section">
        <h2>Equipment Status</h2>

        <div className="equipment-table">
          <div className="equipment-header">
            <div>Equipment</div>
            <div>Status</div>
            <div>Last Seen</div>
          </div>

          {equipmentRows.length === 0 ? (
            <div className="equipment-empty">No machines found.</div>
          ) : (
            <div className="equipment-body">
              {equipmentRows.map((row) => (
                <div className="equipment-row" key={row.name}>
                  <div className="equipment-name">{row.name}</div>
                  <div className="equipment-status">
                    <span className={`status-badge ${statusClass(row.status)}`}>
                      {statusLabel(row.status)}
                    </span>
                  </div>
                  <div className="equipment-last">{row.lastSeen}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;