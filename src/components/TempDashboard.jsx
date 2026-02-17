import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import ChatBot from './ChatBot';
import MaintenanceTab from '../tabs/MaintenanceTab.jsx';
import TicketsTab from '../tabs/TicketsTab.jsx';
import { buildEquipmentRows } from '../utils/occupancyTable';

const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');
const LEGACY_ZONE_ID_MAP = Object.freeze({
  '10': '22',
  '20': '23',
});
const LEGACY_ZONE_ID_REVERSE_MAP = Object.freeze(
  Object.entries(LEGACY_ZONE_ID_MAP).reduce((acc, [legacy, canonical]) => {
    acc[canonical] = legacy;
    return acc;
  }, {})
);
const EXCLUDED_ZONE_IDS = new Set(['21']);

function canonicalZoneKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
}

function stripZonePrefix(value) {
  const key = canonicalZoneKey(value);
  if (!key) return '';
  if (key.startsWith('zone-')) return key.slice(5);
  if (key.startsWith('zone')) return key.slice(4).replace(/^-+/, '');
  return key;
}

function normalizeZoneId(value) {
  const stripped = stripZonePrefix(value);
  if (!stripped) return '';
  const remapped = LEGACY_ZONE_ID_MAP[stripped] || stripped;
  return /^\d+$/.test(remapped) ? String(Number(remapped)) : remapped;
}

function isExcludedZone(value) {
  const zoneId = normalizeZoneId(value);
  return Boolean(zoneId) && EXCLUDED_ZONE_IDS.has(String(zoneId));
}

function normalizeMachineIdValue(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^ObjectId\(["']?([0-9a-fA-F]{24})["']?\)$/i);
  return match ? match[1] : raw;
}

function deriveZoneFromMachineId(value) {
  const machineId = normalizeMachineIdValue(value);
  const match = machineId.match(/^([1-9]\d*?)0+/);
  if (!match) return '';
  return String(Number(match[1]));
}

function normalizeZoneSvgId(value, zoneId = '') {
  const raw = String(value || '').trim();
  if (raw) {
    if (canonicalZoneKey(raw).startsWith('zone')) {
      const normalized = normalizeZoneId(raw);
      return normalized ? `zone-${normalized}` : raw;
    }
    return raw;
  }
  const normalizedZone = normalizeZoneId(zoneId);
  return normalizedZone ? `zone-${normalizedZone}` : '';
}

function normalizeZoneConfig(zone) {
  const zoneId = normalizeZoneId(zone?.id);
  if (!zoneId || isExcludedZone(zoneId)) return null;
  return {
    ...zone,
    id: zoneId,
    svgId: normalizeZoneSvgId(zone?.svgId, zoneId),
  };
}

function normalizeMapConfig(mapCfg) {
  if (!mapCfg || typeof mapCfg !== 'object') return null;
  const zones = Array.isArray(mapCfg.zones)
    ? mapCfg.zones.map(normalizeZoneConfig).filter(Boolean)
    : [];
  const floors = Array.isArray(mapCfg.floors)
    ? mapCfg.floors
        .filter(f => f && f.id)
        .map(f => ({
          ...f,
          zones: Array.isArray(f.zones)
            ? f.zones.map(normalizeZoneConfig).filter(Boolean)
            : [],
        }))
    : [];
  return {
    ...mapCfg,
    zones,
    floors,
  };
}

function getZoneSvgCandidates(zone) {
  const ids = new Set();
  const add = (value) => {
    const id = String(value || '').trim();
    if (id) ids.add(id);
  };

  const zoneId = normalizeZoneId(zone?.id);
  add(zone?.svgId);
  add(zoneId ? `zone-${zoneId}` : '');

  const legacyZoneId = LEGACY_ZONE_ID_REVERSE_MAP[zoneId];
  add(legacyZoneId ? `zone-${legacyZoneId}` : '');

  const normalizedSvgZone = normalizeZoneId(zone?.svgId);
  const legacyFromSvg = LEGACY_ZONE_ID_REVERSE_MAP[normalizedSvgZone];
  add(legacyFromSvg ? `zone-${legacyFromSvg}` : '');

  return Array.from(ids);
}

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

function getConfiguredZones(mapCfg) {
  if (!mapCfg) return [];
  if (Array.isArray(mapCfg.floors) && mapCfg.floors.length) {
    return mapCfg.floors
      .flatMap(f => (Array.isArray(f.zones) ? f.zones : []))
      .map(normalizeZoneConfig)
      .filter(Boolean);
  }
  return Array.isArray(mapCfg.zones)
    ? mapCfg.zones.map(normalizeZoneConfig).filter(Boolean)
    : [];
}

const HEATMAP_COLOR_STOPS = Object.freeze([
  { t: 0, rgb: [34, 197, 94] },   // green
  { t: 0.35, rgb: [250, 204, 21] }, // yellow
  { t: 0.7, rgb: [249, 115, 22] },  // orange
  { t: 1, rgb: [239, 68, 68] },   // red
]);
const SEARCH_RANGE_OPTIONS = Object.freeze([
  { value: 'all', label: 'All Time' },
  { value: '6', label: 'Past 6 Hours' },
  { value: '8', label: 'Past 8 Hours' },
  { value: '12', label: 'Past 12 Hours' },
  { value: '24', label: 'Past 24 Hours' },
  { value: '168', label: 'Past Week' },
  { value: '720', label: 'Past Month' },
]);

function interpolateHeatmapColor(t) {
  const clamped = Math.max(0, Math.min(1, Number(t) || 0));
  for (let i = 0; i < HEATMAP_COLOR_STOPS.length - 1; i++) {
    const a = HEATMAP_COLOR_STOPS[i];
    const b = HEATMAP_COLOR_STOPS[i + 1];
    if (clamped >= a.t && clamped <= b.t) {
      const span = Math.max(0.0001, b.t - a.t);
      const p = (clamped - a.t) / span;
      const r = Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * p);
      const g = Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * p);
      const bCh = Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * p);
      return [r, g, bCh];
    }
  }
  return HEATMAP_COLOR_STOPS[HEATMAP_COLOR_STOPS.length - 1].rgb;
}

