import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import '../css/Dashboard.css';
import ChatBot from './ChatBot';
// import NotificationBell from './NotificationBell';

function randomSeries(n, max = 60) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * max));
}

const fakeMachines = [
  { machineId: 'm1', machineName: 'Treadmill #1' },
  { machineId: 'm2', machineName: 'Bench Press #1' },
  { machineId: 'm3', machineName: 'Bike #1' },
  { machineId: 'm4', machineName: 'Elliptical #1' },
];

// In-house dropdown styled like our dark buttons
function NxDropdown({ options, value, onChange, minWidth = 160 }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = options.find(o => String(o.value) === String(value)) || options[0];

  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="nx-dd" ref={wrapperRef} style={{ minWidth }}>
      <button className="nx-btn nx-dd-button" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{selected?.label}</span>
        <span className="nx-caret">▾</span>
      </button>
      {open && (
        <div className="nx-dd-menu" role="listbox">
          {options.map(opt => (
            <div
              key={String(opt.value)}
              role="option"
              aria-selected={String(opt.value) === String(value)}
              className="nx-dd-item"
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TempDashboard() {
  const displayName = 'Guest User';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats] = useState({
    currentOccupancy: 23,
    peakHours: '5-7 PM',
    numDevices: 18,
    dailyFav: { machineName: 'Treadmill #1' },
    weeklyFav: { machineName: 'Squat Rack #2' },
  });
  const [selectedMachine, setSelectedMachine] = useState(fakeMachines[0].machineId);
  const [selectedRange, setSelectedRange] = useState(12);
  const [selectedAvgRange, setSelectedAvgRange] = useState(12);
  const [selectedCumRange, setSelectedCumRange] = useState(12);

  const chartInstancesRef = useRef({});
  const hourlyUsageChartRef = useRef(null);
  const avgUsageChartRef = useRef(null);
  const cumUsageChartRef = useRef(null);

  const labels12 = ['6a','8a','10a','12p','2p','4p','6p','8p','10p','12a','2a','4a'];

  useEffect(() => {
    // Hourly line
    if (hourlyUsageChartRef.current) {
      const ctx = hourlyUsageChartRef.current.getContext('2d');
      if (chartInstancesRef.current.hourly) chartInstancesRef.current.hourly.destroy();
      chartInstancesRef.current.hourly = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels12.slice(0, selectedRange > 8 ? 12 : 8),
          datasets: [{
            label: 'Usage (min)',
            data: randomSeries(selectedRange > 8 ? 12 : 8),
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            borderColor: '#7C3AED',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#ffffff',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, labels: { color: '#e5e7eb' } } },
          scales: {
            x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } },
            y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true },
          },
          interaction: { mode: 'nearest', intersect: false },
        }
      });
    }

    // Average bar
    if (avgUsageChartRef.current) {
      const ctx = avgUsageChartRef.current.getContext('2d');
      if (chartInstancesRef.current.avg) chartInstancesRef.current.avg.destroy();
      chartInstancesRef.current.avg = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: fakeMachines.map(m => m.machineName),
          datasets: [{
            label: 'Avg Daily Usage (min)',
            data: randomSeries(fakeMachines.length, 50),
            backgroundColor: '#7C3AED',
            borderRadius: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, labels: { color: '#e5e7eb' } } },
          scales: {
            x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } },
            y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true },
          },
          interaction: { mode: 'nearest', intersect: false },
        }
      });
    }

    // Cumulative line
    if (cumUsageChartRef.current) {
      const ctx = cumUsageChartRef.current.getContext('2d');
      if (chartInstancesRef.current.cum) chartInstancesRef.current.cum.destroy();
      const series = randomSeries(selectedCumRange > 8 ? 12 : 8);
      const cumulative = series.reduce((acc, v) => { acc.push((acc.at(-1) || 0) + v); return acc; }, []);
      chartInstancesRef.current.cum = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels12.slice(0, selectedCumRange > 8 ? 12 : 8),
          datasets: [{
            label: 'Cumulative Usage',
            data: cumulative,
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            borderColor: '#7C3AED',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#ffffff',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, labels: { color: '#e5e7eb' } } },
          scales: {
            x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } },
            y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true },
          },
          interaction: { mode: 'nearest', intersect: false },
        }
      });
    }
  }, [selectedRange, selectedAvgRange, selectedCumRange, selectedMachine, activeTab]);

  const equipmentRows = [
    { name: 'Treadmill #1', status: 'active', lastSeen: 'just now' },
    { name: 'Bench Press #1', status: 'inactive', lastSeen: '12 min ago' },
    { name: 'Bike #1', status: 'maintenance', lastSeen: '2 hr ago' },
  ];

  // Dashboard-level Alerts and Maintenance Modal (mocked)
  const [alerts, setAlerts] = useState([
    { id: 'a1', title: 'Machine Issue Detected', machineId: 'Treadmill #1', description: 'Usage drop vs baseline detected', resolved: false, type: 'anomaly' },
    { id: 'a2', title: 'Sensor Offline', machineId: 'Bike #1', description: 'Last heartbeat > 20 min', resolved: false, type: 'sensor' },
    { id: 'a3', title: 'Maintenance Due Soon', machineId: 'Bench Press #1', description: 'Preventive window approaching', resolved: true, type: 'maintenance' },
  ]);
  const [maintOpen, setMaintOpen] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [activeAlert, setActiveAlert] = useState(null);
  const [maintContact, setMaintContact] = useState('');
  const [maintIssues, setMaintIssues] = useState(new Set());
  const [maintChecked, setMaintChecked] = useState(undefined); // true|false
  const [maintBroken, setMaintBroken] = useState(undefined);
  const [maintNotes, setMaintNotes] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const snapshotAlerts = () => alerts.map(a => ({ ...a }));

  const resolveAlert = (id) => {
    setUndoStack(prev => [...prev, snapshotAlerts()]);
    setRedoStack([]);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };
  const undoResolve = () => {
    if (undoStack.length === 0) return;
    const prevState = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setRedoStack(s => [...s, snapshotAlerts()]);
    setAlerts(prevState);
  };
  const redoResolve = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(s => s.slice(0, -1));
    setUndoStack(s => [...s, snapshotAlerts()]);
    setAlerts(nextState);
  };
  const openMaint = (alert) => { setActiveAlert(alert); setMaintOpen(true); setFormStep(0); setMaintChecked(undefined); setMaintBroken(undefined); setMaintIssues(new Set()); setMaintNotes(''); setMaintContact(''); };
  const toggleIssue = (key) => setMaintIssues(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });

  const statusLabel = (s) => s === 'active' ? 'In Use' : s === 'inactive' ? 'Available' : s === 'maintenance' ? 'Maintenance' : 'Unknown';
  const statusClass = (s) => s === 'active' ? 'status--active' : s === 'inactive' ? 'status--inactive' : s === 'maintenance' ? 'status--maintenance' : 'status--unknown';

  return (
    <div className="nx-dashboard">

      <style>{`
        /* Base dark background with purple accents */
        .nx-dashboard { background:#0b0b0f; min-height:100vh; padding:24px 24px 24px 12px; color:#e5e7eb; }
        .nx-container { max-width:1400px; margin:0 auto; }
        .nx-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:20px; }
        .nx-title-row { display:flex; align-items:center; gap:10px; }
        .nx-title { font-size:20px; font-weight:700; color:#ffffff; }
        .nx-sep-dot { width:6px; height:6px; background:#ef4444; border-radius:9999px; display:inline-block; }
        .nx-alerts { font-size:16px; color:#ef4444; }
        .nx-actions { display:flex; gap:8px; align-items:center; }
        .nx-btn { appearance:none; border:1px solid #262633; background:#13131a; color:#e5e7eb; padding:8px 12px; border-radius:8px; font-size:13px; }
        .nx-btn.primary { background:#000000; color:#ffffff; border-color:#000000; }
        .nx-content { display:flex; gap:16px; align-items:stretch; }
        .nx-rail { width:200px; background:#111119; border:1px solid #1d1d29; border-radius:14px; padding:12px; display:flex; flex-direction:column; min-height: 100%; }
        .nx-rail-item { padding:12px 10px; border-radius:8px; background:transparent; color:#e5e7eb; border:none; text-align:left; cursor:pointer; position:relative; }
        .nx-rail-item:hover { background: rgba(255,255,255,.04); }
        .nx-rail-item.active::after { content:""; position:absolute; left:10px; right:10px; bottom:6px; height:2px; background:#7C3AED; border-radius:2px; }
        .nx-rail-note { margin-top:6px; padding:0 10px 8px; font-size:11px; color:#9ca3af; opacity:.85; }
        .nx-main { flex:1; min-height:720px; }
        .nx-grid { display:grid; grid-template-columns:repeat(12,1fr); gap:16px; }
        .nx-card { background:#111119; border:1px solid #1d1d29; border-radius:14px; box-shadow:0 1px 2px rgba(0,0,0,0.35); padding:16px; }
        .nx-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .nx-card-title { font-size:13px; font-weight:600; color:#a3a3b2; }
        .nx-metric { font-size:28px; font-weight:700; color:#ffffff; letter-spacing:0.2px; }
        .nx-subtle { font-size:12px; color:#9ca3af; }
        .nx-chip { background:rgba(124,58,237,0.15); color:#c4b5fd; font-size:11px; padding:2px 6px; border-radius:999px; margin-left:8px; border:1px solid rgba(124,58,237,0.35); }
        .nx-chip.red { background:rgba(239,68,68,0.12); color:#fecaca; border-color:rgba(239,68,68,0.35); }
        .nx-chart { height:260px; }
        .nx-select { padding:6px 10px; border-radius:8px; border:1px solid #262633; background:#13131a; color:#e5e7eb; font-size:12px; }
        /* Dropdown */
        .nx-dd { position:relative; }
        .nx-dd-button { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; }
        .nx-caret { opacity:0.8; }
        .nx-dd-menu { position:absolute; top:calc(100% + 8px); right:0; background:#111119; border:1px solid #1d1d29; border-radius:12px; box-shadow:0 10px 24px rgba(0,0,0,0.45); padding:6px; z-index:40; min-width:100%; }
        .nx-dd-item { padding:8px 10px; border-radius:8px; cursor:pointer; color:#e5e7eb; font-size:13px; }
        .nx-dd-item[aria-selected="true"], .nx-dd-item:hover { background:rgba(124,58,237,0.18); color:#c4b5fd; }
        .nx-table { width:100%; border-collapse:separate; border-spacing:0; }
        .nx-thead { display:grid; grid-template-columns:1fr 120px 120px; gap:12px; padding:12px 16px; color:#a3a3b2; font-size:12px; }
        .nx-trow { display:grid; grid-template-columns:1fr 120px 120px; gap:12px; padding:14px 16px; border-top:1px solid #1f2430; align-items:center; }
        .nx-badge { padding:4px 8px; border-radius:999px; font-size:12px; font-weight:600; }
        .nx-badge.active { background:rgba(124,58,237,0.18); color:#c4b5fd; border:1px solid rgba(124,58,237,0.35); }
        .nx-badge.inactive { background:#171923; color:#94a3b8; border:1px solid #1f2430; }
        .nx-badge.maintenance { background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.4); }
        /* Alerts list & modal */
        .nx-pill { font-size:12px; border:1px solid #262633; border-radius:999px; color:#cbd5e1; background:#13131a; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; height:32px; padding:0 12px; }
        .nx-pill.primary { background:#7C3AED; border-color:#7C3AED; color:#fff; height:32px; }
        .nx-alert-row { display:grid; grid-template-columns:1fr auto; gap:8px; padding:10px 0; border-top:1px solid #1c1c27; }
        .nx-alert-row:first-of-type { border-top:none; }
        .nx-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index:80; display:flex; align-items:center; justify-content:center; }
        .nx-modal { width:min(640px, 92vw); background:#0f0f15; border:1px solid #1d1d29; border-radius:14px; box-shadow:0 20px 60px rgba(0,0,0,.6); padding:16px; }
        .nx-modal-title { font-weight:700; color:#fff; margin-bottom:10px; }
        .nx-modal-q { color:#e5e7eb; font-weight:600; margin-bottom:8px; }
        .nx-modal-row { display:flex; gap:8px; flex-wrap:wrap; }
        .nx-modal-btn { background:#13131a; border:1px solid #262633; color:#e5e7eb; padding:8px 10px; border-radius:10px; cursor:pointer; }
        .nx-modal-checkbox { background:#13131a; border:1px solid #262633; color:#e5e7eb; padding:8px 10px; border-radius:10px; cursor:pointer; }
        .nx-modal-checkbox.active { outline:2px solid rgba(124,58,237,0.45); }
        .nx-modal-text { width:100%; background:#13131a; border:1px solid #262633; color:#e5e7eb; padding:8px 10px; border-radius:10px; margin-top:8px; }
        .nx-modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
      `}</style>

      <div className="nx-container" style={{flex:1}}>
        <div className="nx-header">
          <div className="nx-title-row">
            <div className="nx-title">Henry Crown Sports Pavillion</div>
            {/* <span className="nx-sep-dot" />
            <div className="nx-alerts">2 Alerts</div> */}
          </div>
          <div className="nx-actions">
            <NxDropdown
              value={selectedRange}
              onChange={(v) => setSelectedRange(parseInt(v))}
              options={[{ value: 8, label: 'Past 8 Hours' }, { value: 12, label: 'Past 12 Hours' }]}
              minWidth={150}
            />
            <button className="nx-btn">Export</button>
            {/* <NotificationBell /> */}
          </div>
        </div>

        <div className="nx-content" style={{minHeight: '830px'}}>
          <div className="nx-rail">
            <button className={`nx-rail-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
            <button className={`nx-rail-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
            <button className={`nx-rail-item ${activeTab === 'chatbot' ? 'active' : ''}`} onClick={() => setActiveTab('chatbot')}>Chatbot</button>
      </div>

          <div className="nx-main">
            {activeTab === 'chatbot' ? (
              <div className="nx-card" style={{padding:0, height: '830px'}}>
                <ChatBot embedded={true} />
              </div>
            ) : activeTab === 'analytics' ? (
              <>
                <div className="nx-grid" style={{marginBottom:'8px'}}>
                  <div className="nx-card" style={{gridColumn:'span 12', height:'830px'}}>
                    {/* Empty analytics canvas placeholder */}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Top metrics */}
                <div className="nx-grid" style={{marginBottom:'8px'}}>
                  <div className="nx-card" style={{gridColumn:'span 3'}}>
                    <div className="nx-card-header"><span className="nx-card-title">Daily Favorite</span></div>
                    <div className="nx-metric" style={{display:'flex', alignItems:'center'}}>
                      {stats.dailyFav.machineName}
                      <span className="nx-chip">New</span>
                    </div>
                    <div className="nx-subtle">Today's most used machine</div>
        </div>
                  <div className="nx-card" style={{gridColumn:'span 3'}}>
                    <div className="nx-card-header"><span className="nx-card-title">Peak Hours</span></div>
                    <div className="nx-metric" style={{display:'flex', alignItems:'center'}}>
                      {stats.peakHours}
                      <span className="nx-chip">+15.8%</span>
        </div>
                    <div className="nx-subtle">Most active time today</div>
        </div>
                  <div className="nx-card" style={{gridColumn:'span 3'}}>
                    <div className="nx-card-header"><span className="nx-card-title">Current Occupancy</span></div>
                    <div className="nx-metric" style={{display:'flex', alignItems:'center'}}>
                      {stats.currentOccupancy}
                      <span className="nx-chip">Live</span>
      </div>
                    <div className="nx-subtle">Machines in use</div>
        </div>
                  <div className="nx-card" style={{gridColumn:'span 3'}}>
                    <div className="nx-card-header"><span className="nx-card-title">Machine Sensors</span></div>
                    <div className="nx-metric" style={{display:'flex', alignItems:'center'}}>
                      {stats.numDevices}
                      <span className="nx-chip">Stable</span>
        </div>
                    <div className="nx-subtle">Connected sensors</div>
        </div>
      </div>

                {/* Main charts row */}
                <div className="nx-grid" style={{marginTop:'8px'}}>
                  <div className="nx-card" style={{gridColumn:'span 8'}}>
                    <div className="nx-card-header">
                      <div>
                        <div className="nx-card-title">Hourly Machine Usage</div>
                        <div className="nx-subtle">{(() => { const found = fakeMachines.find(m => String(m.machineId) === String(selectedMachine)); return selectedMachine ? (found ? found.machineName : 'Unknown') : 'N/A'; })()}</div>
              </div>
                      <div style={{display:'flex', gap:8}}>
                        <NxDropdown
                          value={selectedMachine}
                          onChange={(v) => setSelectedMachine(v)}
                          options={fakeMachines.map(m => ({ value: m.machineId, label: m.machineName }))}
                          minWidth={170}
                        />
              </div>
            </div>
                    <div className="nx-chart"><canvas ref={hourlyUsageChartRef}></canvas></div>
                  </div>
                  {/* Cumulative Usage temporarily replaced by Alerts */}
                  <div className="nx-card" style={{gridColumn:'span 4'}}>
                    <div className="nx-card-header">
                      <div>
                        <div className="nx-card-title">Alerts</div>
                        <div className="nx-subtle">Realtime machine alerts</div>
          </div>
                      <div style={{display:'flex', gap:8}}>
                        <button className="nx-pill" onClick={undoResolve} disabled={undoStack.length===0} aria-label="Undo" title="Undo">←</button>
                        <button className="nx-pill" onClick={redoResolve} disabled={redoStack.length===0} aria-label="Redo" title="Redo">→</button>
              </div>
            </div>
                    <div>
                      {alerts.filter(a=>!a.resolved).map(a => (
                        <div key={a.id} className="nx-alert-row">
                          <div>
                            <div className="nx-title" style={{fontSize:14, color:'#e5e7eb'}}>{a.title}</div>
                            <div className="nx-subtle">{a.machineId} • {a.description}</div>
          </div>
                          <div style={{display:'flex', gap:8}}>
                            <button className="nx-pill" onClick={()=>resolveAlert(a.id)}>Resolve</button>
                            <button className="nx-pill primary" onClick={()=>openMaint(a)}>Details</button>
              </div>
            </div>
                      ))}
          </div>
        </div>
      </div>

                {/* Bottom row */}
                <div className="nx-grid" style={{marginTop:'8px'}}>
                  <div className="nx-card" style={{gridColumn:'span 7'}}>
                    <div className="nx-card-header">
                      <div>
                        <div className="nx-card-title">Average Machine Usage</div>
                        <div className="nx-subtle">Per machine</div>
                      </div>
                      {/* range control removed; header dropdown is the single source */}
                    </div>
                    <div className="nx-chart"><canvas ref={avgUsageChartRef}></canvas></div>
                  </div>
                  <div className="nx-card" style={{gridColumn:'span 5'}}>
                    <div className="nx-card-header">
                      <div className="nx-card-title">Equipment Status</div>
                      <button className="nx-btn">See All</button>
                    </div>
                    <div className="nx-table-wrap">
                      <div className="nx-thead">
            <div>Equipment</div>
            <div>Status</div>
            <div>Last Seen</div>
          </div>
            {equipmentRows.map((row) => (
                        <div className="nx-trow" key={row.name}>
                          <div>{row.name}</div>
                          <div>
                            <span className={`nx-badge ${row.status === 'active' ? 'active' : row.status === 'inactive' ? 'inactive' : 'maintenance'}`}>{statusLabel(row.status)}</span>
                          </div>
                          <div className="nx-subtle">{row.lastSeen}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Maintenance Modal */}
        {maintOpen && (
          <div className="nx-modal-overlay" role="dialog" aria-modal="true">
            <div className="nx-modal">
              <div className="nx-modal-title">Maintenance — {activeAlert?.machineId}</div>
              {formStep === 0 && (
                <div>
                  <div className="nx-modal-q">Did you check {activeAlert?.machineId}?</div>
                  <div className="nx-modal-row">
                    <button className="nx-modal-btn" onClick={()=>{ setMaintChecked(true); setFormStep(1); }}>Yes</button>
                    <button className="nx-modal-btn" onClick={()=>{ setMaintChecked(false); setFormStep(99); }}>No</button>
                  </div>
                </div>
              )}
              {formStep === 1 && (
                <div>
                  <div className="nx-modal-q">Is it broken?</div>
                  <div className="nx-modal-row">
                    <button className="nx-modal-btn" onClick={()=>{ setMaintBroken(true); setFormStep(2); }}>Yes</button>
                    <button className="nx-modal-btn" onClick={()=>{ setMaintBroken(false); setFormStep(5); }}>No</button>
                  </div>
                </div>
              )}
              {formStep === 99 && (
                <div>
                  <div className="nx-modal-q">Please check when you can.</div>
                  <div className="nx-modal-actions">
                    <button className="nx-modal-btn" onClick={()=>setMaintOpen(false)}>Dismiss</button>
                    <button className="nx-modal-btn" onClick={()=>setMaintOpen(false)}>Snooze</button>
                  </div>
                </div>
              )}
              {formStep === 2 && (
                <div>
                  <div className="nx-modal-q">What’s broken?</div>
                  <div className="nx-modal-row">
                    {['Power','Mechanical','Electronic','Sensor','Other'].map(opt => (
                      <button key={opt} className={`nx-modal-checkbox ${maintIssues.has(opt) ? 'active' : ''}`} onClick={()=>toggleIssue(opt)}>{opt}</button>
                    ))}
                  </div>
                  <textarea className="nx-modal-text" rows={3} placeholder="Notes (optional)" value={maintNotes} onChange={(e)=>setMaintNotes(e.target.value)} />
                  <div className="nx-modal-actions">
                    <button className="nx-modal-btn" onClick={()=>setFormStep(1)}>Back</button>
                    <button className="nx-modal-btn" onClick={()=>setFormStep(3)}>Next</button>
                  </div>
                </div>
              )}
              {formStep === 5 && (
                <div>
                  <div className="nx-modal-q">Great. We’ll keep monitoring.</div>
                  <div className="nx-modal-actions">
                    <button className="nx-modal-btn" onClick={()=>setMaintOpen(false)}>Close</button>
                  </div>
                </div>
              )}
              {formStep === 3 && (
                <div>
                  <div className="nx-modal-q">Contact maintenance?</div>
                  <div style={{maxWidth:240}}>
                    <NxDropdown
                      value={maintContact || ''}
                      onChange={(v)=>setMaintContact(v)}
                      options={[
                        { value: '', label: 'Select contact…' },
                        { value: 'Front Desk', label: 'Front Desk' },
                        { value: 'Facilities', label: 'Facilities' },
                        { value: 'Vendor: ACME Fitness', label: 'Vendor: ACME Fitness' },
                      ]}
                      minWidth={240}
                    />
                  </div>
                  <div className="nx-modal-actions">
                    <button className="nx-modal-btn" onClick={()=>setFormStep(2)}>Back</button>
                    <button className="nx-modal-btn" onClick={()=>setMaintOpen(false)}>Submit</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default TempDashboard;


