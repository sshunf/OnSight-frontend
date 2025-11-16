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
  const [gymMachines, setGymMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [resolveConfirmTicket, setResolveConfirmTicket] = useState(null);
  const createModalRef = useRef(null);
  const createTitleRef = useRef(null);
  const detailsModalRef = useRef(null);
  const resolveModalRef = useRef(null);

  // Backend routing - use backend when available, fallback to local storage
  async function fetchStatus() {
    if (!backendURL) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const gymId = localStorage.getItem('gymId');
      if (!gymId) {
        console.error('No gymId found in localStorage');
        setErrorMsg('No gym selected');
        return;
      }
      
      // Fetch gym-specific tickets directly (this is the main source of truth)
      console.log('Fetching tickets for gym:', gymId);
      const ticketsRes = await fetch(`${backendURL}/api/maintenance/gyms/${gymId}/tickets`);
      if (ticketsRes.ok) {
        const tData = await ticketsRes.json();
        console.log('Tickets response:', tData); // Debug log
        console.log('Number of tickets fetched:', Array.isArray(tData) ? tData.length : 0);
        
        // The endpoint returns an array directly
        if (Array.isArray(tData)) {
          setTickets(tData);
        } else {
          console.warn('Unexpected tickets response format:', tData);
          setTickets([]);
        }
      } else {
        console.error(`Tickets HTTP ${ticketsRes.status}`);
        const errorText = await ticketsRes.text();
        console.error('Tickets error response:', errorText);
        setTickets([]);
      }
      
      // Fetch maintenance statuses (for intervals) - optional
      try {
        const statusRes = await fetch(`${backendURL}/api/maintenance/status?gymId=${gymId}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setStatuses(Array.isArray(statusData.statuses) ? statusData.statuses : []);
        } else {
          console.warn(`Status HTTP ${statusRes.status}`);
          setStatuses([]);
        }
      } catch (statusError) {
        console.warn('Status fetch failed (non-critical):', statusError);
        setStatuses([]);
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

  async function fetchGymMachines() {
    if (!backendURL) {
      // Use sample machines if no backend
      setGymMachines(MACHINES.map(m => ({ value: m.name, label: m.name, id: m.id, type: m.type })));
      return;
    }
    
    setMachinesLoading(true);
    try {
      const gymId = localStorage.getItem('gymId');
      if (!gymId) {
        throw new Error('No gym selected');
      }
      
      // FIXED: Use the correct API endpoint
      const res = await fetch(`${backendURL}/api/machines?gymId=${gymId}`);
      if (!res.ok) throw new Error(`Machines HTTP ${res.status}`);
      
      const machines = await res.json();
      const machineOptions = machines.map(m => ({
        value: m.name || m._id,
        label: m.name || `Machine ${m._id}`,
        id: m._id,
        type: m.type || 'Unknown'
      }));
      
      setGymMachines(machineOptions);
    } catch (e) {
      console.error('Failed to fetch gym machines', e);
      // Fallback to sample machines
      setGymMachines(MACHINES.map(m => ({ value: m.name, label: m.name, id: m.id, type: m.type })));
    } finally {
      setMachinesLoading(false);
    }
  }

  async function scanIntervals() {
    setErrorMsg('');
    try {
      const gymId = localStorage.getItem('gymId');
      if (!gymId) {
        throw new Error('No gym selected');
      }
      console.log('Starting scan for gym:', gymId);
      
      const res = await fetch(`${backendURL}/api/maintenance/gyms/${gymId}/scan`, { method: 'POST' });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Scan failed with status:', res.status, 'Response:', errorText);
        throw new Error(`Scan HTTP ${res.status}`);
      }
      
      const scanResult = await res.json();
      console.log('Scan completed successfully:', scanResult);
      
      // Refresh tickets after scan to show any newly created auto-tickets
      await fetchStatus();
    } catch (e) {
      console.error('Scan failed', e);
      setErrorMsg(e.message);
    }
  }

  async function resolveTicket(ticketId) {
    setErrorMsg('');
    setResolveConfirmTicket(null);
    
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
      const gymId = localStorage.getItem('gymId');
      console.log('Closing ticket:', ticketId, 'for gym:', gymId, 'with checklist updates:', checklistUpdates);
      
      const res = await fetch(`${backendURL}/api/maintenance/tickets/${ticketId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistUpdates, gymId })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Ticket closing failed:', res.status, err);
        throw new Error(err.error || `Close HTTP ${res.status}`);
      }
      
      const result = await res.json();
      console.log('Ticket closed successfully:', result);
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
        manual: true,
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
      const gymId = localStorage.getItem('gymId');
      console.log('Creating ticket for gym:', gymId, 'with data:', {
        title: form.title,
        machineName: form.machineName,
        worker: form.worker || undefined,
        priority: form.priority || 'Medium',
        checklist,
        sendEmail: form.sendEmail
      });
      
      const res = await fetch(`${backendURL}/api/maintenance/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          machineName: form.machineName,
          worker: form.worker || undefined,
          priority: form.priority || 'Medium',
          checklist,
          sendEmail: form.sendEmail,
          gymId
        })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Ticket creation failed:', res.status, err);
        throw new Error(err.error || `Create HTTP ${res.status}`);
      }
      
      const createdTicket = await res.json();
      console.log('Ticket created successfully:', createdTicket);
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

  // Load tickets and machines - use backend when available, fallback to local storage
  useEffect(() => { 
    if (backendURL) {
      fetchStatus();
      fetchGymMachines();
    } else {
      // Load from local storage when no backend
      const s = readState();
      const list = (s.tickets || []);
      setTickets(list);
      fetchGymMachines(); // Still load sample machines
    }
  }, []);

  useEffect(() => {
    if (isCreateOpen) { 
      setTimeout(() => createTitleRef.current?.focus(), 0);
      // Refresh machines list when modal opens
      fetchGymMachines();
    }
  }, [isCreateOpen]);

  // Keyboard handling for resolve modal
  useEffect(() => {
    if (!resolveConfirmTicket) return;
    const trap = (e) => {
      if (e.key === 'Escape') setResolveConfirmTicket(null);
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [resolveConfirmTicket]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const hasModal = active || isCreateOpen || resolveConfirmTicket;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [active, isCreateOpen]);

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
      {/* ... rest of your JSX remains exactly the same ... */}
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

      <div className="nx-card" style={{ marginBottom:16, height:'640px', display:'flex', flexDirection:'column' }}>
        <div className="nx-card-header" style={{ alignItems:'center' }}>
          <div>
            <div className="nx-card-title">Tickets</div>
            <div className="nx-subtle">Open: {openCount} • Total: {tickets.length}</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {/* Backend scan button - shown when backend is available */}
            {backendURL && (
              <button className="nx-pill" onClick={scanIntervals}>Scan Now</button>
            )}
            <button
              className={`nx-pill ${showOpenOnly ? 'primary' : ''}`}
              onClick={() => setShowOpenOnly(!showOpenOnly)}
            >
              {showOpenOnly ? 'Showing Open' : 'Showing All'}
            </button>
            {/* Backend refresh button - shown when backend is available */}
            {backendURL && (
            <button className="nx-pill" onClick={fetchStatus}>Refresh</button>
            )}
            <button className="nx-pill" onClick={() => setCreateOpen(true)}>New Ticket</button>
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
                    <span className="tk-ticket-meta-label">Type:</span>
                    <span className="tk-ticket-meta-value" style={{ 
                      color: (t.manual === true || (!t.ruleKey && !t.ruleInterval)) ? '#6366f1' : '#f59e0b',
                      fontWeight: '500',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {(t.manual === true || (!t.ruleKey && !t.ruleInterval)) ? 'Manual' : 'Auto'}
                    </span>
                  </div>
                  <div className="tk-ticket-meta-item">
                    <span className="tk-ticket-meta-label">Priority:</span>
                    <PriorityBadge priority={t.priority} size="small" />
                  </div>
                  <div className="tk-ticket-meta-item">
                    <span className="tk-ticket-meta-label">Status:</span>
                    <span className="tk-ticket-meta-value" style={{ 
                      color: t.status === 'open' ? '#22c55e' : t.status === 'closed' ? '#9ca3af' : '#9ca3af',
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
                  <button className="nx-pill primary" onClick={() => setResolveConfirmTicket(t)} style={{ whiteSpace: 'nowrap' }}>Resolve</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ... rest of your modals remain exactly the same ... */}
    </div>
  );
}

// Local dropdown for the modal
function TicketDropdown({ value, onChange, options, disabled = false }) {
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
      <button 
        className="nx-dd-button" 
        onClick={()=>!disabled && setOpen(o=>!o)} 
        aria-haspopup="listbox" 
        aria-expanded={open}
        disabled={disabled}
        style={{
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <span>{selected?.label}</span>
        <span style={{opacity:.8}}>▾</span>
      </button>
      {open && !disabled && (
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