function TempDashboard() {
  const displayName = localStorage.getItem('displayName') || 'Guest User';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Dashboard stats from backend
  const [stats, setStats] = useState({
    currentOccupancy: 0,
    peakHours: '--',
    numDevices: 0,
    dailyFav: { machineName: '--' },
    weeklyFav: { machineName: '--' },
  });
  
  // Chart data state
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedRange, setSelectedRange] = useState(12);
  const [selectedCumRange, setSelectedCumRange] = useState(12);
  const [machineOptions, setMachineOptions] = useState([]);
  const [equipmentRows, setEquipmentRows] = useState([]);
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [avgUsageRows, setAvgUsageRows] = useState([]);
  const [selectedSearchRange, setSelectedSearchRange] = useState('all');
  const [selectedTopN, setSelectedTopN] = useState('5');
  const [selectedZone, setSelectedZone] = useState('');
  const [usageRankSort, setUsageRankSort] = useState('most');
  const [analyticsSearchTerm, setAnalyticsSearchTerm] = useState('');
  const [selectedAnalyticsZones, setSelectedAnalyticsZones] = useState([]);
  const [analyticsPage, setAnalyticsPage] = useState(0);
  const [analyticsZoneFilterOpen, setAnalyticsZoneFilterOpen] = useState(false);
  const [machineZoneMap, setMachineZoneMap] = useState({});
  
  // Alerts and maintenance state
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState('');
  const [maintOpen, setMaintOpen] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [activeAlert, setActiveAlert] = useState(null);
  const [maintContact, setMaintContact] = useState('');
  const [maintIssues, setMaintIssues] = useState(new Set());
  const [maintChecked, setMaintChecked] = useState(undefined);
  const [maintBroken, setMaintBroken] = useState(undefined);
  const [maintNotes, setMaintNotes] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  // Resolve modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [alertToResolve, setAlertToResolve] = useState(null);


  const chartInstancesRef = useRef({});
  const hourlyUsageChartRef = useRef(null);
  const avgUsageChartRef = useRef(null);
  const cumUsageChartRef = useRef(null);
  const analyticsChartRef = useRef(null);
  const [facilityZones, setFacilityZones] = useState([]);
  const [facilityLoading, setFacilityLoading] = useState(false);
  const [facilityRange, setFacilityRange] = useState(12);
  const [selectedFloorId, setSelectedFloorId] = useState('');
  const [facilityMachines, setFacilityMachines] = useState([]);
  const [mapConfig, setMapConfig] = useState(null);
  const [svgDiscoveredZones, setSvgDiscoveredZones] = useState([]);
  const svgObjectRef = useRef(null);
  const analyticsZoneFilterRef = useRef(null);

  const mapFloors = useMemo(() => {
    if (!mapConfig || !Array.isArray(mapConfig.floors)) return [];
    return mapConfig.floors.filter(f => f && f.id);
  }, [mapConfig]);

  const floorOptions = useMemo(() => (
    mapFloors.map(f => ({ value: f.id, label: f.label || f.id }))
  ), [mapFloors]);

  const defaultFloorId = useMemo(() => (
    mapConfig?.defaultFloorId || mapFloors[0]?.id || ''
  ), [mapConfig, mapFloors]);

  const activeFloorId = useMemo(() => {
    if (!mapFloors.length) return '';
    const match = mapFloors.find(f => String(f.id) === String(selectedFloorId));
    return match ? match.id : defaultFloorId;
  }, [mapFloors, selectedFloorId, defaultFloorId]);

  const activeFloor = useMemo(() => {
    if (!mapFloors.length) return null;
    return mapFloors.find(f => String(f.id) === String(activeFloorId)) || mapFloors[0];
  }, [mapFloors, activeFloorId]);

  const activeZones = useMemo(() => {
    const discoveredZoneSet = new Set(
      (svgDiscoveredZones || [])
        .map(z => normalizeZoneId(z?.id))
        .filter(Boolean)
        .map(String)
    );

    if (activeFloor && Array.isArray(activeFloor.zones) && activeFloor.zones.length) {
      if (!discoveredZoneSet.size) return activeFloor.zones;
      const hasOverlap = activeFloor.zones.some(z => discoveredZoneSet.has(String(normalizeZoneId(z?.id))));
      return hasOverlap ? activeFloor.zones : svgDiscoveredZones;
    }

    if (activeFloor && svgDiscoveredZones.length) return svgDiscoveredZones;

    if (Array.isArray(mapConfig?.zones) && mapConfig.zones.length) {
      if (!discoveredZoneSet.size) return mapConfig.zones;
      const hasOverlap = mapConfig.zones.some(z => discoveredZoneSet.has(String(normalizeZoneId(z?.id))));
      return hasOverlap ? mapConfig.zones : svgDiscoveredZones;
    }

    if (svgDiscoveredZones.length) return svgDiscoveredZones;
    return [];
  }, [activeFloor, mapConfig, svgDiscoveredZones]);

  const activeFloorplanUrl = activeFloor?.svgUrl || mapConfig?.floorplanUrl || '';

  const activeZoneMinutes = useMemo(() => {
    if (!activeZones.length) return [];
    return activeZones.map(z => {
      const match = (facilityZones || []).find(fz => String(fz.zone) === String(z.id));
      return { zone: z.id, minutes: match?.minutes || 0 };
    });
  }, [activeZones, facilityZones]);

  const shouldShowNoFacilityData = useMemo(() => {
    if (facilityLoading) return false;
    if (!activeZoneMinutes.length) return false;
    const hasAnyMachineRows = Array.isArray(facilityMachines) && facilityMachines.length > 0;
    return !hasAnyMachineRows && activeZoneMinutes.every(z => (z.minutes || 0) === 0);
  }, [facilityLoading, activeZoneMinutes, facilityMachines]);

  const SIDEBAR_HEIGHT = 1080;
  const DASHBOARD_CONTENT_HEIGHT = SIDEBAR_HEIGHT;
  const ANALYTICS_RANK_PAGE_SIZE = 8;

  const filteredMachineOptions = useMemo(() => {
    if (!selectedZone) return machineOptions;
    const zoneSet = new Set(
      (facilityMachines || [])
        .filter(m => String(m.zone) === String(selectedZone))
        .map(m => String(m.machineId))
    );
    if (zoneSet.size === 0) return [];
    return machineOptions.filter(m => zoneSet.has(String(m.machineId)));
  }, [selectedZone, machineOptions, facilityMachines]);

  useEffect(() => {
    if (!mapFloors.length) return;
    const hasSelection = mapFloors.some(f => String(f.id) === String(selectedFloorId));
    const next = hasSelection ? selectedFloorId : defaultFloorId;
    if (next && next !== selectedFloorId) {
      setSelectedFloorId(next);
    }
  }, [mapFloors, defaultFloorId, selectedFloorId]);

  useEffect(() => {
    if (!selectedZone || !activeZones.length) return;
    const inActiveFloor = activeZones.some(z => String(z.id) === String(selectedZone));
    if (!inActiveFloor) setSelectedZone('');
  }, [activeZones, selectedZone]);

  // User authentication check
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const gymId = localStorage.getItem('gymId');
    if (!userEmail || !gymId) {
      navigate('/login');
    } else {
      setUser({ email: userEmail });
    }
  }, [navigate]);

  // Clear alerts when gymId changes (user switches gyms)
  useEffect(() => {
    const gymId = localStorage.getItem('gymId');
    if (gymId && user) {
      // Clear current alerts when switching to a different gym
      setAlerts([]);
      setUndoStack([]);
      setRedoStack([]);
      // Alerts will be refetched by the main useEffect when user changes
    }
  }, [localStorage.getItem('gymId'), user]);

  // Fetch dashboard stats from backend
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
        console.error("Failed to fetch one or more dashboard endpoints");
        return;
      }

      setStats({
        currentOccupancy: occData.currentOccupancy || 0,
        peakHours: peakData.peakHour || '--',
        numDevices: activeData.activeSensorCount || 0,
        dailyFav: dailyData.mostUsedMachine || { machineName: '--' },
        weeklyFav: weeklyData.weeklyFav || { machineName: '--' }
      });

      const rows = buildEquipmentRows(occData);
      setEquipmentRows(rows);

      // Auto-remove alerts for machines that are now active
      // Check if any machines with "active" status have corresponding alerts
      if (Array.isArray(occData.machines)) {
        const activeMachineNames = new Set(
          occData.machines
            .filter(m => m.status === 'active')
            .map(m => m.machineName || m.name || m.id)
        );
        
        // Filter out alerts for machines that are now active
        setAlerts(prevAlerts => {
          const filteredAlerts = prevAlerts.filter(alert => {
            const alertMachine = alert.machineId || alert.machineName;
            const shouldKeep = !activeMachineNames.has(alertMachine);
            
            if (!shouldKeep) {
              console.log(`Auto-removing alert for ${alertMachine} - machine is now active`);
            }
            
            return shouldKeep;
          });
          
          // Only update localStorage if alerts were removed
          if (filteredAlerts.length !== prevAlerts.length) {
            try {
              localStorage.setItem(`alerts_${gymId}`, JSON.stringify(filteredAlerts));
              console.log(`Auto-removed ${prevAlerts.length - filteredAlerts.length} alerts due to machine activity`);
            } catch (e) {
              console.warn('Failed to persist alert auto-removal', e);
            }
          }
          
          return filteredAlerts;
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Fetch machine options from backend
  const fetchMachineOptions = async () => {
    const gymId = localStorage.getItem('gymId');
    if (!gymId) return;
    try {
      const [optionsResult, machinesResult] = await Promise.allSettled([
        fetch(`${backendURL}/api/hourly/options?gymId=${gymId}`),
        fetch(`${backendURL}/api/machines?gymId=${gymId}`),
      ]);

      if (optionsResult.status === 'fulfilled') {
        const res = optionsResult.value;
        const data = await res.json();
        if (Array.isArray(data.machineIds)) {
          setMachineOptions(data.machineIds);
          if (!selectedMachine && data.machineIds.length > 0) {
            setSelectedMachine(data.machineIds[0].machineId);
          }
        }
      }

      if (machinesResult.status === 'fulfilled') {
        const res = machinesResult.value;
        const data = await res.json();
        if (Array.isArray(data)) {
          const nextZoneMap = {};
          data.forEach(machine => {
            const machineId = String(machine?._id || machine?.machineId || '').trim();
            if (!machineId) return;
            const normalizedZone = normalizeZoneId(machine?.zone) || normalizeZoneId(deriveZoneFromMachineId(machineId));
            if (!normalizedZone || isExcludedZone(normalizedZone)) return;
            nextZoneMap[machineId] = normalizedZone;
          });
          setMachineZoneMap(nextZoneMap);
        }
      }
    } catch (err) {
      console.error('Failed to fetch machine options:', err);
    }
  };

  // Build hourly usage chart with backend data
  const buildUsageChart = async () => {
    const gymId = localStorage.getItem('gymId');
    if (!gymId || !selectedMachine) return;
    
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
        const format = (d) => {
          const h = d.getHours();
          const suffix = h < 12 ? 'AM' : 'PM';
          const hour12 = h % 12 || 12;
          if (selectedRange <= 24) {
            return `${hour12}${suffix}`;
          } else {
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
      const maxValue = Math.max(...values, 0);
      const yMax = (Math.ceil(maxValue + 5) >= 60) ? 60 : Math.ceil(maxValue + 5);

      if (hourlyUsageChartRef.current) {
        const ctx = hourlyUsageChartRef.current.getContext('2d');
        if (chartInstancesRef.current.hourly) chartInstancesRef.current.hourly.destroy();
        
        chartInstancesRef.current.hourly = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Usage (min)',
              data: values,
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
              y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true, max: yMax },
            },
            interaction: { mode: 'nearest', intersect: false },
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch hourly usage:", err);
    }
  };

  // Build average usage chart from the same filtered rows as Machine Usage Search.
  const buildWeeklyChart = () => {
    if (!avgUsageChartRef.current) return;
    const ctx = avgUsageChartRef.current.getContext('2d');
    if (chartInstancesRef.current.avg) {
      chartInstancesRef.current.avg.destroy();
      chartInstancesRef.current.avg = null;
    }

    const rows = Array.isArray(analyticsRankRows) ? analyticsRankRows : [];
    if (!rows.length) return;

    const labels = rows.map(r => r.machineName || r.machineId || 'Unknown');
    const values = rows.map(r => Number(r.avgUsageMinutes) || 0);
    const maxValue = Math.max(...values, 0);
    const yMax = Math.ceil(maxValue + 10);

    chartInstancesRef.current.avg = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Avg Usage (min)',
          data: values,
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
          y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true, max: yMax },
        },
        interaction: { mode: 'nearest', intersect: false },
      }
    });
  };

  const fetchUsageSearchRows = async () => {
    const gymId = localStorage.getItem('gymId');
    if (!gymId) {
      setAvgUsageRows([]);
      return;
    }

    try {
      const params = new URLSearchParams({ gymId: String(gymId) });
      if (selectedSearchRange !== 'all') {
        params.set('hours', String(selectedSearchRange));
      }
      const res = await fetch(`${backendURL}/api/weekly/usage?${params.toString()}`);
      const data = await res.json();
      if (!Array.isArray(data.result)) {
        setAvgUsageRows([]);
        return;
      }
      const normalizedRows = data.result.map((d) => ({
        machineId: String(d.machineId || '').trim(),
        machineName: String(d.machineName || d.machineId || 'Unknown').trim(),
        avgMinutes: Number.isFinite(Number(d.avgMinutes)) ? Number(d.avgMinutes) : 0,
      }));
      setAvgUsageRows(normalizedRows);
    } catch (err) {
      console.error('Failed to fetch usage search rows:', err);
      setAvgUsageRows([]);
    }
  };

  // Build cumulative usage chart with backend data
  const buildCumulativeChart = async () => {
    const gymId = localStorage.getItem('gymId');
    if (!gymId) return;
    
    try {
      const res = await fetch(`${backendURL}/api/cum/usage?hours=${selectedCumRange}&gymId=${gymId}`);
      const data = await res.json();
      if (!Array.isArray(data.result)) return;
      
      data.result.sort((a, b) => new Date(a.hour) - new Date(b.hour));
      const grouped = {};
      data.result.forEach(entry => {
        if (!entry || !entry.hour) return;
        const start = new Date(entry.hour);
        const format = (d) => {
          const h = d.getHours();
          const suffix = h < 12 ? 'AM' : 'PM';
          const hour12 = h % 12 || 12;
          if (selectedCumRange <= 24) {
            return `${hour12}${suffix}`;
          } else {
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
      if (!labels.length || !values.length) return;
      
      const maxValue = Math.max(...values, 0);
      const yMax = (Math.ceil(maxValue + 5) >= 60) ? 60 : Math.ceil(maxValue + 5);
      
      if (cumUsageChartRef.current) {
        const ctx = cumUsageChartRef.current.getContext('2d');
        if (chartInstancesRef.current.cum) chartInstancesRef.current.cum.destroy();
        
        const cumulative = values.reduce((acc, v) => { acc.push((acc.at(-1) || 0) + v); return acc; }, []);
        chartInstancesRef.current.cum = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
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
              y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true, max: yMax },
            },
            interaction: { mode: 'nearest', intersect: false },
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch cumulative usage:", err);
    }
  };

  // Fetch analytics data from backend
  const fetchAnalyticsData = async () => {
    try {
      const gymId = localStorage.getItem('gymId');
      if (!gymId) return;
      
      const url = `${backendURL}/api/dow/avg-per-machine?gymId=${gymId}`;
      
      const res = await fetch(url);
      const json = await res.json();
      
      if (Array.isArray(json.result)) {
        // Double-check that all returned machines belong to this gym
        const currentGymId = gymId;
        const filteredData = json.result.filter(m => {
          const belongsToGym = !m.gymId || String(m.gymId) === String(currentGymId);
          if (!belongsToGym) {
            console.warn(`Machine ${m.machineId} (${m.machineName}) belongs to gym ${m.gymId}, not ${currentGymId}`);
          }
          return belongsToGym;
        });
        
        setAnalyticsData(filteredData);
      } else {
        console.error("Unexpected response format:", json);
        setAnalyticsData([]);
      }
    } catch (e) {
      console.error("Failed to fetch analytics data:", e);
      setAnalyticsData([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchFacilityHeatmap = async (rangeHours = 12) => {
    const gymId = localStorage.getItem('gymId');
    if (!gymId) return;
    setFacilityLoading(true);
    try {
      const res = await fetch(`${backendURL}/api/heatmap/heatmap?gymId=${gymId}&hours=${rangeHours}`);
      const data = await res.json();
      if (res.ok && data) {
        const mapCfg = (data.map && (
          (Array.isArray(data.map.zones) && data.map.zones.length) ||
          (Array.isArray(data.map.floors) && data.map.floors.length)
        )) ? normalizeMapConfig(data.map) : null;
        const fallbackMapCfg = mapCfg || normalizeMapConfig({
          layout: 'svg',
          floorplanUrl: 'floorplans/default-gym.svg',
          zones: [
            { id: 'cardio', label: 'Cardio', svgId: 'zone-cardio' },
            { id: 'machines', label: 'Machines', svgId: 'zone-machines' },
            { id: 'cables', label: 'Cable Area', svgId: 'zone-cables' },
          ]
        });
        setMapConfig(fallbackMapCfg);
        const configuredZones = getConfiguredZones(fallbackMapCfg);
        const zonesFromConfig = configuredZones.map(z => ({ zone: z.id, minutes: 0 }));
        const aggregated = {};
        // Aggregate by zone directly from backend
        (data.machines || []).forEach(m => {
          const derivedZone = deriveZoneFromMachineId(m.machineId);
          const zoneId = normalizeZoneId(m.zone || derivedZone) || 'unknown';
          if (isExcludedZone(zoneId)) return;
          const rawVal = m.minutes ?? m.usage ?? m.totalMinutes ?? m.total_minutes ?? m.value ?? 0;
          const minutes = m.unit === 'seconds' ? Number(rawVal) / 60 : Number(rawVal) || 0;
          if (!aggregated[zoneId]) aggregated[zoneId] = 0;
          aggregated[zoneId] += minutes;
        });
        // Merge with any zone-level minutes provided directly
        (data.zones || []).forEach(z => {
          const zoneId = normalizeZoneId(z.zone) || 'unknown';
          if (isExcludedZone(zoneId)) return;
          const minutes = z.minutes || 0;
          if (!aggregated[zoneId]) aggregated[zoneId] = 0;
          aggregated[zoneId] += minutes;
        });
        const mergedZones = configuredZones.map(z => ({
          zone: z.id,
          minutes: aggregated[z.id] || 0,
        }));
        const fallbackZones = (data.zones || []).map(z => ({
          zone: normalizeZoneId(z.zone) || 'unknown',
          minutes: z.minutes || 0,
        })).filter(z => !isExcludedZone(z.zone));
        const zonesToSet = mergedZones.length ? mergedZones : (zonesFromConfig.length ? zonesFromConfig : fallbackZones);
        setFacilityZones(zonesToSet);
        const normalizedMachines = (data.machines || []).map(m => {
          const derivedZone = deriveZoneFromMachineId(m.machineId);
          const zoneId = normalizeZoneId(m.zone || derivedZone) || 'unknown';
          return {
            machineId: m.machineId,
            machineName: m.machineName || m.machineId,
            zone: zoneId
          };
        }).filter(m => !isExcludedZone(m.zone));
        setFacilityMachines(normalizedMachines);
      } else {
        const zeroZones = getConfiguredZones(mapConfig).map(z => ({ zone: z.id, minutes: 0 }));
        setFacilityZones(zeroZones);
        setFacilityMachines([]);
      }
    } catch (e) {
      console.error('Failed to fetch facility heatmap:', e);
      const zeroZones = getConfiguredZones(mapConfig).map(z => ({ zone: z.id, minutes: 0 }));
      setFacilityZones(zeroZones);
      setFacilityMachines([]);
    } finally {
      setFacilityLoading(false);
    }
  };

  const getZoneColor = (minutes, maxMinutes) => {
    const denom = Math.max(1, maxMinutes);
    const t = Math.min(1, minutes / denom);
    const [r, g, b] = interpolateHeatmapColor(t);
    return `rgba(${r}, ${g}, ${b}, 0.78)`;
  };

  const applySvgZoneStyles = () => {
    const obj = svgObjectRef.current;
    if (!obj || !obj.contentDocument) return;
    const svgDoc = obj.contentDocument;
    const svgRoot = svgDoc.querySelector('svg');
    if (!svgRoot) return;
    const zoneElements = Array.from(svgDoc.querySelectorAll('[id^="zone-"]'))
      .filter(el => {
        const id = String(el?.id || '');
        return id && !canonicalZoneKey(id).startsWith('zone-label');
      });
    if (!zoneElements.length) return;

    const activeZoneList = Array.isArray(activeZones) ? activeZones : [];
    const zoneBySvgCandidate = new Map();
    activeZoneList.forEach(z => {
      getZoneSvgCandidates(z).forEach(candidate => {
        zoneBySvgCandidate.set(canonicalZoneKey(candidate), z);
      });
    });

    const maxMinutes = Math.max(
      1,
      ...((facilityZones || []).map(z => Number(z?.minutes) || 0))
    );

    // Disable pointer interception from non-zone SVG elements (invisible text boxes, guides, etc.)
    svgDoc.querySelectorAll('*').forEach(node => {
      node.style.pointerEvents = 'none';
    });
    svgDoc.querySelectorAll('[id^="onsight-label-"]').forEach(el => el.remove());

    zoneElements.forEach(el => {
      const rawId = String(el?.id || '').trim();
      const mappedZone = zoneBySvgCandidate.get(canonicalZoneKey(rawId));
      const resolvedZoneId = normalizeZoneId(mappedZone?.id || rawId) || String(mappedZone?.id || '').trim();
      if (!resolvedZoneId || isExcludedZone(resolvedZoneId)) return;

      const entry = (facilityZones || []).find(fz => (
        String(normalizeZoneId(fz?.zone)) === String(resolvedZoneId)
      )) || {};
      const minutes = Number(entry?.minutes) || 0;
      const color = getZoneColor(minutes, maxMinutes);
      const selected = String(selectedZone) === String(resolvedZoneId);

      el.style.fill = color;
      el.style.stroke = selected ? '#facc15' : '#000000';
      el.style.strokeWidth = selected ? '3' : '1';
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'all';
      el.onclick = () => setSelectedZone(String(resolvedZoneId));

      // Tooltip via <title> inside each zone
      let titleEl = el.querySelector('title');
      if (!titleEl) {
        titleEl = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'title');
        el.prepend(titleEl);
      }
      titleEl.textContent = `${mappedZone?.label || resolvedZoneId}: ${minutes.toFixed(1)} min`;
    });
  };

  const discoverZonesFromSvg = () => {
    const obj = svgObjectRef.current;
    if (!obj || !obj.contentDocument) return;
    const svgDoc = obj.contentDocument;
    const rawZones = Array.from(svgDoc.querySelectorAll('[id^="zone-"]'))
      .map(el => String(el?.id || '').trim())
      .filter(id => id && !canonicalZoneKey(id).startsWith('zone-label'));

    const seen = new Set();
    const discovered = [];
    rawZones.forEach(rawId => {
      const zoneId = normalizeZoneId(rawId);
      if (!zoneId || isExcludedZone(zoneId) || seen.has(zoneId)) return;
      seen.add(zoneId);
      discovered.push({
        id: zoneId,
        label: zoneId,
        svgId: rawId,
      });
    });

    setSvgDiscoveredZones(discovered);
  };

  useEffect(() => {
    setSvgDiscoveredZones([]);
    const obj = svgObjectRef.current;
    if (!obj) return;
    const handleLoad = () => {
      discoverZonesFromSvg();
      applySvgZoneStyles();
    };
    obj.addEventListener('load', handleLoad);
    return () => obj.removeEventListener('load', handleLoad);
  }, [activeFloorplanUrl]);

  useEffect(() => {
    applySvgZoneStyles();
  }, [facilityZones, selectedZone, activeZones, activeFloorplanUrl]);

  // Memoize processed analytics data to prevent dependency array size changes
  const processedAnalyticsData = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return [];
    
    // Filter out machines with no data and calculate totals for ranking
    const withTotals = analyticsData
      .filter((m) => m && (m.machineName || m.machineId)) // Only include machines with valid names/IDs
      .map((m) => {
        const total = (m.days || []).reduce((acc, d) => acc + (d?.avgMinutes || 0), 0);
        return { ...m, __totalAvg: total / 7 };
      });
    
    // Sort by overall average descending
    withTotals.sort((a, b) => (b.__totalAvg || 0) - (a.__totalAvg || 0));
    
    return withTotals;
  }, [analyticsData]);

  // Generate dropdown options for Top N selection
  const topNOptions = useMemo(() => {
    const totalMachines = processedAnalyticsData.length;
    if (totalMachines === 0) return [{ value: 'all', label: 'All' }];
    
    const options = [];
    for (let i = 1; i <= totalMachines; i++) {
      options.push({ value: String(i), label: `Top ${i}` });
    }
    options.push({ value: 'all', label: 'All' });
    return options;
  }, [processedAnalyticsData.length]);

  const analyticsZoneLookup = useMemo(() => {
    const lookup = {};

    Object.entries(machineZoneMap || {}).forEach(([machineId, zoneId]) => {
      const normalized = normalizeZoneId(zoneId);
      if (machineId && normalized && !isExcludedZone(normalized)) {
        lookup[String(machineId)] = normalized;
      }
    });

    (facilityMachines || []).forEach(m => {
      const machineId = String(m?.machineId || '').trim();
      const normalized = normalizeZoneId(m?.zone);
      if (machineId && normalized && !isExcludedZone(normalized)) {
        lookup[machineId] = normalized;
      }
    });

    return lookup;
  }, [machineZoneMap, facilityMachines]);

  const analyticsRankRows = useMemo(() => {
    const selectedZonesSet = new Set((selectedAnalyticsZones || []).map(String));
    const q = String(analyticsSearchTerm || '').trim().toLowerCase();

    const rows = (avgUsageRows || [])
      .map((m) => {
        const machineId = String(m?.machineId || '').trim();
        const machineName = String(m?.machineName || machineId || 'Unknown').trim();
        const derivedZone = normalizeZoneId(deriveZoneFromMachineId(machineId));
        const zone = analyticsZoneLookup[machineId] || derivedZone || 'unknown';
        const avgUsageMinutes = Number.isFinite(Number(m?.avgMinutes)) ? Number(m.avgMinutes) : 0;
        return {
          machineId,
          machineName,
          zone,
          avgUsageMinutes,
        };
      })
      .filter(row => row.machineId && !isExcludedZone(row.zone));

    const filteredRows = rows.filter(row => {
      const inZoneFilter = selectedZonesSet.size === 0 || selectedZonesSet.has(String(row.zone));
      if (!inZoneFilter) return false;
      if (!q) return true;
      const name = row.machineName.toLowerCase();
      const id = row.machineId.toLowerCase();
      return name.includes(q) || id.includes(q);
    });

    filteredRows.sort((a, b) => {
      const diff = usageRankSort === 'least'
        ? a.avgUsageMinutes - b.avgUsageMinutes
        : b.avgUsageMinutes - a.avgUsageMinutes;
      if (Math.abs(diff) > 0.0001) return diff;
      return a.machineName.localeCompare(b.machineName);
    });

    return filteredRows.map((row, idx) => ({ ...row, rank: idx + 1 }));
  }, [avgUsageRows, analyticsZoneLookup, selectedAnalyticsZones, analyticsSearchTerm, usageRankSort]);

  const analyticsZoneOptions = useMemo(() => {
    const zoneSet = new Set();
    Object.values(analyticsZoneLookup || {}).forEach(zone => {
      const normalized = normalizeZoneId(zone);
      if (normalized && normalized !== 'unknown' && !isExcludedZone(normalized)) {
        zoneSet.add(String(normalized));
      }
    });

    return Array.from(zoneSet)
      .sort((a, b) => {
        if (/^\d+$/.test(a) && /^\d+$/.test(b)) return Number(a) - Number(b);
        return a.localeCompare(b);
      })
      .map(zone => ({ value: zone, label: /^\d+$/.test(zone) ? `Zone ${zone}` : zone }));
  }, [analyticsZoneLookup]);

  const analyticsRankTotalPages = useMemo(() => (
    Math.max(1, Math.ceil((analyticsRankRows.length || 0) / ANALYTICS_RANK_PAGE_SIZE))
  ), [analyticsRankRows.length, ANALYTICS_RANK_PAGE_SIZE]);

  const safeAnalyticsPage = useMemo(() => (
    Math.min(analyticsPage, analyticsRankTotalPages - 1)
  ), [analyticsPage, analyticsRankTotalPages]);

  const analyticsRankPageRows = useMemo(() => {
    const start = safeAnalyticsPage * ANALYTICS_RANK_PAGE_SIZE;
    return analyticsRankRows.slice(start, start + ANALYTICS_RANK_PAGE_SIZE);
  }, [safeAnalyticsPage, analyticsRankRows, ANALYTICS_RANK_PAGE_SIZE]);

  // Build analytics chart
  useEffect(() => {
    if (activeTab !== 'analytics') return;
    if (!analyticsChartRef.current || processedAnalyticsData.length === 0) return;
    
    const ctx = analyticsChartRef.current.getContext('2d');
    if (chartInstancesRef.current.analytics) {
      chartInstancesRef.current.analytics.destroy();
    }

    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    
    // Determine how many machines to show based on selectedTopN
    const isShowingAll = selectedTopN === 'all';
    const topN = isShowingAll ? processedAnalyticsData.length : parseInt(selectedTopN, 10);
    const machinesToShow = processedAnalyticsData.slice(0, topN);

    // Extended color palette to handle more machines
    const colors = [
      '#7C3AED', '#22C55E', '#3B82F6', '#EF4444', '#F59E0B', 
      '#20B2AA', '#DA70D6', '#6366F1', '#F97316', '#84CC16',
      '#EC4899', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'
    ];
    
    const datasets = machinesToShow
      .filter((m) => m && (m.machineName || m.machineId)) // Extra safety filter
      .map((m, idx) => {
        const byIndex = new Map((m.days || []).map((d) => [d.dayIndex, d.avgMinutes || 0]));
        const data = days.map((_, i) => byIndex.get(i + 1) ?? 0);
        const label = m.machineName || String(m.machineId);
        return {
          label,
          data,
          backgroundColor: colors[idx % colors.length],
          borderWidth: 0,
        };
      });

    const chartTitle = isShowingAll 
      ? `Average Usage per Day of Week (All ${processedAnalyticsData.length} Machines)`
      : `Average Usage per Day of Week (Top ${topN} Machines)`;

    chartInstancesRef.current.analytics = new Chart(ctx, {
      type: 'bar',
      data: { labels: days, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1' } },
          title: {
            display: true,
            text: chartTitle,
            color: '#e5e7eb',
            font: { size: 16, weight: '600' },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.dataset?.label || '';
                const val = ctx.raw ?? 0;
                return `${label}: ${val.toFixed(1)} min`;
              },
            }
          }
        },
        scales: {
          x: { stacked: true, ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } },
          y: {
            stacked: true,
            title: { display: true, text: 'Average Minutes', color: '#cbd5e1' },
            ticks: { color: '#cbd5e1' },
            grid: { color: 'rgba(255,255,255,0.08)' },
            beginAtZero: true,
          },
        },
      },
    });

    return () => { chartInstancesRef.current.analytics?.destroy(); };
  }, [activeTab, processedAnalyticsData, selectedTopN]);

  // Initialize data on mount and user load
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchMachineOptions();
      fetchAnalyticsData();
      fetchAlertsData(); // Fetch gym-specific alerts
    }
  }, [user]);

  // Build charts when dependencies change
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'dashboard') {
      buildCumulativeChart();
      fetchFacilityHeatmap(facilityRange);
    }
  }, [user, selectedCumRange, activeTab, facilityRange]);

  useEffect(() => {
    if (!user || activeTab !== 'dashboard') return;
    fetchUsageSearchRows();
  }, [user, activeTab, selectedSearchRange]);

  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    buildWeeklyChart();
  }, [activeTab, analyticsRankRows]);

  useEffect(() => {
    if (selectedMachine && activeTab === 'dashboard') {
      buildUsageChart();
    }
  }, [selectedRange, selectedMachine, activeTab]);

  // Rebuild usage chart when machine list updates or when we auto-select the first machine
  useEffect(() => {
    if (!user || activeTab !== 'dashboard') return;
    if (!selectedMachine && machineOptions.length > 0) {
      const source = filteredMachineOptions.length ? filteredMachineOptions : machineOptions;
      setSelectedMachine(source[0]?.machineId || '');
      return;
    }
    if (selectedMachine) {
      buildUsageChart();
    }
  }, [machineOptions, filteredMachineOptions, selectedMachine, activeTab, user]);

  useEffect(() => {
    if (!user || activeTab !== 'dashboard') return;
    if (selectedZone) {
      if (filteredMachineOptions.length === 0) {
        setSelectedMachine('');
        return;
      }
      const exists = filteredMachineOptions.some(m => String(m.machineId) === String(selectedMachine));
      if (!exists) {
        setSelectedMachine(filteredMachineOptions[0].machineId);
      }
    } else if (!selectedMachine && machineOptions.length > 0) {
      setSelectedMachine(machineOptions[0].machineId);
    }
  }, [selectedZone, filteredMachineOptions, machineOptions, selectedMachine, activeTab, user]);

  useEffect(() => {
    const normalizedZone = normalizeZoneId(selectedZone);
    if (!normalizedZone || isExcludedZone(normalizedZone)) return;
    setSelectedAnalyticsZones(prev => (
      prev.length === 1 && String(prev[0]) === String(normalizedZone)
        ? prev
        : [String(normalizedZone)]
    ));
  }, [selectedZone]);

  useEffect(() => {
    setAnalyticsPage(0);
  }, [analyticsSearchTerm, usageRankSort, selectedAnalyticsZones, selectedSearchRange]);

  useEffect(() => {
    if (analyticsPage > safeAnalyticsPage) {
      setAnalyticsPage(safeAnalyticsPage);
    }
  }, [analyticsPage, safeAnalyticsPage]);

  useEffect(() => {
    const handler = (e) => {
      if (!analyticsZoneFilterRef.current) return;
      if (!analyticsZoneFilterRef.current.contains(e.target)) {
        setAnalyticsZoneFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleAnalyticsZoneSelection = (zoneId) => {
    setSelectedAnalyticsZones(prev => (
      prev.includes(zoneId)
        ? prev.filter(z => z !== zoneId)
        : [...prev, zoneId]
    ));
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ensure scroll to top when tab changes
  useEffect(() => {
    // Scroll to top whenever activeTab changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also ensure scroll after a brief delay to handle any layout shifts
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  // Alert management functions
  const snapshotAlerts = () => alerts.map(a => ({ ...a }));
  const resolveAlert = (alert) => {
    setAlertToResolve(alert);
    setResolveModalOpen(true);
  };

const handleResolveYes = async () => {
  const alert = alertToResolve;
  if (!alert) return;

  const gymId = localStorage.getItem('gymId');
  const userEmail = localStorage.getItem('userEmail') || 'unknown';
  if (!gymId) {
    setAlertsError('No gym selected');
    setResolveModalOpen(false);
    setAlertToResolve(null);
    return;
  }

  try {
    setAlertsLoading(true);
    setAlertsError('');

    // If this alert came from backend (has ticketId), close it on the backend first
    if (backendURL && alert.ticketId) {
      try {
        console.log('Closing backend ticket/alert:', alert.ticketId);
        const closeRes = await fetch(`${backendURL}/api/maintenance/tickets/${alert.ticketId}/close`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            gymId,
            checklistUpdates: [],
            resolvedBy: userEmail,
            notes: 'Converted to ticket from dashboard alert'
          })
        });
        
        if (!closeRes.ok) {
          console.warn('Failed to close alert on backend:', closeRes.status);
        } else {
          console.log('Alert closed on backend successfully');
        }
      } catch (e) {
        console.warn('Error closing alert on backend:', e);
        // Continue anyway - we'll still remove it locally
      }
    }

    // Remove the alert from local state
    setUndoStack(prev => [...prev, snapshotAlerts()]);
    setRedoStack([]);
    const newAlerts = alerts.filter(a => a.id !== alert.id);
    setAlerts(newAlerts);
    
    // Persist alert removal to localStorage
    try {
      localStorage.setItem(`alerts_${gymId}`, JSON.stringify(newAlerts));
      console.log('Alert removed from localStorage, remaining alerts:', newAlerts.length);
    } catch (e) {
      console.warn('Failed to persist alerts to localStorage', e);
    }

    // Create ticket purely on frontend (localStorage) — no backend calls
    const ticketsKey = `tickets_${gymId}`;
    let tickets = [];
    try {
      const raw = localStorage.getItem(ticketsKey);
      tickets = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(tickets)) tickets = [];
    } catch (e) {
      tickets = [];
    }

    const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    // Use machineId as the primary name, fallback to title
    const machineName = alert.machineId || alert.machineName || 'Unknown Machine';
    const ticketTitle = `${machineName}`;

    const newTicket = {
      _id: localId,
      title: ticketTitle,
      description: alert.description || alert.title || 'Alert generated ticket',
      equipment: machineName,
      machineName: machineName,
      category: 'Alert',
      status: 'open',
      priority: 'medium',
      createdBy: userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'alert'
    };

    tickets.push(newTicket);
    localStorage.setItem(ticketsKey, JSON.stringify(tickets));
    
    console.log('Ticket created:', newTicket);
    console.log('Alert removed, new alerts count:', newAlerts.length);

    // close modal UI and clear selection pointer AFTER alert removal
    setResolveModalOpen(false);
    setAlertToResolve(null);

    // Switch to tickets tab
    setActiveTab('tickets');
  } catch (e) {
    console.error('Error creating ticket locally for alert', e);
    setAlertsError(e?.message || 'Failed to create ticket');
    setResolveModalOpen(false);
    setAlertToResolve(null);
  } finally {
    setAlertsLoading(false);
  }
};

const handleResolveNo = () => {
  if (alertToResolve) {
    setUndoStack(prev => [...prev, snapshotAlerts()]);
    setRedoStack([]);

    const newAlerts = alerts.map(a =>
      a.id === alertToResolve.id ? { ...a, resolved: true } : a
    );
    setAlerts(newAlerts);

    const gymId = localStorage.getItem('gymId');
    if (gymId) {
      localStorage.setItem(`alerts_${gymId}`, JSON.stringify(newAlerts));
    }
  }

  setResolveModalOpen(false);
  setAlertToResolve(null);
};

  
  const undoResolve = () => {
    if (undoStack.length === 0) return;
    const prevState = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setRedoStack(s => [...s, snapshotAlerts()]);
    setAlerts(prevState);
    
    // Update localStorage
    const gymId = localStorage.getItem('gymId');
    if (gymId) {
      localStorage.setItem(`alerts_${gymId}`, JSON.stringify(prevState));
    }
  };
  const redoResolve = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(s => s.slice(0, -1));
    setUndoStack(s => [...s, snapshotAlerts()]);
    setAlerts(nextState);
    
    // Update localStorage
    const gymId = localStorage.getItem('gymId');
    if (gymId) {
      localStorage.setItem(`alerts_${gymId}`, JSON.stringify(nextState));
    }
  };
  const openMaint = (alert) => {
    setActiveAlert(alert);
    setMaintOpen(true);
    setFormStep(0);
    setMaintChecked(undefined);
    setMaintBroken(undefined);
    setMaintIssues(new Set());
    setMaintNotes('');
    setMaintContact('');
  };
  const toggleIssue = (key) => setMaintIssues(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const statusLabel = (s) => s === 'active' ? 'In Use' : s === 'inactive' ? 'Available' : s === 'maintenance' ? 'Maintenance' : 'Unknown';
  const statusClass = (s) => s === 'active' ? 'status--active' : s === 'inactive' ? 'status--inactive' : s === 'maintenance' ? 'status--maintenance' : 'status--unknown';

  const fetchAlerts = async () => {
    if (!backendURL) return;
    setAlertsLoading(true);
    setAlertsError('');
    try {
      const gymId = localStorage.getItem('gymId');
      if (!gymId) return;
      const res = await fetch(`${backendURL}/api/maintenance/gyms/${gymId}/tickets`);
      if (!res.ok) throw new Error(`Alerts HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const lowUsage = list.filter(t =>
        t.status === 'open' && (t.category === 'Low Usage' || t.createdBy === 'low_usage_monitor')
      );
      setAlerts(lowUsage.map(t => ({
        id: `ticket_${t._id}`,
        ticketId: t._id,
        title: t.machineName || 'Low usage detected',
        machineId: t.machineName || t.equipment || 'Unknown',
        description: t.description || 'Low usage alert',
        resolved: false
      })));
    } catch (err) {
      console.error('Failed to fetch alerts', err);
      setAlertsError(err.message);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Fetch alerts data from localStorage (gym-specific)
  const fetchAlertsData = async () => {
    try {
      const gymId = localStorage.getItem('gymId');
      const userEmail = localStorage.getItem('userEmail');
      if (!gymId || !userEmail) return;

      // Read persisted per-gym alerts or seed sample alerts
      const storedAlerts = localStorage.getItem(`alerts_${gymId}`);
      if (storedAlerts) {
        try {
          const parsedAlerts = JSON.parse(storedAlerts);
          if (Array.isArray(parsedAlerts)) {
            setAlerts(parsedAlerts);
            return;
          }
        } catch (e) {
          console.warn('Failed to parse stored alerts for gym, will seed sample data');
        }
      }

      // Seed sample alerts for this gym if none exist
      const alertId1 = `${gymId}_alert1`;
      const alertId2 = `${gymId}_alert2`;
      const gymSpecificAlerts = [
        {
          id: alertId1,
          title: 'Sensor Malfunction',
          machineId: `Treadmill-${gymId.slice(-2)}`,
          description: 'Usage sensor not responding',
          resolved: false,
          timestamp: new Date().toISOString(),
          gymId: gymId
        },
        {
          id: alertId2,
          title: 'Maintenance Required',
          machineId: `Elliptical-${gymId.slice(-2)}`,
          description: 'Unusual vibration detected',
          resolved: false,
          timestamp: new Date().toISOString(),
          gymId: gymId
        }
      ];

      setAlerts(gymSpecificAlerts);
      localStorage.setItem(`alerts_${gymId}`, JSON.stringify(gymSpecificAlerts));

    } catch (error) {
      console.error('Error fetching alerts data:', error);
      setAlerts([]);
    }
  };

  useEffect(() => {
    if (!backendURL || activeTab !== 'dashboard') return;
    fetchAlerts();
    const id = setInterval(fetchAlerts, 60000);
    return () => clearInterval(id);
  }, [activeTab]);

  // Space allocation suggestions
  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem('dashboard:state');
  //     const parsed = raw ? JSON.parse(raw) : {};
  //     const seeded = (parsed.suggestions && Array.isArray(parsed.suggestions)) ? parsed.suggestions : [
  //       { id: 'sg1', text: 'Move one treadmill from Cardio NE to Cardio SW (even out peak load)', status: 'new' },
  //       { id: 'sg2', text: 'Shift two squat racks usage by scheduling time blocks', status: 'new' },
  //       { id: 'sg3', text: 'Relocate stretch mats nearer to free weights during 6-8PM', status: 'new' },
  //     ];
  //     setSuggestions(seeded);
  //     localStorage.setItem('dashboard:state', JSON.stringify({ ...(parsed||{}), suggestions: seeded }));
  //   } catch {}
  // }, []);

  function persistSuggestions(next) {
    try {
      const raw = localStorage.getItem('dashboard:state');
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem('dashboard:state', JSON.stringify({ ...(parsed||{}), suggestions: next, updatedAt: new Date().toISOString() }));
    } catch {}
  }

  function acceptSuggestion(id) {
    const next = suggestions.map(s => s.id === id ? { ...s, status: 'accepted' } : s);
    setSuggestions(next);
    persistSuggestions(next);
  }
  function dismissSuggestion(id) {
    const next = suggestions.map(s => s.id === id ? { ...s, status: 'dismissed' } : s);
    setSuggestions(next);
    persistSuggestions(next);
  }

  const renderMachineUsageSearchAndAverage = () => (
    <>
      <div className="nx-card" style={{marginTop:8, height:`${DASHBOARD_CONTENT_HEIGHT * 0.335}px`}}>
        <div className="nx-card-header">
          <div>
            <div className="nx-card-title">Machine Usage Search</div>
            <div className="nx-subtle">Full machine ranking by daily average usage with zone filters</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', justifyContent:'flex-end'}}>
            <input
              value={analyticsSearchTerm}
              onChange={(e) => setAnalyticsSearchTerm(e.target.value)}
              placeholder="Search machine name or ID"
              style={{
                height: 32,
                minWidth: 220,
                padding: '0 10px',
                borderRadius: 8,
                border: '1px solid #262633',
                background: '#13131a',
                color: '#e5e7eb',
                fontSize: 12,
                outline: 'none'
              }}
            />
            <NxDropdown
              value={usageRankSort}
              onChange={setUsageRankSort}
              options={[
                { value: 'most', label: 'Most Used' },
                { value: 'least', label: 'Least Used' },
              ]}
              minWidth={110}
            />
            <NxDropdown
              value={selectedSearchRange}
              onChange={setSelectedSearchRange}
              options={SEARCH_RANGE_OPTIONS}
              minWidth={140}
            />
            <div ref={analyticsZoneFilterRef} style={{ position:'relative' }}>
              <button
                className="nx-btn"
                onClick={() => setAnalyticsZoneFilterOpen(v => !v)}
                style={{ minWidth: 145, height: 32, padding: '0 10px' }}
              >
                {selectedAnalyticsZones.length
                  ? `Zones: ${selectedAnalyticsZones.join(', ')}`
                  : 'All Zones'}
              </button>
              {analyticsZoneFilterOpen && (
                <div className="nx-dd-menu" style={{ right: 0, left: 'auto', minWidth: 220 }}>
                  <div
                    className="nx-dd-item"
                    onClick={() => setSelectedAnalyticsZones([])}
                    style={{ fontWeight: selectedAnalyticsZones.length === 0 ? 700 : 500 }}
                  >
                    All Zones
                  </div>
                  {analyticsZoneOptions.length === 0 ? (
                    <div className="nx-subtle" style={{ padding:'8px 10px' }}>No zone data</div>
                  ) : (
                    analyticsZoneOptions.map(opt => (
                      <label
                        key={opt.value}
                        style={{
                          display:'flex',
                          alignItems:'center',
                          gap:8,
                          padding:'8px 10px',
                          borderRadius:8,
                          cursor:'pointer',
                          color:'#e5e7eb',
                          fontSize:13
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAnalyticsZones.includes(opt.value)}
                          onChange={() => toggleAnalyticsZoneSelection(opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', height:'calc(100% - 60px)'}}>
          <div style={{overflow:'auto', flex:1}}>
            <div className="nx-thead" style={{gridTemplateColumns:'70px 1fr 120px 120px', padding:'12px 0'}}>
              <div>Rank</div>
              <div>Machine</div>
              <div>Zone</div>
              <div>Avg Usage</div>
            </div>
            {analyticsLoading ? (
              <div className="nx-subtle" style={{padding:'20px', textAlign:'center'}}>Loading machine ranking...</div>
            ) : analyticsRankRows.length === 0 ? (
              <div className="nx-subtle" style={{padding:'20px', textAlign:'center'}}>No machines match the current search/filter.</div>
            ) : (
              analyticsRankPageRows.map(row => (
                <div
                  key={`rank_${row.machineId}`}
                  className="nx-trow"
                  style={{gridTemplateColumns:'70px 1fr 120px 120px', padding:'12px 0'}}
                >
                  <div style={{fontWeight:700, color:'#cbd5e1'}}>#{row.rank}</div>
                  <div>
                    <div style={{color:'#e5e7eb', fontWeight:600}}>{row.machineName || row.machineId}</div>
                  </div>
                  <div className="nx-subtle">
                    {row.zone === 'unknown'
                      ? 'Unknown'
                      : (/^\d+$/.test(String(row.zone)) ? `Zone ${row.zone}` : row.zone)}
                  </div>
                  <div style={{fontWeight:600, color:'#e5e7eb'}}>{Math.round(row.avgUsageMinutes)} min</div>
                </div>
              ))
            )}
          </div>
          <div style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'space-between',
            gap:10,
            paddingTop:10,
            borderTop:'1px solid #1f2430'
          }}>
            <div className="nx-subtle">
              {analyticsRankRows.length === 0
                ? '0 results'
                : `Showing ${safeAnalyticsPage * ANALYTICS_RANK_PAGE_SIZE + 1}-${Math.min((safeAnalyticsPage + 1) * ANALYTICS_RANK_PAGE_SIZE, analyticsRankRows.length)} of ${analyticsRankRows.length}`}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <button
                className="nx-btn"
                onClick={() => setAnalyticsPage(p => Math.max(0, p - 1))}
                disabled={safeAnalyticsPage <= 0}
                style={{height:30, minWidth:36, padding:'0 8px'}}
                title="Previous page"
              >
                ◀
              </button>
              <div className="nx-subtle">{analyticsRankRows.length ? `Page ${safeAnalyticsPage + 1} / ${analyticsRankTotalPages}` : 'Page 0 / 0'}</div>
              <button
                className="nx-btn"
                onClick={() => setAnalyticsPage(p => Math.min(analyticsRankTotalPages - 1, p + 1))}
                disabled={safeAnalyticsPage >= analyticsRankTotalPages - 1 || analyticsRankRows.length === 0}
                style={{height:30, minWidth:36, padding:'0 8px'}}
                title="Next page"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="nx-card" style={{marginTop:8}}>
        <div className="nx-card-header">
          <div>
            <div className="nx-card-title">Average Machine Usage</div>
            <div className="nx-subtle">Matches current Machine Usage Search filters</div>
          </div>
          <NxDropdown
            value={selectedSearchRange}
            onChange={setSelectedSearchRange}
            options={SEARCH_RANGE_OPTIONS}
            minWidth={140}
          />
        </div>
        <div className="nx-chart" style={{position:'relative'}}>
          <canvas ref={avgUsageChartRef}></canvas>
          {analyticsLoading && (
            <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', background:'rgba(0,0,0,0.2)'}}>
              Loading usage data...
            </div>
          )}
          {!analyticsLoading && analyticsRankRows.length === 0 && (
            <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af'}}>
              No machines match the current search/filter.
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderEquipmentAndSuggestions = () => (
    <>
      <div className="nx-grid" style={{marginTop:'8px'}}>
        <div className="nx-card" style={{gridColumn:'span 12'}}>
          <div className="nx-card-header">
            <div className="nx-card-title">Equipment Status</div>
          </div>
          <div className="nx-table-wrap" style={{maxHeight:'280px', overflowY:'auto'}}>
            <div className="nx-thead">
              <div>Equipment</div>
              <div>Status</div>
              <div>Last Seen</div>
            </div>
            {equipmentRows.length === 0 ? (
              <div className="nx-subtle" style={{padding:'20px', textAlign:'center'}}>No equipment data</div>
            ) : (
              equipmentRows.map((row) => (
                <div className="nx-trow" key={row.name}>
                  <div>{row.name}</div>
                  <div>
                    <span className={`nx-badge ${row.status === 'active' ? 'active' : row.status === 'inactive' ? 'inactive' : 'maintenance'}`}>
                      {statusLabel(row.status)}
                    </span>
                  </div>
                  <div className="nx-subtle">{row.lastSeen}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="nx-grid" style={{marginTop:'8px'}}>
        <div className="nx-card" style={{gridColumn:'span 12', height:'245px', display:'flex', flexDirection:'column'}}>
          <div className="nx-card-header">
            <div>
              <div className="nx-card-title">Space Allocation Suggestions</div>
              <div className="nx-subtle">Based on recent usage/occupancy patterns</div>
            </div>
          </div>
          <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', overflowY:'auto'}}>
            {/* Suggestions display commented out - keeping 245px height for layout */}
            {/* {(suggestions || []).filter(s => s.status !== 'dismissed').length === 0 ? (
              <div className="nx-subtle" style={{padding:'20px', textAlign:'center'}}>No suggestions at this time</div>
            ) : (
              <div style={{width:'100%'}}>
                {(suggestions || []).filter(s => s.status !== 'dismissed').map(s => (
                  <div key={s.id} className="nx-alert-row" style={{gridTemplateColumns:'1fr auto'}}>
                    <div style={{color:'#e5e7eb'}}>{s.text}</div>
                    <div style={{display:'flex', gap:8}}>
                      {s.status !== 'accepted' && <button className="nx-pill primary" onClick={()=>acceptSuggestion(s.id)} aria-label="Accept suggestion">Accept</button>}
                      <button className="nx-pill" onClick={()=>dismissSuggestion(s.id)} aria-label="Dismiss suggestion">Dismiss</button>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </>
  );

  const back = async() => {
    try {
      navigate('/login');
    } catch (error) {
      console.error('Error navigating back to login:', error);
    }
  }

  if (!user) return null;

  return (
    <div className="nx-dashboard">
      <style>{`
        .nx-dashboard { background:transparent; padding:24px 24px 24px 12px; color:#e5e7eb; --dashboard-content-height: ${SIDEBAR_HEIGHT}px; position: relative; z-index: 1; }
        .nx-container { max-width:1400px; margin:0 auto; }
        .nx-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:20px; }
        .nx-title-row { display:flex; align-items:center; gap:10px; }
        .nx-title { font-size:20px; font-weight:700; color:#ffffff; }
        .nx-sep-dot { width:6px; height:6px; background:#ef4444; border-radius:9999px; display:inline-block; }
        .nx-alerts { font-size:16px; color:#ef4444; }
        .nx-actions { display:flex; gap:8px; align-items:center; }
        .nx-btn { appearance:none; border:1px solid #262633; background:#13131a; color:#e5e7eb; padding:8px 12px; border-radius:8px; font-size:13px; cursor:pointer; }
        .nx-btn.primary { background:#000000; color:#ffffff; border-color:#000000; }
        .nx-content { display:flex; gap:16px; align-items:stretch; }
        .nx-rail { width:200px; background:#111119; border:1px solid #1d1d29; border-radius:14px; padding:12px; display:flex; flex-direction:column; min-height: 100%; height:1080px; align-self:stretch; }
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
        .nx-chart { height:260px; }
        .nx-select { padding:6px 10px; border-radius:8px; border:1px solid #262633; background:#13131a; color:#e5e7eb; font-size:12px; }
        .nx-mobile-tabs { display:none; }
        .nx-analytics-card { height:calc(100vh - 200px); min-height:830px; }
        .nx-chat-card { height:calc(100vh - 200px); min-height:830px; }
        .nx-dashboard-content { min-height: var(--dashboard-content-height, 830px); display: flex; flex-direction: column; }
        .nx-dashboard-content .nx-card.chatbot-card > div > div > * { width: 100% !important; max-width: 100% !important; }
        .schedule-date-link { background: rgba(124, 58, 237, 0.15); color: #c4b5fd; border: 1px solid rgba(124, 58, 237, 0.35); border-radius: 12px; padding: 4px 8px; font-size: 12px; font-weight: 500; display: inline-block; text-decoration: none; cursor: pointer; transition: all 0.2s ease; text-align: center; min-width: 60px; }
        .schedule-date-link:hover { background: rgba(124, 58, 237, 0.25); border-color: rgba(124, 58, 237, 0.5); transform: translateY(-1px); }
        .nx-analytics-grid { display:grid; grid-template-columns:8fr 2fr; gap:16px; }
        .nx-dd { position:relative; }
        .nx-dd-button { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; }
        .nx-caret { opacity:0.8; }
        .nx-dd-menu { position:absolute; top:calc(100% + 8px); right:0; background:#111119; border:1px solid #1d1d29; border-radius:12px; box-shadow:0 10px 24px rgba(0,0,0,0.45); padding:6px; z-index:40; min-width:100%; max-height:260px; overflow-y:auto; }
        .nx-dd-item { padding:8px 10px; border-radius:8px; cursor:pointer; color:#e5e7eb; font-size:13px; }
        .nx-dd-item[aria-selected="true"], .nx-dd-item:hover { background:rgba(124,58,237,0.18); color:#c4b5fd; }
        .nx-table { width:100%; border-collapse:separate; border-spacing:0; }
        .nx-thead { display:grid; grid-template-columns:1fr 120px 120px; gap:12px; padding:12px 16px; color:#a3a3b2; font-size:12px; }
        .nx-trow { display:grid; grid-template-columns:1fr 120px 120px; gap:12px; padding:14px 16px; border-top:1px solid #1f2430; align-items:center; }
        .nx-badge { padding:4px 8px; border-radius:999px; font-size:12px; font-weight:600; text-align:center; display:inline-block; min-width:50px; }
        .nx-badge.active { background:rgba(124,58,237,0.18); color:#c4b5fd; border:1px solid rgba(124,58,237,0.35); }
        .nx-badge.inactive { background:#171923; color:#94a3b8; border:1px solid #1f2430; }
        .nx-badge.maintenance { background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.4); }
        .nx-pill { font-size:12px; border:1px solid #262633; border-radius:999px; color:#cbd5e1; background:#13131a; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; height:32px; padding:0 12px; text-align:center; }
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
        @media (max-width: 768px) {
          .nx-dashboard { padding:16px; }
          .nx-container { max-width:100%; }
          .nx-content { flex-direction:column; }
          .nx-rail { display:none; }
          .nx-mobile-tabs { display:flex; gap:8px; margin-bottom:12px; }
          .nx-grid { grid-template-columns:1fr; }
          .nx-analytics-grid { grid-template-columns:1fr; }
          .nx-analytics-card { height:calc(100vh - 200px); min-height:560px; }
          .nx-chat-card { height:calc(100vh - 200px); min-height:560px; }
          .nx-chart { height:220px; }
        }
      `}</style>

      <div className="nx-container" style={{flex:1}}>
        <div className="nx-header">
          <div className="nx-title-row">
            <div className="nx-title">{displayName || 'Dashboard'}</div>
            <button onClick={back} className="back-button">
              Return To Home
            </button>
          </div>
          <div className="nx-actions">
            <button className="nx-btn">Export</button>
            <NxDropdown
              value={selectedRange}
              onChange={(v) => setSelectedRange(parseInt(v))}
              options={[
                { value: 6, label: 'Past 6 Hours' },
                { value: 8, label: 'Past 8 Hours' },
                { value: 12, label: 'Past 12 Hours' },
                { value: 24, label: 'Past 24 Hours' },
                { value: 168, label: 'Past Week' },
                { value: 720, label: 'Past Month' },
                { value: 1000, label: 'All Time' }
              ]}
              minWidth={150}
            />
          </div>
        </div>

        <div className="nx-content" style={{minHeight: 'calc(100vh - 200px)'}}>
          <div className="nx-rail">
            <button className={`nx-rail-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')}>Dashboard</button>
            <button className={`nx-rail-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleTabChange('analytics')}>Analytics</button>
            <button className={`nx-rail-item ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => handleTabChange('tickets')}>Tickets</button>
            <button className={`nx-rail-item ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => handleTabChange('maintenance')}>Maintenance</button>
            <button className={`nx-rail-item ${activeTab === 'chatbot' ? 'active' : ''}`} onClick={() => handleTabChange('chatbot')}>Chatbot</button>
          </div>

          <div className="nx-main">
            <div className="nx-mobile-tabs">
              <button className={`nx-pill ${activeTab==='dashboard' ? 'primary' : ''}`} onClick={()=>handleTabChange('dashboard')}>Dashboard</button>
              <button className={`nx-pill ${activeTab==='analytics' ? 'primary' : ''}`} onClick={()=>handleTabChange('analytics')}>Analytics</button>
              <button className={`nx-pill ${activeTab==='tickets' ? 'primary' : ''}`} onClick={()=>handleTabChange('tickets')}>Tickets</button>
              <button className={`nx-pill ${activeTab==='maintenance' ? 'primary' : ''}`} onClick={()=>handleTabChange('maintenance')}>Maintenance</button>
              <button className={`nx-pill ${activeTab==='chatbot' ? 'primary' : ''}`} onClick={()=>handleTabChange('chatbot')}>Chatbot</button>
            </div>
            
            {activeTab === 'chatbot' ? (
              <div className="nx-dashboard-content">
                <div className="nx-card chatbot-card" style={{padding:0, overflow:'hidden', display:'flex', flexDirection:'column', height:`${DASHBOARD_CONTENT_HEIGHT}px`}}>
                  <div style={{flex:1, display:'flex', flexDirection:'column', height:'100%', width:'100%'}}>
                    <div style={{width:'100%', height:'100%'}}>
                      <ChatBot embedded={true} />
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'analytics' ? (
              <div className="nx-dashboard-content">
                <div className="nx-analytics-grid" style={{marginBottom:'8px'}}>
                  <div className="nx-card" style={{height:`${DASHBOARD_CONTENT_HEIGHT * 0.65}px`}}>
                    <div className="nx-card-header">
                      <div>
                        <div className="nx-card-title">Average Usage per Day of Week</div>
                        <div className="nx-subtle">
                          {selectedTopN === 'all' 
                            ? `Showing all ${processedAnalyticsData.length} machines in this gym`
                            : `Showing top ${selectedTopN} machines by usage`
                          }
                        </div>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span className="nx-subtle" style={{fontSize:'14px'}}>Show:</span>
                        <NxDropdown
                          options={topNOptions}
                          value={selectedTopN}
                          onChange={setSelectedTopN}
                          minWidth={90}
                        />
                      </div>
                    </div>
                    <div style={{height:'calc(100% - 60px)'}}>
                      {analyticsLoading ? (
                        <div style={{color:'#e5e7eb', padding:'20px'}}>Loading analytics...</div>
                      ) : analyticsData.length === 0 ? (
                        <div style={{color:'#e5e7eb', padding:'20px'}}>No analytics data available.</div>
                      ) : (
                        <canvas ref={analyticsChartRef}></canvas>
                      )}
                    </div>
                  </div>
                  <div className="nx-card" style={{height:`${DASHBOARD_CONTENT_HEIGHT * 0.65}px`}}>
                    <div className="nx-card-header">
                      <div className="nx-card-title">Analytics Summary</div>
                    </div>
                    <div style={{padding:'16px'}}>
                      <div style={{marginBottom:'12px'}}>
                        <div className="nx-subtle">Total Machines</div>
                        <div style={{fontSize:'24px', fontWeight:'700', color:'#ffffff'}}>{machineOptions.length}</div>
                      </div>
                      <div style={{marginBottom:'12px'}}>
                        <div className="nx-subtle">Connected Machines</div>
                        <div style={{fontSize:'24px', fontWeight:'700', color:'#22c55e'}}>{stats.currentOccupancy}</div>
                      </div>
                      <div style={{marginBottom:'12px'}}>
                        <div className="nx-subtle">Connected Sensors</div>
                        <div style={{fontSize:'24px', fontWeight:'700', color:'#ffffff'}}>{stats.numDevices}</div>
                      </div>
                    </div>
                </div>
              </div>

                {renderEquipmentAndSuggestions()}
              </div>
            ) : activeTab === 'tickets' ? (
              <div className="nx-dashboard-content">
                <div className="nx-grid" style={{marginBottom:'8px'}}>
                  <div className="nx-card" style={{gridColumn:'span 12', height:`${DASHBOARD_CONTENT_HEIGHT}px`}}>
                    <TicketsTab />
                  </div>
                </div>
              </div>
            ) : activeTab === 'maintenance' ? (
              <div className="nx-dashboard-content">
                <div className="nx-grid" style={{marginBottom:'8px'}}>
                  <div className="nx-card" style={{gridColumn:'span 12', height:`${DASHBOARD_CONTENT_HEIGHT}px`}}>
                    <MaintenanceTab />
                  </div>
                </div>
              </div>
            ) : (
              <div className="nx-dashboard-content">
                {/* Top metrics */}
                <div className="nx-grid" style={{marginBottom:'0px'}}>
                  <div className="nx-card" style={{gridColumn:'span 3'}}>
                    <div className="nx-card-header"><span className="nx-card-title">Daily Favorite</span></div>
                    <div className="nx-metric">{stats.dailyFav?.machineName || '--'}</div>
                    <div className="nx-subtle">Today's most used machine</div>
                  </div>
                  <div className="nx-card" style={{gridColumn:'span 3'}}>
                    <div className="nx-card-header"><span className="nx-card-title">Peak Hours</span></div>
                    <div className="nx-metric">{stats.peakHours}</div>
                    <div className="nx-subtle">Most active time today</div>
                  </div>
                  <div className="nx-card" style={{gridColumn:'span 3'}}>
                    <div className="nx-card-header"><span className="nx-card-title">Connected Machines</span></div>
                    <div className="nx-metric">{stats.currentOccupancy}</div>
                    <div className="nx-subtle">Machines being tracked</div>
                  </div>
                  <div className="nx-card" style={{gridColumn:'span 3'}}>
                    <div className="nx-card-header"><span className="nx-card-title">Connected Sensors</span></div>
                    <div className="nx-metric">{stats.numDevices}</div>
                    <div className="nx-subtle">Sensors online</div>
                  </div>
                </div>

                {/* Facility map */}
                <div className="nx-card" style={{marginTop:'8px'}}>
                  <div className="nx-card-header">
                    <div>
                      <div className="nx-card-title">Facility Usage Map</div>
                      <div className="nx-subtle">Color intensity shows recent usage by zone</div>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <NxDropdown
                        value={facilityRange}
                        onChange={(v) => setFacilityRange(parseInt(v))}
                        options={[
                          { value: 1, label: 'Past 1 Hour' },
                          { value: 3, label: 'Past 3 Hours' },
                          { value: 6, label: 'Past 6 Hours' },
                          { value: 12, label: 'Past 12 Hours' },
                          { value: 24, label: 'Past 24 Hours' },
                          { value: 1000, label: 'All Time' },
                        ]}
                        minWidth={150}
                      />
                      {floorOptions.length > 0 && (
                        <NxDropdown
                          value={activeFloorId || floorOptions[0]?.value}
                          onChange={(v) => setSelectedFloorId(String(v))}
                          options={floorOptions}
                          minWidth={130}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{ position:'relative', paddingBottom:'55%', background:'#0f172a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, overflow:'hidden' }}>
                    {activeFloorplanUrl ? (
                      <object
                        ref={svgObjectRef}
                        type="image/svg+xml"
                        data={activeFloorplanUrl}
                        style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
                        aria-label="Facility floor plan"
                      />
                    ) : (
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af' }}>
                        No floorplan configured for this gym.
                      </div>
                    )}
                    <div style={{ position:'absolute', top:12, right:12, background:'rgba(15,23,42,0.85)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 12px', color:'#e5e7eb', minWidth:150 }}>
                      <div style={{ fontSize:12, color:'#cbd5e1', marginBottom:6 }}>Usage legend</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:12, color:'#cbd5e1' }}>Low</span>
                        <div style={{
                          flex:1,
                          height:10,
                          borderRadius:999,
                          background:'linear-gradient(90deg, rgba(34,197,94,0.82) 0%, rgba(250,204,21,0.82) 35%, rgba(249,115,22,0.82) 70%, rgba(239,68,68,0.82) 100%)',
                          boxShadow:'0 0 0 1px rgba(255,255,255,0.06) inset'
                        }} />
                        <span style={{ fontSize:12, color:'#cbd5e1' }}>High</span>
                      </div>
                    </div>
                    {facilityLoading && (
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#e5e7eb', background:'rgba(0,0,0,0.35)' }}>
                        Loading facility map...
                      </div>
                    )}
                    {shouldShowNoFacilityData && (
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', pointerEvents:'none' }}>
                        No facility data returned for this range.
                      </div>
                    )}
                  </div>
                </div>

                {/* Main charts row */}
                <div className="nx-grid" style={{marginTop:'8px'}}>
                  <div className="nx-card" style={{gridColumn:'span 8'}}>
                    <div className="nx-card-header">
                      <div>
                        <div className="nx-card-title">Hourly Machine Usage</div>
                        <div className="nx-subtle">{(() => {
                          const found = machineOptions.find(m => String(m.machineId) === String(selectedMachine));
                          return selectedMachine ? (found ? found.machineName : 'Unknown') : 'N/A';
                        })()}</div>
                      </div>
                      <div style={{display:'flex', gap:8}}>
                        <NxDropdown
                          value={selectedMachine}
                          onChange={(v) => setSelectedMachine(v)}
                          options={(filteredMachineOptions.length ? filteredMachineOptions : machineOptions).map(m => ({ value: m.machineId, label: m.machineName || m.machineId }))}
                          minWidth={170}
                        />
                      </div>
                    </div>
                    <div className="nx-chart"><canvas ref={hourlyUsageChartRef}></canvas></div>
                  </div>
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
                      {alertsLoading ? (
                        <div className="nx-subtle" style={{padding:'20px', textAlign:'center'}}>Loading alerts…</div>
                      ) : alertsError ? (
                        <div className="nx-subtle" style={{padding:'20px', textAlign:'center'}}>{alertsError}</div>
                      ) : alerts.filter(a=>!a.resolved).length === 0 ? (
                        <div className="nx-subtle" style={{padding:'20px', textAlign:'center'}}>No active alerts</div>
                      ) : (
                        alerts.filter(a=>!a.resolved).map(a => (
                          <div key={a.id} className="nx-alert-row">
                            <div>
                              <div className="nx-title" style={{fontSize:14, color:'#e5e7eb'}}>{a.title}</div>
                              <div className="nx-subtle">{a.machineId} • {a.description}</div>
                            </div>
                            <div style={{display:'flex', gap:8}}>
                              <button className="nx-pill primary" onClick={()=>resolveAlert(a)}>Resolve</button>
                              <button className="nx-pill" onClick={()=>openMaint(a)}>Details</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {renderMachineUsageSearchAndAverage()}
              </div>
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
                  <div className="nx-modal-q">What's broken?</div>
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
                  <div className="nx-modal-q">Great. We'll keep monitoring.</div>
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

        {/* Resolve Alert Modal */}
        {resolveModalOpen && (
          <div className="nx-modal-overlay" role="dialog" aria-modal="true">
            <div className="nx-modal">
              <div className="nx-modal-title">Resolve Alert — {alertToResolve?.machineId}</div>
              <div>
                <div className="nx-modal-q">Are you sure?</div>
                <div className="nx-subtle" style={{marginBottom: '16px'}}>
                  {alertToResolve?.title} • {alertToResolve?.description}
                </div>
                <div className="nx-modal-row">
                  <button className="nx-modal-btn" onClick={handleResolveYes}>Yes, create ticket</button>
                  <button className="nx-modal-btn" onClick={handleResolveNo}>No, dismiss alert</button>
                </div>
                <div className="nx-modal-actions">
                  <button className="nx-modal-btn" onClick={() => setResolveModalOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default TempDashboard;
