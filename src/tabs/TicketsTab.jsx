import React, { useEffect, useMemo, useRef, useState } from 'react';
import MaintenanceCalendar from '../components/MaintenanceCalendar.jsx';

const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

// Local storage for tickets when backend is not available
const DASHBOARD_STATE_KEY = 'dashboard:state';
function readState() { try { return JSON.parse(localStorage.getItem(DASHBOARD_STATE_KEY) || '{}'); } catch { return {}; } }
function writeState(updater) {
  const current = readState();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(next));
  return next;
}

function generateTimes() {
  const times = [];
  const start = 8 * 60; // 8:00
  const end = 18 * 60; // 6:00 PM
  for (let m = start; m <= end; m += 30) {
    const h24 = Math.floor(m / 60);
    const min = m % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = ((h24 + 11) % 12) + 1;
    times.push(`${h12}:${min === 0 ? '00' : '30'} ${ampm}`);
  }
  return times;
}

// Sample machine list for autocomplete
const MACHINES = [
  { id: 'TM-001', name: 'Treadmill #1', type: 'Cardio' },
  { id: 'TM-002', name: 'Treadmill #2', type: 'Cardio' },
  { id: 'TM-003', name: 'Treadmill #3', type: 'Cardio' },
  { id: 'BP-001', name: 'Bench Press #1', type: 'Strength' },
  { id: 'BP-002', name: 'Bench Press #2', type: 'Strength' },
  { id: 'EL-001', name: 'Elliptical #1', type: 'Cardio' },
  { id: 'EL-002', name: 'Elliptical #2', type: 'Cardio' },
  { id: 'BK-001', name: 'Bike #1', type: 'Cardio' },
  { id: 'BK-002', name: 'Bike #2', type: 'Cardio' },
  { id: 'SR-001', name: 'Squat Rack #1', type: 'Strength' },
  { id: 'SR-002', name: 'Squat Rack #2', type: 'Strength' },
  { id: 'RM-001', name: 'Rowing Machine #1', type: 'Cardio' },
  { id: 'RM-002', name: 'Rowing Machine #2', type: 'Cardio' },
  { id: 'SM-001', name: 'Smith Machine #1', type: 'Strength' },
  { id: 'LP-001', name: 'Leg Press #1', type: 'Strength' },
];

// Component to highlight matching text
function HighlightMatch({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) {
    return <span>{text}</span>;
  }
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);
  
  return (
    <span>
      {before}
      <span className="tk-highlight">{match}</span>
      {after}
    </span>
  );
}

