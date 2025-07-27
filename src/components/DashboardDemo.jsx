import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Temporarily commented out date picker functionality
// import Flatpickr from 'react-flatpickr';
// import 'flatpickr/dist/themes/dark.css';
import '../css/DashboardDemo.css';

function DashboardDemo() {
  // Temporarily commented out date picker state
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('Today');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showMachineDetails, setShowMachineDetails] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedMachine, setSelectedMachine] = useState(null);
  
  const occupancyChartRef = useRef(null);
  const equipmentChartRef = useRef(null);
  const machineChartRef = useRef(null);
  const chartInstancesRef = useRef({});
  
  const navigate = useNavigate();

  // Machine data
  const machineData = {
    cardio: [
      { id: 'treadmill1', name: 'Treadmill #1', status: 'in-use', usage: 4.2, condition: 'Good', lastMaintenance: '2024-02-15' },
      { id: 'treadmill2', name: 'Treadmill #2', status: 'available', usage: 3.8, condition: 'Good', lastMaintenance: '2024-02-10' },
      { id: 'elliptical1', name: 'Elliptical #1', status: 'maintenance', usage: 2.5, condition: 'Needs Service', lastMaintenance: '2024-01-20' },
      { id: 'bike1', name: 'Exercise Bike #1', status: 'in-use', usage: 3.1, condition: 'Good', lastMaintenance: '2024-02-01' }
    ],
    weights: [
      { id: 'bench1', name: 'Bench Press #1', status: 'in-use', usage: 5.2, condition: 'Good', lastMaintenance: '2024-02-05' },
      { id: 'squat1', name: 'Squat Rack #1', status: 'available', usage: 4.8, condition: 'Good', lastMaintenance: '2024-02-12' },
      { id: 'dumbbell1', name: 'Dumbbell Set #1', status: 'in-use', usage: 6.0, condition: 'Good', lastMaintenance: '2024-01-15' }
    ],
    machines: [
      { id: 'cable1', name: 'Cable Machine #1', status: 'available', usage: 3.5, condition: 'Good', lastMaintenance: '2024-02-08' },
      { id: 'legpress1', name: 'Leg Press #1', status: 'in-use', usage: 4.0, condition: 'Good', lastMaintenance: '2024-02-14' },
      { id: 'shp1', name: 'Shoulder Press #1', status: 'in-use', usage: 3.2, condition: 'Good', lastMaintenance: '2024-02-01' }
    ],
    stretching: [
      { id: 'mat1', name: 'Yoga Mat Area #1', status: 'available', usage: 2.8, condition: 'Good', lastMaintenance: '2024-01-25' },
      { id: 'foam1', name: 'Foam Roller Station #1', status: 'available', usage: 1.5, condition: 'Good', lastMaintenance: '2024-01-30' }
    ]
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    setShowMachineModal(true);
  };

  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
    setShowMachineModal(false);
    setShowMachineDetails(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'in-use': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'available': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'maintenance': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Initialize charts
  useEffect(() => {
    const loadChartJS = async () => {
      if (window.Chart) {
        initializeCharts();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        initializeCharts();
      };
      document.head.appendChild(script);
    };

    const initializeCharts = () => {
      // Occupancy Chart
      if (occupancyChartRef.current && window.Chart) {
        const ctx = occupancyChartRef.current.getContext('2d');
        if (chartInstancesRef.current.occupancy) {
          chartInstancesRef.current.occupancy.destroy();
        }
        chartInstancesRef.current.occupancy = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'],
            datasets: [{
              label: 'Gym Occupancy',
              data: [5, 20, 35, 50, 40, 45, 75, 55, 25],
              borderColor: 'rgb(124, 58, 237)',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: 'rgb(124, 58, 237)',
              pointBorderColor: 'rgb(255, 255, 255)',
              pointBorderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: 'rgb(229, 231, 235)' } }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(75, 85, 99, 0.2)' },
                ticks: { color: 'rgb(229, 231, 235)' }
              },
              x: {
                grid: { color: 'rgba(75, 85, 99, 0.2)' },
                ticks: { color: 'rgb(229, 231, 235)' }
              }
            }
          }
        });

        // Equipment Chart
        if (equipmentChartRef.current) {
          const ctx2 = equipmentChartRef.current.getContext('2d');
          if (chartInstancesRef.current.equipment) {
            chartInstancesRef.current.equipment.destroy();
          }
          chartInstancesRef.current.equipment = new window.Chart(ctx2, {
            type: 'bar',
            data: {
              labels: ['Treadmills', 'Bench Press', 'Squat Racks', 'Cable Machines', 'Bikes', 'Dumbbells'],
              datasets: [{
                label: 'Hours Used per Day',
                data: [4.7, 3.2, 3.8, 2.1, 3.9, 5.2],
                backgroundColor: [
                  'rgba(124, 58, 237, 0.85)',
                  'rgba(59, 130, 246, 0.85)',
                  'rgba(16, 185, 129, 0.85)',
                  'rgba(245, 158, 11, 0.85)',
                  'rgba(239, 68, 68, 0.85)',
                  'rgba(236, 72, 153, 0.85)'
                ],
                borderWidth: 0,
                borderRadius: 12
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(75, 85, 99, 0.2)' },
                  ticks: { color: 'rgb(229, 231, 235)' }
                },
                x: {
                  grid: { display: false },
                  ticks: { color: 'rgb(229, 231, 235)', maxRotation: 0 }
                }
              }
            }
          });
        }
      }
    };

    loadChartJS();

    return () => {
      Object.values(chartInstancesRef.current).forEach(chart => {
        if (chart && chart.destroy) chart.destroy();
      });
    };
  }, []);

  // Initialize machine chart when modal opens
  useEffect(() => {
    if (showMachineDetails && selectedMachine && machineChartRef.current && window.Chart) {
      setTimeout(() => {
        const ctx = machineChartRef.current.getContext('2d');
        if (chartInstancesRef.current.machine) {
          chartInstancesRef.current.machine.destroy();
        }
        chartInstancesRef.current.machine = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'],
            datasets: [{
              label: 'Usage',
              data: [0.2, 0.4, 0.6, 0.8, 0.7, 0.5, 0.3, 0.1],
              borderColor: 'rgb(124, 58, 237)',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(75, 85, 99, 0.2)' },
                ticks: { color: 'rgb(229, 231, 235)' }
              },
              x: {
                grid: { color: 'rgba(75, 85, 99, 0.2)' },
                ticks: { color: 'rgb(229, 231, 235)' }
              }
            }
          }
        });
      }, 100);
    }
  }, [showMachineDetails, selectedMachine]);

  return (
    <div className="dashboard-demo-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Gym Analytics Dashboard
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Real-time insights for your fitness facility
          </p>
          <button onClick={handleBackToHome} className="back-button mt-4">
            Back to Home
          </button>
        </div>
      </div>

      {/* Dashboard Controls */}
      <div className="mb-8 flex flex-wrap justify-between items-center">
        {/* Temporarily commented out entire date picker section */}
        {/* <div className="mb-4 md:mb-0 relative">
          <div className="flex items-center">
            <Flatpickr
              value={selectedDate}
              onChange={(date) => setSelectedDate(date[0] || new Date())}
              options={{
                dateFormat: "Y-m-d",
                defaultDate: new Date(),
                theme: "dark",
                disableMobile: true,
                animate: true,
                prevArrow: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>',
                nextArrow: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>'
              }}
              className="bg-gray-900 text-white border border-gray-700 rounded-md p-2 pr-10 w-40 cursor-pointer hover:bg-gray-800 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Select Date"
            />
            <input 
              type="text" 
              value={selectedDate}
              className="bg-gray-900 text-white border border-gray-700 rounded-md p-2 pr-10 w-40" 
              placeholder="Today" 
              readOnly
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div> */}
        {/* Temporarily commented out buttons */}
        {/* <div className="flex space-x-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
            Export Data
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
            Refresh
          </button>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Current Occupancy */}
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm">Current Occupancy</h3>
              <p className="text-3xl font-bold mt-2">28</p>
              <p className="text-green-500 text-sm mt-1">+12% from average</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Equipment in Use */}
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm">Equipment in Use</h3>
              <p className="text-3xl font-bold mt-2">24/36</p>
              <p className="text-yellow-500 text-sm mt-1">67% utilization</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm">Peak Hours</h3>
              <p className="text-3xl font-bold mt-2">5-7 PM</p>
              <p className="text-blue-500 text-sm mt-1">86% capacity</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Most Used Equipment */}
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm">Most Used Equipment</h3>
              <p className="text-3xl font-bold mt-2">Treadmills</p>
              <p className="text-red-500 text-sm mt-1">4.2 hrs/day avg</p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="stat-card">
          <h3 className="text-xl font-semibold mb-4">Daily Occupancy</h3>
          <div className="h-80">
            <canvas ref={occupancyChartRef}></canvas>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="text-xl font-semibold mb-4">Equipment Usage</h3>
          <div className="h-80">
            <canvas ref={equipmentChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Equipment Status Table */}
      <div className="stat-card mb-8">
        <h3 className="text-xl font-semibold mb-4">Equipment Status</h3>
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full equipment-table">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Daily Usage</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="px-6 py-5 whitespace-nowrap font-medium">Treadmill #1</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span className={`equipment-status ${getStatusClass('in-use')}`}>In Use</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">4.7 hours</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">In 12 days</td>
              </tr>
              <tr>
                <td className="px-6 py-5 whitespace-nowrap font-medium">Bench Press #3</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span className={`equipment-status ${getStatusClass('in-use')}`}>In Use</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">3.2 hours</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">In 30 days</td>
              </tr>
              <tr>
                <td className="px-6 py-5 whitespace-nowrap font-medium">Squat Rack #2</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span className={`equipment-status ${getStatusClass('maintenance')}`}>Maintenance</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">0 hours</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">In Progress</td>
              </tr>
              <tr>
                <td className="px-6 py-5 whitespace-nowrap font-medium">Cable Machine #1</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span className={`equipment-status ${getStatusClass('available')}`}>Available</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">2.1 hours</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">In 45 days</td>
              </tr>
              <tr>
                <td className="px-6 py-5 whitespace-nowrap font-medium">Cycling Machine #4</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span className={`equipment-status ${getStatusClass('in-use')}`}>In Use</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">3.8 hours</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">In 15 days</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Gym Heatmap Button - Temporarily commented out */}
        {/* <div className="mt-8 text-center">
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg font-medium transition-all duration-300 flex items-center justify-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {showHeatmap ? 'Hide Gym Heatmap' : 'View Gym Heatmap'}
          </button>
        </div> */}
      </div>

      {/* Gym Heatmap Section */}
      {showHeatmap && (
        <div className="stat-card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Gym Occupancy Heatmap</h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">Current Time: 5:30 PM</span>
              <button onClick={() => setShowHeatmap(false)} className="p-1 hover:bg-gray-700 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Heatmap Legend */}
          <div className="flex items-center justify-end mb-4 space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 opacity-70 rounded-sm mr-2"></div>
              <span className="text-xs text-gray-300">Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 opacity-70 rounded-sm mr-2"></div>
              <span className="text-xs text-gray-300">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 opacity-70 rounded-sm mr-2"></div>
              <span className="text-xs text-gray-300">High</span>
            </div>
          </div>
          
          {/* Gym Layout with Heatmap */}
          <div className="relative bg-gray-800 rounded-lg border border-gray-700 h-96 mx-auto max-w-4xl">
            {/* Entrance */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-700 w-20 h-6 rounded-b-lg flex items-center justify-center">
              <span className="text-xs text-gray-300">Entrance</span>
            </div>
            
            {/* Cardio Section (High occupancy) */}
            <div 
              className="absolute top-10 left-10 w-64 h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-80 transition-all duration-200" 
              style={{backgroundColor: 'rgba(239, 68, 68, 0.6)'}}
              onClick={() => handleAreaClick('cardio')}
            >
              <div className="text-white text-sm font-medium mb-1">Cardio Area</div>
              <div className="text-white text-xs">85% Occupied</div>
            </div>
            
            {/* Weight Section (Medium occupancy) */}
            <div 
              className="absolute top-10 right-10 w-64 h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-80 transition-all duration-200" 
              style={{backgroundColor: 'rgba(245, 158, 11, 0.6)'}}
              onClick={() => handleAreaClick('weights')}
            >
              <div className="text-white text-sm font-medium mb-1">Free Weights</div>
              <div className="text-white text-xs">60% Occupied</div>
            </div>
            
            {/* Machine Section (Low occupancy) */}
            <div 
              className="absolute bottom-10 left-10 w-64 h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-80 transition-all duration-200" 
              style={{backgroundColor: 'rgba(16, 185, 129, 0.6)'}}
              onClick={() => handleAreaClick('machines')}
            >
              <div className="text-white text-sm font-medium mb-1">Machine Area</div>
              <div className="text-white text-xs">30% Occupied</div>
            </div>
            
            {/* Stretching Area (Low occupancy) */}
            <div 
              className="absolute bottom-10 right-10 w-64 h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-80 transition-all duration-200" 
              style={{backgroundColor: 'rgba(16, 185, 129, 0.6)'}}
              onClick={() => handleAreaClick('stretching')}
            >
              <div className="text-white text-sm font-medium mb-1">Stretching Zone</div>
              <div className="text-white text-xs">25% Occupied</div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">Data updated every 5 minutes. Last update: 5:25 PM</p>
          </div>
        </div>
      )}

      {/* Machine List Modal */}
      {showMachineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                {selectedArea.charAt(0).toUpperCase() + selectedArea.slice(1)} Area Machines
              </h3>
              <button onClick={() => setShowMachineModal(false)} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {machineData[selectedArea]?.map((machine) => (
                <div 
                  key={machine.id}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer flex justify-between items-center group"
                  onClick={() => handleMachineClick(machine)}
                >
                  <div>
                    <h4 className="text-white font-medium">{machine.name}</h4>
                    <p className="text-sm text-gray-400">Usage: {machine.usage} hrs/day</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`font-semibold px-3 py-1 rounded-full text-sm border ${getStatusClass(machine.status)}`}>
                      {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                    </span>
                    <span className="text-purple-400 group-hover:text-purple-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Machine Details Modal */}
      {showMachineDetails && selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedMachine.name}</h3>
                <div className="text-sm text-gray-400 font-mono mt-1">ID: {selectedMachine.id.toUpperCase()}</div>
              </div>
              <button onClick={() => setShowMachineDetails(false)} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
                <h4 className="text-lg font-medium text-white mb-4">Usage Analytics</h4>
                <div style={{width:'100%', maxWidth:'350px', height:'220px'}}>
                  <canvas ref={machineChartRef} style={{width:'100%', height:'220px'}}></canvas>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-4">Machine Status</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusClass(selectedMachine.status)}`}>
                      {selectedMachine.status.charAt(0).toUpperCase() + selectedMachine.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Daily Usage</span>
                    <span className="text-white font-semibold">{selectedMachine.usage} hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Condition</span>
                    <span className="text-white font-semibold">{selectedMachine.condition}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Maintenance</span>
                    <span className="text-white font-semibold">{selectedMachine.lastMaintenance}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardDemo;