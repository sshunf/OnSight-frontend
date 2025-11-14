import React, { useEffect, useMemo, useRef, useState } from 'react';
import MaintenanceCalendar from '../components/MaintenanceCalendar.jsx';

const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

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
    deadline: '', 
    checklistText: '',
    sendEmail: false
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDateISO, setPickerDateISO] = useState('');
  const [pickerTime, setPickerTime] = useState('10:00 AM');
  const [showMachineAutocomplete, setShowMachineAutocomplete] = useState(false);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const createModalRef = useRef(null);
  const createTitleRef = useRef(null);
  const machineInputRef = useRef(null);
  const autocompleteRef = useRef(null);

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
    setTickets(prev => prev.map(t => {
      if (t._id !== ticketId) return t;
      const cloned = { ...t };
      cloned.checklist = (cloned.checklist || []).map((item, i) => {
        if (i !== idx) return item;
        if (typeof item === 'string') return { item, done: true };
        return { ...item, done: !item.done };
      });
      return cloned;
    }));
  }

  async function onCreate() {
    if (!form.title || !form.machineName) return;
    setErrorMsg('');
    const checklist = form.checklistText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    try {
      const res = await fetch(`${backendURL}/api/maintenance/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          machineName: form.machineName,
          worker: form.worker || undefined,
          deadline: form.deadline || undefined,
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
        deadline: '',
        checklistText: '',
        sendEmail: false
      });
    } catch (e) {
      console.error('Create failed', e);
      setErrorMsg(e.message);
    }
  }

  useEffect(() => { 
    if (backendURL) {
      fetchStatus(); 
    }
  }, []);

  useEffect(() => {
    if (isCreateOpen) { setTimeout(() => createTitleRef.current?.focus(), 0); }
  }, [isCreateOpen]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const hasModal = active || isCreateOpen || showDatePicker;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [active, isCreateOpen, showDatePicker]);

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
    arr.sort((a, b) => {
      if ((a.status === 'open') !== (b.status === 'open')) return a.status === 'open' ? -1 : 1;
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

  function todayISO() {
    const d = new Date(); const pad = (n)=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }
  function formatDisplay(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'2-digit' }); } catch { return iso; }
  }

  return (
    <div>
      <style>{`
        /* Theme the date input and custom dropdown to match site colors */
        .tk-date { background:#13131a; border:1px solid #262633; color:#e5e7eb; border-radius:8px; padding:8px 10px; height:40px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; }
        .nx-dd { position:relative; }
        .nx-dd-button { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; background:#13131a; color:#e5e7eb; border:1px solid #262633; border-radius:8px; padding:8px 10px; height:40px; cursor:pointer; outline:none; }
        .nx-dd-button:focus { border-color:#9b8cfb; outline:4px solid rgba(124,58,237,.18); }
        .nx-dd-menu { position:absolute; top:calc(100% + 8px); left:0; right:0; background:#111119; border:1px solid #1d1d29; border-radius:12px; box-shadow:0 10px 24px rgba(0,0,0,0.45); padding:6px; z-index:60; }
        .nx-dd-item { padding:8px 10px; border-radius:8px; cursor:pointer; color:#e5e7eb; font-size:13px; }
        .nx-dd-item[aria-selected="true"], .nx-dd-item:hover { background:rgba(124,58,237,0.18); color:#c4b5fd; }
        .nx-select { height:40px; }
        .nx-pill { height:32px; cursor:pointer; }
        .tk-picker { display:grid; grid-template-columns: 1fr 220px; gap:16px; align-items:start; }
        .tk-time-list { border-left:1px solid #1d1d29; padding-left:12px; overflow:auto; max-height:600px; }
        .tk-time-item { display:flex; align-items:center; height:40px; padding:0 10px; border-radius:8px; cursor:pointer; color:#e5e7eb; }
        .tk-time-item:hover { background: rgba(255,255,255,.06); }
        .tk-time-item.active { background: rgba(124,58,237,.18); color:#fff; }
        .tk-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding-top:12px; border-top:1px solid #1d1d29; }
        .tk-chip { background:#13131a; border:1px solid #262633; color:#e5e7eb; border-radius:10px; padding:8px 12px; cursor:pointer; }

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
        .tk-input:focus, .tk-date:focus { border-color:#9b8cfb; outline:4px solid rgba(124,58,237,.18); }
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
        <div style={{ overflow:'auto', borderTop:'1px solid #1c1c27', marginTop:8 }}>
          {visibleTickets.length === 0 && <div className="nx-subtle">No tickets yet.</div>}
          {visibleTickets.map(t => (
            <div key={t._id} className="nx-alert-row" style={{ gridTemplateColumns:'1fr auto', alignItems:'flex-start' }}>
              <div>
                <div style={{ color:'#e5e7eb' }}>{t.description || t.title}</div>
                <div className="nx-subtle" style={{ fontSize:11 }}>
                  Status: {t.status}
                  {' • '}Interval: {t.ruleInterval ?? '—'} {t.ruleUnit || ''}
                  {' • '}Due At: {t.dueAtUsage ?? '—'}
                  {' • '}Created: {t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}
                  {t.closedAt && ` • Closed: ${new Date(t.closedAt).toLocaleString()}`}
                </div>
                {Array.isArray(t.checklist) && t.checklist.length > 0 && (
                  <div style={{ marginTop:6 }}>
                    <div className="nx-card-title" style={{ fontSize:11, color:'#a3a3b2' }}>Checklist</div>
                    <ul style={{ paddingLeft:16 }}>
                      {t.checklist.map((item, idx) => {
                        const obj = typeof item === 'string' ? { item, done: false } : item;
                        return (
                          <li
                            key={idx}
                            style={{
                              cursor: t.status === 'open' ? 'pointer' : 'default',
                              textDecoration: obj.done ? 'line-through' : 'none',
                              fontSize:12
                            }}
                            onClick={() => t.status === 'open' && toggleChecklistItem(t._id, idx)}
                          >
                            {obj.item}{obj.done && ' ✓'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <button className="nx-pill" onClick={() => setActive(t)}>Details</button>
                {t.status === 'open' && (
                  <button className="nx-pill primary" onClick={() => closeTicket(t._id)}>Close</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {active && (
        <div className="nx-modal-overlay" role="dialog" aria-modal="true">
          <div className="nx-card" style={{ width:'min(700px,94vw)' }}>
            <div className="nx-card-header">
              <div className="nx-card-title">{active.description || active.title}</div>
              <button className="nx-pill" onClick={() => setActive(null)}>Close</button>
            </div>
            <div className="nx-subtle">Status: {active.status}</div>
            <div className="nx-subtle">Interval: {active.ruleInterval || '—'} {active.ruleUnit || ''}</div>
            <div className="nx-subtle">
              Baseline: {active.baselineAtOpen ?? '—'} • Due At: {active.dueAtUsage ?? '—'}
            </div>
            <div className="nx-subtle">Triggered At: {active.triggeredAtUsage ?? '—'}</div>
            {active.cumulativeUsageAtClose != null && (
              <div className="nx-subtle">Closed Usage Snapshot: {active.cumulativeUsageAtClose}</div>
            )}
            {Array.isArray(active.checklist) && active.checklist.length > 0 && (
              <div style={{ marginTop:12 }}>
                <div className="nx-card-title" style={{ fontSize:12, color:'#a3a3b2' }}>Checklist</div>
                <ul style={{ paddingLeft:18 }}>
                  {active.checklist.map((c, idx) => {
                    const obj = typeof c === 'string' ? { item: c, done: false } : c;
                    return (
                      <li
                        key={idx}
                        style={{
                          display:'flex',
                          gap:6,
                          fontSize:12,
                          textDecoration: obj.done ? 'line-through' : 'none',
                          cursor: active.status === 'open' ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                          if (active.status !== 'open') return;
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
                        }}
                      >
                        {obj.item} {obj.done && '✓'}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div className="nx-modal-actions">
              {active.status === 'open' && (
                <button
                  className="nx-pill primary"
                  onClick={() => { closeTicket(active._id); setActive(null); }}
                >
                  Close Ticket
                </button>
              )}
              <button className="nx-pill" onClick={() => setActive(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

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
                  <label className="tk-label" htmlFor="tkDeadline">Deadline</label>
                  <button id="tkDeadline" className="tk-date" onClick={()=>{ setPickerDateISO(form.deadline || todayISO()); setPickerTime('10:00 AM'); setShowDatePicker(true); }} aria-haspopup="dialog" aria-expanded={showDatePicker}>
                    <span>{form.deadline ? formatDisplay(form.deadline) : 'Select date'}</span>
                    <span style={{opacity:.8}}>▾</span>
                  </button>
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
              <button className="tk-btn" type="button" onClick={()=>setCreateOpen(false)}>Cancel</button>
              <button className="tk-btn primary" type="button" onClick={onCreate} disabled={!form.title || !form.machineName}>Create ticket</button>
            </div>
          </div>
        </div>
      )}

      {showDatePicker && (
        <div className="nx-modal-overlay" role="dialog" aria-modal="true">
          <div className="nx-card" style={{width:'min(760px, 96vw)'}}>
            <div className="tk-picker" style={{minHeight:420}}>
              <div>
                <MaintenanceCalendar
                  manualDate={pickerDateISO}
                  nextDates={[]}
                  events={[]}
                  onSelectDate={(iso)=>{ setPickerDateISO(iso); }}
                  onReset={()=>{ setPickerDateISO(todayISO()); setPickerTime('10:00 AM'); }}
                />
              </div>
              <div className="tk-time-list" aria-label="Time list">
                {generateTimes().map(t => (
                  <div key={t} className={`tk-time-item ${t===pickerTime?'active':''}`} onClick={()=>setPickerTime(t)} role="button" tabIndex={0} aria-label={t}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="tk-footer">
              <button className="nx-pill" onClick={()=>setShowDatePicker(false)}>Cancel</button>
              <button className="nx-pill primary" onClick={()=>{ setForm({...form, deadline: pickerDateISO}); setShowDatePicker(false); }}>Schedule</button>
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