// Priority badge component
function PriorityBadge({ priority, size = 'small' }) {
  const priorityColors = {
    Low: { bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.35)' },
    Medium: { bg: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: 'rgba(234, 179, 8, 0.35)' },
    High: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.35)' }
  };
  const colors = priorityColors[priority] || priorityColors.Medium;
  const isSmall = size === 'small';
  
  return (
    <span style={{
      background: colors.bg,
      color: colors.color,
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      fontSize: isSmall ? '10px' : '11px',
      fontWeight: '600',
      padding: isSmall ? '2px 6px' : '3px 8px',
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: 1,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {priority || 'Medium'}
    </span>
  );
}

export default function TicketsTab() {
  const [tickets, setTickets] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [active, setActive] = useState(null);
  const [showOpenOnly, setShowOpenOnly] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    title: '',
    machineName: '',
    worker: '',
    priority: 'Medium',
    checklistText: '',
    sendEmail: false
  });
  const [showMachineAutocomplete, setShowMachineAutocomplete] = useState(false);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const createModalRef = useRef(null);
  const createTitleRef = useRef(null);
  const machineInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const detailsModalRef = useRef(null);

  async function fetchStatus() {
    if (!backendURL) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const statusRes = await fetch(`${backendURL}/api/maintenance/status`);
      let statusData = {};
      if (statusRes.ok) {
        statusData = await statusRes.json();
        setStatuses(Array.isArray(statusData.statuses) ? statusData.statuses : []);
        setTickets(Array.isArray(statusData.tickets) ? statusData.tickets : []);
      } else {
        setErrorMsg(`Status HTTP ${statusRes.status}`);
      }
      const ticketsRes = await fetch(`${backendURL}/api/maintenance/tickets`);
      if (ticketsRes.ok) {
        const tData = await ticketsRes.json();
        if (Array.isArray(tData)) setTickets(tData);
        else if (Array.isArray(tData.tickets)) setTickets(tData.tickets);
      }
    } catch (e) {
      console.error('Fetch status failed', e);
      setErrorMsg(e.message || 'Failed to load');
      setTickets([]);
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  }

  async function scanIntervals() {
    setErrorMsg('');
    try {
      const res = await fetch(`${backendURL}/api/maintenance/scan`, { method: 'POST' });
      if (!res.ok) throw new Error(`Scan HTTP ${res.status}`);
      await fetchStatus();
    } catch (e) {
      console.error('Scan failed', e);
      setErrorMsg(e.message);
    }
  }

  async function closeTicket(ticketId) {
    setErrorMsg('');
    
    // If no backend URL, use local storage
    if (!backendURL) {
      const updatedTickets = tickets.map(t => {
        if (t._id === ticketId) {
          return { ...t, status: 'closed', closedAt: new Date().toISOString() };
        }
        return t;
      });
      setTickets(updatedTickets);
      writeState((curr) => ({ ...curr, tickets: updatedTickets, updatedAt: new Date().toISOString() }));
      return;
    }
    
    // Backend API call
    try {
      const ticket = tickets.find(t => t._id === ticketId);
      let checklistUpdates = [];
      if (ticket && Array.isArray(ticket.checklist)) {
        checklistUpdates = ticket.checklist
          .map(c => {
            if (typeof c === 'string') return { item: c, done: false };
            if (c && typeof c === 'object' && c.item) return { item: c.item, done: !!c.done };
            return null;
          })
          .filter(Boolean);
      }
      const res = await fetch(`${backendURL}/api/maintenance/tickets/${ticketId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistUpdates })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Close HTTP ${res.status}`);
      }
      await fetchStatus();
    } catch (e) {
      console.error('Close failed', e);
      setErrorMsg(e.message);
    }
  }

  function toggleChecklistItem(ticketId, idx) {
    const updatedTickets = tickets.map(t => {
      if (t._id !== ticketId) return t;
      const cloned = { ...t };
      cloned.checklist = (cloned.checklist || []).map((item, i) => {
        if (i !== idx) return item;
        if (typeof item === 'string') return { item, done: true };
        return { ...item, done: !item.done };
      });
      return cloned;
    });
    setTickets(updatedTickets);
    
    // If backend is available, we'll sync when closing the ticket or via periodic fetch
    // For now, just update local state (backend can sync on ticket close)
    if (!backendURL) {
      // Persist to local storage when no backend
      writeState((curr) => ({ ...curr, tickets: updatedTickets, updatedAt: new Date().toISOString() }));
    }
  }

  async function onCreate(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    if (!form.title || !form.machineName) {
      setErrorMsg('Title and Machine Name are required');
      return;
    }
    
    setErrorMsg('');
    const checklist = form.checklistText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    
    // If no backend URL, use local storage
    if (!backendURL) {
      const newTicket = {
        _id: `t_${Date.now()}`,
        title: form.title,
        description: form.title,
        machineName: form.machineName,
        worker: form.worker || 'Unassigned',
        priority: form.priority || 'Medium',
        status: 'open',
        checklist: checklist.map(item => ({ item, done: false })),
        createdAt: new Date().toISOString(),
      };
      const updatedTickets = [newTicket, ...tickets];
      setTickets(updatedTickets);
      writeState((curr) => ({ ...curr, tickets: updatedTickets, updatedAt: new Date().toISOString() }));
      setCreateOpen(false);
      setForm({
        title: '',
        machineName: '',
        worker: '',
        priority: 'Medium',
        checklistText: '',
        sendEmail: false
      });
      return;
    }
    
    // Backend API call
    try {
      const res = await fetch(`${backendURL}/api/maintenance/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          machineName: form.machineName,
          worker: form.worker || undefined,
          priority: form.priority || 'Medium',
          checklist,
          sendEmail: form.sendEmail
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Create HTTP ${res.status}`);
      }
      await fetchStatus();
      setCreateOpen(false);
      setForm({
        title: '',
        machineName: '',
        worker: '',
        priority: 'Medium',
        checklistText: '',
        sendEmail: false
      });
    } catch (error) {
      console.error('Create failed', error);
      setErrorMsg(error.message || 'Failed to create ticket');
    }
  }

  // Load tickets from local storage or backend
  useEffect(() => { 
    if (backendURL) {
      fetchStatus(); 
    } else {
      // Load from local storage when no backend
      const s = readState();
      const list = (s.tickets || []);
      setTickets(list);
    }
  }, []);

  useEffect(() => {
    if (isCreateOpen) { setTimeout(() => createTitleRef.current?.focus(), 0); }
  }, [isCreateOpen]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const hasModal = active || isCreateOpen;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [active, isCreateOpen]);

  // Handle clicks outside autocomplete to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target) &&
          machineInputRef.current && !machineInputRef.current.contains(e.target)) {
        setShowMachineAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for details modal
  useEffect(() => {
    if (!active) return;
    const trap = (e) => {
      if (!detailsModalRef.current) return;
      const focusable = detailsModalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
      if (e.key === 'Escape') setActive(null);
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [active]);

  // Handle machine name input change with autocomplete
  const handleMachineNameChange = (value) => {
    setForm({...form, machineName: value});
    
    if (value.trim().length > 0) {
      const filtered = MACHINES.filter(machine => 
        machine.id.toLowerCase().includes(value.toLowerCase()) ||
        machine.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMachines(filtered);
      setShowMachineAutocomplete(filtered.length > 0);
    } else {
      setShowMachineAutocomplete(false);
      setFilteredMachines([]);
    }
  };

  // Handle machine selection from autocomplete
  const handleMachineSelect = (machine) => {
    setForm({...form, machineName: machine.name});
    setShowMachineAutocomplete(false);
    setFilteredMachines([]);
  };

  const openCount = useMemo(() => tickets.filter(t => t.status === 'open').length, [tickets]);

  const sortedTickets = useMemo(() => {
    const arr = [...tickets];
    // Sort by priority first (High > Medium > Low), then by status
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    arr.sort((a, b) => {
      if ((a.status === 'open') !== (b.status === 'open')) return a.status === 'open' ? -1 : 1;
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      if (aPriority !== bPriority) return bPriority - aPriority; // Higher priority first
      const aAuto = !!a.ruleKey, bAuto = !!b.ruleKey;
      if (aAuto !== bAuto) return aAuto ? -1 : 1;
      if ((a.ruleUnit || '') !== (b.ruleUnit || '')) return (a.ruleUnit || '').localeCompare(b.ruleUnit || '');
      if ((a.ruleInterval || 0) !== (b.ruleInterval || 0)) return (a.ruleInterval || 0) - (b.ruleInterval || 0);
      return (a.dueAtUsage || 0) - (b.dueAtUsage || 0);
    });
    return arr;
  }, [tickets]);

  const visibleTickets = useMemo(
    () => (showOpenOnly ? sortedTickets.filter(t => t.status === 'open') : sortedTickets),
    [sortedTickets, showOpenOnly]
  );

  return (
    <div>
      <style>{`
        /* Theme the date input and custom dropdown to match site colors */
        .nx-dd { position:relative; }
        .nx-dd-button { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; background:#13131a; color:#e5e7eb; border:1px solid #262633; border-radius:8px; padding:8px 10px; height:40px; cursor:pointer; outline:none; }
        .nx-dd-button:focus { border-color:#9b8cfb; outline:4px solid rgba(124,58,237,.18); }
        .nx-dd-menu { position:absolute; top:calc(100% + 8px); left:0; right:0; background:#111119; border:1px solid #1d1d29; border-radius:12px; box-shadow:0 10px 24px rgba(0,0,0,0.45); padding:6px; z-index:60; }
        .nx-dd-item { padding:8px 10px; border-radius:8px; cursor:pointer; color:#e5e7eb; font-size:13px; }
        .nx-dd-item[aria-selected="true"], .nx-dd-item:hover { background:rgba(124,58,237,0.18); color:#c4b5fd; }
        .nx-select { height:40px; }
        .nx-pill { height:32px; cursor:pointer; }

        /* Create Ticket modal refreshed styles */
        .tk-modal { width:min(640px, 80vw) !important; max-width:640px !important; border:1px solid #1d1d29; background:#0f0f16; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.6); overflow:hidden; }
        .tk-header { display:flex; align-items:flex-start; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #1d1d29; }
        .tk-title { font-size:18px; font-weight:600; color:#e5e7eb; }
        .tk-close { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px; color:#a1a1b3; background:transparent; border:1px solid transparent; cursor:pointer; }
        .tk-close:hover { background:#181824; color:#e5e7eb; }
        .tk-close:focus { outline:2px solid rgba(124,58,237,.5); outline-offset:2px; }
        .tk-body { padding:20px 24px; }
        .tk-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width: 768px) { .tk-grid { grid-template-columns:1fr 1fr; gap:18px; } }
        .tk-field { display:flex; flex-direction:column; }
        .tk-label { color:#c7c7d2; font-size:13px; margin-bottom:6px; }
        .tk-helper { color:#8b8ba1; font-size:12px; margin-top:6px; }
        .tk-input { height:44px; border-radius:10px; border:1px solid #262633; background:#13131a; color:#e5e7eb; padding:0 12px; }
        .tk-input::placeholder { color:#7b7b8f; }
        .tk-input:focus { border-color:#9b8cfb; outline:4px solid rgba(124,58,237,.18); }
        .tk-footer-bar { position:sticky; bottom:0; display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid #1d1d29; background:#0f0f16; }
        .tk-btn { height:40px; border-radius:10px; padding:0 14px; border:1px solid #2a2a38; color:#e5e7eb; background:#161624; cursor:pointer; }
        .tk-btn:hover { background:#1b1b2b; }
        .tk-btn:focus { outline:2px solid rgba(124,58,237,.5); outline-offset:2px; }
        .tk-btn.primary { background:#7c3aed; border-color:#7c3aed; color:#fff; cursor:pointer; }
        .tk-btn.primary:hover { background:#6d28d9; }
        .tk-btn[disabled] { opacity:.45; cursor:not-allowed; }

        /* Autocomplete dropdown styles */
        .tk-autocomplete { 
          position: absolute; 
          top: calc(100% - 28px); 
          left: 0; 
          right: 0; 
          background: #111119; 
          border: 1px solid #1d1d29; 
          border-radius: 10px; 
          box-shadow: 0 10px 24px rgba(0,0,0,0.45); 
          max-height: 240px; 
          overflow-y: auto; 
          z-index: 70;
        }
        .tk-autocomplete-item { 
          padding: 10px 12px; 
          cursor: pointer; 
          border-bottom: 1px solid #1c1c27;
          transition: background 0.15s ease;
        }
        .tk-autocomplete-item:last-child { 
          border-bottom: none; 
        }
        .tk-autocomplete-item:hover { 
          background: rgba(124,58,237,0.15); 
        }

        /* Highlight matching text - subtle glassy effect */
        .tk-highlight {
          background: rgba(124, 58, 237, 0.12);
          color: #d4c5fd;
          padding: 1px 3px;
          border-radius: 3px;
          border: 1px solid rgba(124, 58, 237, 0.15);
        }

        /* Ticket Details Modal Styles */
        .tk-details-modal {
          width: min(700px, 94vw);
          max-height: 90vh;
          background: #0f0f16;
          border: 1px solid #1d1d29;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .tk-details-header {
          padding: 24px;
          border-bottom: 1px solid #1d1d29;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(124, 58, 237, 0.02) 100%);
        }
        .tk-details-title {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .tk-details-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .tk-details-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .tk-details-section {
          margin-bottom: 24px;
        }
        .tk-details-section:last-child {
          margin-bottom: 0;
        }
        .tk-details-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tk-checklist-item {
          padding: 12px;
          background: #13131a;
          border: 1px solid #1d1d29;
          border-radius: 8px;
          margin-bottom: 8px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .tk-checklist-item:last-child {
          margin-bottom: 0;
        }
        .tk-checklist-item.completed {
          opacity: 0.6;
        }
        .tk-checklist-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #262633;
          border-radius: 4px;
          background: #13131a;
          cursor: pointer;
          flex-shrink: 0;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tk-checklist-checkbox.checked {
          background: #7c3aed;
          border-color: #7c3aed;
        }
        .tk-checklist-checkbox.checked::after {
          content: '✓';
          color: #fff;
          font-size: 14px;
          font-weight: bold;
        }
        .tk-checklist-text {
          flex: 1;
          color: #e5e7eb;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .tk-details-footer {
          padding: 16px 24px;
          border-top: 1px solid #1d1d29;
          background: #0a0a0f;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        /* Consistent ticket width and improved styling */
        .nx-alert-row {
          min-height: 100px;
          padding: 16px;
          border: 1px solid #1d1d29;
          border-radius: 12px;
          background: #13131a;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .nx-alert-row:hover {
          border-color: #262633;
          background: #151520;
        }
        .nx-alert-row > div:first-child {
          min-width: 0;
          overflow: hidden;
        }
        .tk-ticket-title {
          font-size: 16px;
          font-weight: 600;
          color: #e5e7eb;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .tk-ticket-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 16px;
          margin-bottom: 8px;
          align-items: center;
        }
        .tk-ticket-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #9ca3af;
        }
        .tk-ticket-meta-label {
          color: #6b7280;
          font-weight: 500;
        }
        .tk-ticket-meta-value {
          color: #cbd5e1;
        }
        .tk-ticket-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
          align-items: flex-end;
        }
        @media (min-width: 768px) {
          .tk-ticket-actions {
            flex-direction: row;
          }
        }
      `}</style>

      {errorMsg && (
        <div style={{ marginBottom:12, color:'#f87171', fontSize:13 }}>Error: {errorMsg}</div>
      )}

      {backendURL && (
      <div className="nx-card" style={{ marginBottom:16, display:'flex', flexDirection:'column', gap:12 }}>
        <div className="nx-card-header" style={{ alignItems:'center' }}>
          <div>
            <div className="nx-card-title">Maintenance Intervals</div>
            <div className="nx-subtle">
              Status records: {statuses.length}{loading && ' • Loading...'}
            </div>
          </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="nx-pill" onClick={scanIntervals}>Scan Now</button>
              <button
                className={`nx-pill ${showOpenOnly ? 'primary' : ''}`}
                onClick={() => setShowOpenOnly(!showOpenOnly)}
              >
                {showOpenOnly ? 'Showing Open Tickets' : 'Showing All Tickets'}
              </button>
              <button className="nx-pill" onClick={() => setCreateOpen(true)}>New Ticket</button>
            </div>
        </div>
        <div style={{ borderTop:'1px solid #1c1c27', paddingTop:8, maxHeight:220, overflow:'auto' }}>
          {statuses.length === 0 && <div className="nx-subtle">No interval statuses found.</div>}
          {statuses.map(s => (
            <div key={s._id} style={{ padding:'6px 0', borderBottom:'1px solid #1c1c27' }}>
              <div style={{ color:'#e5e7eb', fontSize:13 }}>
                {s.machineType || 'Machine'} • {s.interval} {s.unit} ({s.key})
                {s.openTicketId && ' • Ticket Open'}
              </div>
              <div className="nx-subtle" style={{ fontSize:11 }}>
                Baseline: {Number(s.baselineUsage).toFixed(1)} • Next Due: {Number(s.nextDueAt).toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      <div className="nx-card" style={{ marginBottom:16, height:'640px', display:'flex', flexDirection:'column' }}>
        <div className="nx-card-header" style={{ alignItems:'center' }}>
          <div>
            <div className="nx-card-title">Tickets</div>
            <div className="nx-subtle">Open: {openCount} • Total: {tickets.length}</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button
              className={`nx-pill ${showOpenOnly ? 'primary' : ''}`}
              onClick={() => setShowOpenOnly(!showOpenOnly)}
            >
              {showOpenOnly ? 'Showing Open' : 'Showing All'}
            </button>
            {backendURL && (
            <button className="nx-pill" onClick={fetchStatus}>Refresh</button>
            )}
            {!backendURL && (
              <button className="nx-pill" onClick={() => setCreateOpen(true)}>New Ticket</button>
            )}
          </div>
        </div>
        <div style={{ overflow:'auto', borderTop:'1px solid #1c1c27', marginTop:8, paddingTop: 8 }}>
          {visibleTickets.length === 0 && <div className="nx-subtle" style={{ padding: '24px', textAlign: 'center' }}>No tickets yet.</div>}
          {visibleTickets.map(t => (
            <div key={t._id} className="nx-alert-row" style={{ gridTemplateColumns:'1fr auto', alignItems:'flex-start' }}>
              <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                <div className="tk-ticket-title">{t.description || t.title}</div>
                <div className="tk-ticket-meta">
                  <div className="tk-ticket-meta-item">
                    <span className="tk-ticket-meta-label">Priority:</span>
                    <PriorityBadge priority={t.priority} size="small" />
                  </div>
                  <div className="tk-ticket-meta-item">
                    <span className="tk-ticket-meta-label">Status:</span>
                    <span className="tk-ticket-meta-value" style={{ 
                      color: t.status === 'open' ? '#22c55e' : '#9ca3af',
                      fontWeight: '500'
                    }}>{t.status}</span>
                  </div>
                  {t.machineName && (
                    <div className="tk-ticket-meta-item">
                      <span className="tk-ticket-meta-label">Machine:</span>
                      <span className="tk-ticket-meta-value">{t.machineName}</span>
                    </div>
                  )}
                  {t.worker && t.worker !== 'Unassigned' && (
                    <div className="tk-ticket-meta-item">
                      <span className="tk-ticket-meta-label">Assigned:</span>
                      <span className="tk-ticket-meta-value">{t.worker}</span>
                    </div>
                  )}
                  {t.createdAt && (
                    <div className="tk-ticket-meta-item">
                      <span className="tk-ticket-meta-label">Created:</span>
                      <span className="tk-ticket-meta-value">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {t.ruleInterval && (
                    <div className="tk-ticket-meta-item">
                      <span className="tk-ticket-meta-label">Interval:</span>
                      <span className="tk-ticket-meta-value">{t.ruleInterval} {t.ruleUnit || ''}</span>
                    </div>
                  )}
                </div>
                {Array.isArray(t.checklist) && t.checklist.length > 0 && (
                  <div style={{ 
                    marginTop: 8, 
                    fontSize: 12, 
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ opacity: 0.6 }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                    <span>{t.checklist.length} checklist item{t.checklist.length !== 1 ? 's' : ''} • Click Details to view</span>
                  </div>
                )}
              </div>
              <div className="tk-ticket-actions">
                <button className="nx-pill" onClick={() => setActive(t)} style={{ whiteSpace: 'nowrap' }}>Details</button>
                {t.status === 'open' && (
                  <button className="nx-pill primary" onClick={() => closeTicket(t._id)} style={{ whiteSpace: 'nowrap' }}>Close</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {active && (
        <div className="nx-modal-overlay" role="dialog" aria-modal="true" onClick={() => setActive(null)}>
          <div ref={detailsModalRef} className="tk-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tk-details-header">
              <div className="tk-details-title">{active.description || active.title}</div>
              <div className="tk-details-meta">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                      <strong style={{ color: '#c7c7d2' }}>Status:</strong> {active.status}
            </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                      <strong style={{ color: '#c7c7d2' }}>Priority:</strong> <PriorityBadge priority={active.priority} />
            </div>
                    {active.worker && (
                      <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                        <strong style={{ color: '#c7c7d2' }}>Assigned To:</strong> {active.worker}
                      </div>
                    )}
                  </div>
                  {active.machineName && (
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                      <strong style={{ color: '#c7c7d2' }}>Machine:</strong> {active.machineName}
                    </div>
                  )}
                  {active.ruleInterval && (
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                      <strong style={{ color: '#c7c7d2' }}>Interval:</strong> {active.ruleInterval} {active.ruleUnit || ''}
                      {active.dueAtUsage != null && ` • Due At: ${active.dueAtUsage}`}
                    </div>
                  )}
                  {active.createdAt && (
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                      <strong style={{ color: '#c7c7d2' }}>Created:</strong> {new Date(active.createdAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <button className="tk-close" onClick={() => setActive(null)} aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3A1 1 0 1 0 5.7 5.7L10.6 10.6 5.7 15.5a1 1 0 1 0 1.4 1.4L12 12l4.9 4.9a1 1 0 0 0 1.4-1.4l-4.9-4.9 4.9-4.9Z"/></svg>
                </button>
              </div>
            </div>

            <div className="tk-details-body">
              {Array.isArray(active.checklist) && active.checklist.length > 0 ? (
                <div className="tk-details-section">
                  <div className="tk-details-section-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#7c3aed' }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                    Checklist ({active.checklist.length} {active.checklist.length === 1 ? 'item' : 'items'})
            </div>
                  {active.checklist.map((item, idx) => {
                    const obj = typeof item === 'string' ? { item, done: false } : item;
                    const isDone = obj.done === true;
                    return (
                      <div 
                        key={idx}
                        className={`tk-checklist-item ${isDone ? 'completed' : ''}`}
                        style={{ cursor: active.status === 'open' ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (active.status === 'open') {
                          toggleChecklistItem(active._id, idx);
                          setActive(a => {
                            if (!a || a._id !== active._id) return a;
                            const updated = { ...a };
                            updated.checklist = updated.checklist.map((item2, i2) => {
                              if (i2 !== idx) return item2;
                              const o = typeof item2 === 'string' ? { item: item2, done: false } : item2;
                              return { ...o, done: !o.done };
                            });
                            return updated;
                          });
                          }
                        }}
                      >
                        <div className={`tk-checklist-checkbox ${isDone ? 'checked' : ''}`} />
                        <div className="tk-checklist-text" style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                          {obj.item}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="tk-details-section">
                  <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20" style={{ marginBottom: '12px', opacity: 0.5 }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                    <div style={{ fontSize: '14px' }}>No checklist items</div>
                  </div>
              </div>
            )}
            </div>

            <div className="tk-details-footer">
              <div style={{ display: 'flex', gap: '8px' }}>
              {active.status === 'open' && (
                <button
                  className="nx-pill primary"
                  onClick={() => { closeTicket(active._id); setActive(null); }}
                >
                  Close Ticket
                </button>
              )}
              </div>
              <button className="nx-pill" onClick={() => setActive(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div
          className="nx-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tkCreateTitle"
          onKeyDown={(e)=>{
            if (e.key === 'Escape') { e.stopPropagation(); setCreateOpen(false); }
            if (e.key === 'Tab') {
              const focusables = createModalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
              if (!focusables || focusables.length === 0) return;
              const first = focusables[0];
              const last = focusables[focusables.length - 1];
              if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }}
          onClick={()=>setCreateOpen(false)}
        >
          <div ref={createModalRef} className="tk-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="tk-header">
              <div id="tkCreateTitle" className="tk-title">Create Ticket</div>
              <button type="button" className="tk-close" aria-label="Close" onClick={()=>setCreateOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3A1 1 0 1 0 5.7 5.7L10.6 10.6 5.7 15.5a1 1 0 1 0 1.4 1.4L12 12l4.9 4.9a1 1 0 0 0 1.4-1.4l-4.9-4.9 4.9-4.9Z"/></svg>
              </button>
            </div>
            <div className="tk-body">
              <div className="tk-grid">
                <div className="tk-field">
                  <label className="tk-label" htmlFor="tkTitle">Title <span style={{color:'#8b8ba1'}}>(required)</span></label>
                  <input id="tkTitle" ref={createTitleRef} className="tk-input" placeholder="Short summary (e.g., Replace belt on Treadmill 3)" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} />
                </div>
                <div className="tk-field" style={{position: 'relative'}}>
                  <label className="tk-label" htmlFor="tkMachine">Machine Name <span style={{color:'#8b8ba1'}}>(required)</span></label>
                  <input 
                    id="tkMachine" 
                    ref={machineInputRef}
                    className="tk-input" 
                    placeholder="e.g., Treadmill #1" 
                    value={form.machineName} 
                    onChange={(e)=>handleMachineNameChange(e.target.value)}
                    onFocus={(e)=>{
                      if (e.target.value.trim().length > 0) {
                        const filtered = MACHINES.filter(machine => 
                          machine.id.toLowerCase().includes(e.target.value.toLowerCase()) ||
                          machine.name.toLowerCase().includes(e.target.value.toLowerCase())
                        );
                        setFilteredMachines(filtered);
                        setShowMachineAutocomplete(filtered.length > 0);
                      }
                    }}
                  />
                  {showMachineAutocomplete && filteredMachines.length > 0 && (
                    <div ref={autocompleteRef} className="tk-autocomplete">
                      {filteredMachines.map(machine => (
                        <div 
                          key={machine.id} 
                          className="tk-autocomplete-item"
                          onClick={() => handleMachineSelect(machine)}
                        >
                          <div style={{fontWeight: '500', color: '#e5e7eb'}}>
                            <HighlightMatch text={machine.name} query={form.machineName} />
                          </div>
                          <div style={{fontSize: '12px', color: '#94a3b8'}}>
                            <HighlightMatch text={`${machine.id} • ${machine.type}`} query={form.machineName} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="tk-helper">Helps route parts and history.</div>
                </div>
                <div className="tk-field">
                  <label className="tk-label" htmlFor="tkWorker">Assign To</label>
                  <TicketDropdown
                    value={form.worker || ''}
                    onChange={(v)=>setForm({...form, worker:v})}
                    options={[
                      {value:'',label:'Select worker…'},
                      {value:'Angel',label:'Angel'},
                      {value:'Soorya',label:'Soorya'},
                      {value:'Matt',label:'Matt'},
                      {value:'Shun',label:'Shun'},
                      {value:'Kevin',label:'Kevin'},
                      {value:'Matias',label:'Matias'},
                    ]}
                  />
                </div>
                <div className="tk-field">
                  <label className="tk-label" htmlFor="tkPriority">Priority</label>
                  <TicketDropdown
                    value={form.priority || 'Medium'}
                    onChange={(v)=>setForm({...form, priority:v})}
                    options={[
                      {value:'Low',label:'Low'},
                      {value:'Medium',label:'Medium'},
                      {value:'High',label:'High'},
                    ]}
                  />
                </div>
                <div className="tk-field" style={{gridColumn: '1 / -1'}}>
                  <label className="tk-label" htmlFor="tkChecklist">Checklist Items</label>
                  <textarea 
                    id="tkChecklist"
                    className="tk-input" 
                    rows={5}
                    placeholder="One item per line"
                    value={form.checklistText}
                    onChange={(e)=>setForm({...form, checklistText:e.target.value})}
                    style={{minHeight: '100px', resize: 'vertical'}}
                  />
                  <div className="tk-helper">Optional. One item per line.</div>
                </div>
                {backendURL && (
                  <div className="tk-field" style={{gridColumn: '1 / -1'}}>
                    <label style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#c7c7d2', cursor:'pointer'}}>
                      <input
                        type="checkbox"
                        checked={form.sendEmail}
                        onChange={(e)=>setForm({...form, sendEmail:e.target.checked})}
                        style={{cursor:'pointer'}}
                      />
                      Send email notification (uses machine email)
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="tk-footer-bar">
              <button className="tk-btn" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCreateOpen(false); }}>Cancel</button>
              <button 
                className="tk-btn primary" 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCreate(e);
                }}
                disabled={!form.title || !form.machineName}
              >
                Create ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Local dropdown for the modal
function TicketDropdown({ value, onChange, options }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const selected = options.find(o => String(o.value) === String(value)) || options[0];
  return (
    <div className="nx-dd" ref={ref}>
      <button className="nx-dd-button" onClick={()=>setOpen(o=>!o)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{selected?.label}</span>
        <span style={{opacity:.8}}>▾</span>
      </button>
      {open && (
        <div className="nx-dd-menu" role="listbox">
          {options.map(opt => (
            <div key={String(opt.value)} className="nx-dd-item" role="option" aria-selected={String(opt.value)===String(value)} onClick={()=>{ onChange(opt.value); setOpen(false); }}>
              {opt.label}
                  </div>
                ))}
        </div>
      )}
    </div>
  );
}
