import React, { useEffect, useMemo, useState } from 'react';
import MaintenanceCalendar from '../components/MaintenanceCalendar.jsx';
import WorkerTasks from '../components/WorkerTasks.jsx';
import EventCard from '../components/EventCard.jsx';
import { EMPLOYEES, getPositionColor, getInitials } from '../data/employees';
import { mergeScheduledEvents } from '../utils/scheduledEvents';

const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

// Local storage key (reuse dashboard pattern). If a higher-level state exists later,
// this component can be swapped to use that provider without changing its UI.
const DASHBOARD_STATE_KEY = 'dashboard:state';
const STORAGE_VERSION = 'v2';

function readState() {
  try {
    const raw = localStorage.getItem(DASHBOARD_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed?._version !== STORAGE_VERSION) {
      // Wipe old demo/legacy cached data
      localStorage.removeItem(DASHBOARD_STATE_KEY);
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function writeState(updater) {
  const current = readState();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify({ ...next, _version: STORAGE_VERSION }));
  return next;
}

function toISODate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateISO, days) {
  const base = new Date(dateISO);
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function slotKey(dateISO, hour) {
  return `${dateISO}|${hour}`;
}

export default function MaintenanceTab() {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [intervalDays, setIntervalDays] = useState(90);
  const [lastManualDate, setLastManualDate] = useState(null);
  const [next1, setNext1] = useState('');
  const [next2, setNext2] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [showWorkerSelector, setShowWorkerSelector] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [scheduledTickets, setScheduledTickets] = useState([]);

  const timeOptions = useMemo(() => {
    const opts = [];
    for (let h = 5; h <= 22; h++) {
      const date = new Date();
      date.setHours(h, 0, 0, 0);
      opts.push({
        hour: h,
        label: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      });
    }
    return opts;
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const hasModal = activeEvent || showWorkerSelector;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeEvent, showWorkerSelector]);

  // Remove duplicate tasks that share the same title for a given day
  function dedupeByDateAndTitle(list) {
    const seen = new Set();
    const out = [];
    for (const e of list) {
      const key = `${e.date}|${String(e.title || '').trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(e);
    }
    return out;
  }

  // Listen for maintenance scheduling events
  useEffect(() => {
    const handleScheduleMaintenance = (event) => {
      const { machineId, machineName, targetDate } = event.detail;
      
      if (targetDate) {
        // Update selected date for task sidebar
        setSelectedDate(targetDate);
        setManualInput(targetDate);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('scheduleMaintenanceFor', handleScheduleMaintenance);
    return () => window.removeEventListener('scheduleMaintenanceFor', handleScheduleMaintenance);
  }, []);

  // Availability helpers
function slotFor(dateISO, hour) {
    const start = new Date(dateISO);
    const [y, m, d] = dateISO.split('-').map(Number);
    start.setFullYear(y, m - 1, d, hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return { start, end, key: slotKey(dateISO, hour), hour, dateIso: dateISO };
  }

  async function fetchAvailability() {
    if (!backendURL) return;
    setAvailabilityLoading(true);
    setAvailabilityError('');
    try {
      const gymId = localStorage.getItem('gymId');
      if (!gymId) throw new Error('No gym selected');
      const res = await fetch(`${backendURL}/api/maintenance/availability?gymId=${encodeURIComponent(gymId)}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Availability HTTP ${res.status}`);
      }
      const data = await res.json();
      setAvailability((data.slots || []).map(s => {
        const start = new Date(s.start);
        const hourVal = Number(s.hour);
        const hour = Number.isFinite(hourVal) ? hourVal : start.getHours();
        const dateISO = s.date || s.dateIso || toISODate(start);
        return { ...s, start, end: new Date(s.end), key: slotKey(dateISO, hour), hour, dateIso: dateISO };
      }));
    } catch (e) {
      console.error('Failed to fetch availability', e);
      setAvailabilityError(e.message);
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function saveAvailability(slots) {
    if (!backendURL) return;
    setAvailabilityLoading(true);
    setAvailabilityError('');
    try {
      const gymId = localStorage.getItem('gymId');
      if (!gymId) throw new Error('No gym selected');
      const res = await fetch(`${backendURL}/api/maintenance/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId,
          slots: slots.map(s => ({
            start: s.start,
            end: s.end,
            hour: s.hour,
            date: s.dateIso
          }))
        })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Availability save HTTP ${res.status}`);
      }
      const data = await res.json();
      setAvailability((data.slots || []).map(s => ({ ...s, start: new Date(s.start), end: new Date(s.end) })));
    } catch (e) {
      console.error('Failed to save availability', e);
      setAvailabilityError(e.message);
    } finally {
      setAvailabilityLoading(false);
    }
  }

  function toggleAvailabilityForSelected(hour) {
    setAvailability((prev) => {
      const { start, end, key, dateIso } = slotFor(selectedDate, hour);
      const exists = prev.find(s => s.key === key);
      if (exists) {
        return prev.filter(s => s.key !== key);
      }
      return [...prev, { start, end, key, hour, dateIso }];
    });
  }

  // initialize from storage
  useEffect(() => {
    const s = readState();
    const maint = s.maintenance || {};
    const interval = Number(maint.maintenanceIntervalDays) || 90;
    const last = maint.lastManualDate || null;
    const ev = maint.events || [];
    setIntervalDays(interval);
    setLastManualDate(last);
    setEvents(ev);
    persist({ events: ev });
    fetchScheduledTickets();
    const base = last || todayISO;
    setNext1(addDays(base, interval));
    setNext2(addDays(base, interval * 2));
  }, [todayISO]);

  function persist(maint) {
    const payload = writeState((curr) => ({
      ...curr,
      maintenance: {
        ...(curr.maintenance || {}),
        ...maint,
        updatedAt: new Date().toISOString(),
      },
    })).maintenance;
    window.dispatchEvent(new CustomEvent('maintenanceScheduleUpdated', { detail: payload }));
  }

  function onApplyWith(isoOverride) {
    const useISO = isoOverride || manualInput;
    if (!useISO) return;
    // validations
    const chosen = new Date(useISO);
    if (Number.isNaN(+chosen)) return;
    const warnPast = new Date(); warnPast.setDate(warnPast.getDate() - 30);
    if (chosen < warnPast) {
      if (!window.confirm('Selected date is more than 30 days in the past. Proceed?')) return;
    }
    // Removed confirmation prompt as requested
    const future365 = new Date(); future365.setDate(future365.getDate() + 365);
    if (chosen > future365) {
      if (!window.confirm('Manual date is over 365 days in the future. Proceed?')) return;
    }

    const n1 = addDays(useISO, intervalDays);
    const n2 = addDays(useISO, intervalDays * 2);
    setLastManualDate(useISO);
    setNext1(n1); setNext2(n2);
    persist({ lastManualDate: useISO, maintenanceIntervalDays: intervalDays, nextDates: [n1, n2] });
    window.dispatchEvent(new CustomEvent('manualMaintenanceApplied', { detail: { manualDate: useISO, source: 'maintenance-tab' } }));
  }

  // Load availability when backend is configured
  useEffect(() => {
    if (backendURL) fetchAvailability();
  }, []);

  function onApply() { onApplyWith(); }

  function onReset() {
    const base = todayISO;
    const n1 = addDays(base, intervalDays);
    const n2 = addDays(base, intervalDays * 2);
    setLastManualDate(null);
    setNext1(n1); setNext2(n2);
    persist({ lastManualDate: null, maintenanceIntervalDays: intervalDays, nextDates: [n1, n2] });
    window.dispatchEvent(new CustomEvent('maintenanceScheduleReset'));
  }

  async function fetchScheduledTickets() {
    if (!backendURL) return;
    try {
      const gymId = localStorage.getItem('gymId');
      if (!gymId) throw new Error('No gym selected');
      const res = await fetch(`${backendURL}/api/maintenance/gyms/${gymId}/tickets`);
      if (!res.ok) throw new Error(`Tickets HTTP ${res.status}`);
      const data = await res.json();
      const scheduled = (Array.isArray(data) ? data : []).filter(t => t.scheduledAt && t.gymId === gymId);
      setScheduledTickets(scheduled);
    } catch (e) {
      console.error('Failed to fetch scheduled tickets', e);
      setScheduledTickets([]);
    }
  }

  function onSaveInterval(v) {
    const num = Math.max(1, Number(v) || 90);
    setIntervalDays(num);
    // Recompute from base
    const base = lastManualDate || todayISO;
    const n1 = addDays(base, num);
    const n2 = addDays(base, num * 2);
    setNext1(n1); setNext2(n2);
    persist({ maintenanceIntervalDays: num, nextDates: [n1, n2] });
  }

  return (
    <div>
      {/* Calendar card replacing date inputs */}
      <div className="nx-card" style={{marginBottom: 16}}>
        <div className="nx-card-header">
          <div>
            <div className="nx-card-title">Maintenance Calendar</div>
            <div className="nx-subtle">Select a date to set manual maintenance. Highlights show upcoming dates.</div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="nx-pill" onClick={()=>setActiveEvent({ id: '__add_event__', date: selectedDate })} aria-label="Add event" style={{width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
              </svg>
            </button>
            <button className="nx-pill" onClick={()=>{
              setShowWorkerSelector(true);
            }} aria-label="Open worker view" style={{minWidth:'180px', padding:'0 16px'}}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '6px', display: 'inline-block'}}>
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              Open as Worker View
            </button>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'4fr 1fr', gap:16}}>
          <div>
            <MaintenanceCalendar
              manualDate={lastManualDate}
              nextDates={[next1, next2]}
              events={mergeScheduledEvents(events, scheduledTickets)}
              selectedDate={selectedDate}
              onEventClick={(ev)=>{ setActiveEvent(ev); setSelectedDate(ev.date); }}
              onSelectDate={(iso)=>{ 
                setSelectedDate(iso); 
                setManualInput(iso); 
                // Don't call onApplyWith here to avoid changing manual date
                // Just update the selected date for task sidebar
              }}
              onAddEvent={(iso)=>{ setSelectedDate(iso); setActiveEvent({ id: '__add_event__', date: iso }); }}
              onReset={onReset}
            />
          </div>
          <div style={{borderLeft:'1px solid #1d1d29', paddingLeft:12}}>
            <div className="nx-card-title" style={{marginBottom:8}}>
              Tasks — {(() => {
                try {
                  // Parse ISO date correctly to avoid timezone issues
                  const [year, month, day] = selectedDate.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  return date.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                } catch {
                  return selectedDate;
                }
              })()}
            </div>
            <div className="nx-subtle" style={{marginBottom:8}}>Click a day or pill to update.</div>
            {/* PILOT PROGRAM: Tasks commented out temporarily */}
            {/* {(() => {
              const tasksForDay = events.filter(e => e.date === selectedDate);
              if (tasksForDay.length === 0) {
                return <div className="nx-subtle">No tasks for this day.</div>;
              }
              return (
                <div key={selectedDate}>
                  {tasksForDay.map(ev => (
                <div key={ev.id} className="nx-alert-row" style={{
                  gridTemplateColumns:'1fr auto',
                  border: ev.status === 'Completed' ? '1px solid rgba(34,197,94,0.3)' : '1px solid #1c1c27',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px',
                  background: ev.status === 'Completed' ? 'rgba(34,197,94,0.05)' : 'transparent'
                }}>
                  <div>
                    <div style={{
                      color: ev.status === 'Completed' ? '#22c55e' : '#e5e7eb',
                      fontWeight: '400'
                    }}>{ev.title}</div>
                    <div className="nx-subtle">Status: {ev.status}{ev.assignedTo ? ` • Assignee: ${ev.assignedTo}` : ''}</div>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button className="nx-pill" onClick={()=>setActiveEvent(ev)}>Details</button>
                  </div>
                </div>
                  ))}
                </div>
              );
            })()} */}
            {(() => {
              const tasksForDay = (mergeScheduledEvents(events, scheduledTickets) || []).filter(ev => ev.date === selectedDate);
              if (tasksForDay.length === 0) {
                return <div className="nx-subtle">No tasks for this day.</div>;
              }
              return (
                <div key={selectedDate}>
                  {tasksForDay.map(ev => (
                    <div key={ev.id} className="nx-alert-row" style={{
                      gridTemplateColumns:'1fr auto',
                      border: ev.status === 'Completed' ? '1px solid rgba(34,197,94,0.3)' : '1px solid #1c1c27',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '8px',
                      background: ev.status === 'Completed' ? 'rgba(34,197,94,0.05)' : 'transparent'
                    }}>
                      <div>
                        <div style={{
                          color: ev.status === 'Completed' ? '#22c55e' : '#e5e7eb',
                          fontWeight: '500'
                        }}>{ev.title}</div>
                        <div className="nx-subtle">
                          Status: {ev.status || 'Scheduled'}
                          {ev.assignedTo ? ` · Assignee: ${ev.assignedTo}` : ''}
                          {ev.scheduledAt ? ` · ${new Date(ev.scheduledAt).toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Technician availability (calendar-driven) */}
      <div className="nx-card" style={{ marginBottom: 16 }}>
        <div className="nx-card-header" style={{ alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div className="nx-card-title">Technician Scheduling Availability</div>
            <div className="nx-subtle">Select a day on the calendar above, then pick available times.</div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button
              className="nx-pill"
              onClick={() => setAvailability([])}
              disabled={availabilityLoading}
            >
              Clear Availability
            </button>
            <button
              className="nx-pill primary"
              onClick={() => saveAvailability(availability)}
              disabled={availabilityLoading || !backendURL}
            >
              {availabilityLoading ? 'Saving…' : 'Save Availability'}
            </button>
          </div>
        </div>
        {availabilityError && <div style={{ color:'#f87171', fontSize:13, padding:'0 16px 8px' }}>{availabilityError}</div>}
        {!backendURL && <div className="nx-subtle" style={{ padding:'0 16px 12px' }}>Connect backend to manage availability.</div>}
        <div style={{ padding:'12px 16px' }}>
            <div className="nx-subtle" style={{ marginBottom: 8 }}>
              Selected date: {(() => {
                try {
                  const [y,m,d] = selectedDate.split('-').map(Number);
                  const dt = new Date(y, m-1, d);
                  return dt.toLocaleDateString(undefined, { month:'long', day:'numeric', year:'numeric' });
                } catch { return selectedDate; }
              })()}
            </div>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {timeOptions.map(opt => {
              const { key } = slotFor(selectedDate, opt.hour);
              const isOn = availability.some(s => s.key === key);
              return (
                <label key={opt.hour} style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', color:'#cbd5e1', fontSize:'13px', padding:'8px 10px', borderRadius:'10px', border: isOn ? '1px solid #7c3aed' : '1px solid #1d1d29', background: isOn ? 'rgba(124,58,237,0.1)' : 'transparent' }}>
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => toggleAvailabilityForSelected(opt.hour)}
                    style={{ width:16, height:16 }}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
          {availability.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="nx-subtle" style={{ marginBottom:6 }}>Published slots</div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[...availability].sort((a,b)=>new Date(a.start)-new Date(b.start)).map((s, idx) => {
                  const ts = new Date(s.start);
                  const dateLabel = ts.toLocaleDateString(undefined, { month:'short', day:'numeric' });
                  const hourFromKey = s.key ? Number(s.key.split('|')[1]) : ts.getHours();
                  const displayTs = new Date(ts);
                  displayTs.setHours(hourFromKey, 0, 0, 0);
                  const timeLabel = displayTs.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
                  return (
                    <span key={idx} className="nx-pill" style={{ background:'#111119', border:'1px solid #1d1d29', color:'#e5e7eb' }}>
                      {dateLabel} · {timeLabel}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Config card */}
      <div className="nx-card">
        <div className="nx-card-header">
          <div className="nx-card-title">Schedule Settings</div>
        </div>
        <div style={{maxWidth: 240}}>
          <label className="nx-subtle" htmlFor="maintenanceIntervalDays">Interval (days)</label>
          <input id="maintenanceIntervalDays" className="nx-select" type="number" min={1} value={intervalDays} onChange={(e)=>onSaveInterval(e.target.value)} aria-label="Maintenance interval in days" />
          <div className="nx-subtle" style={{marginTop: 6}}>Default interval is 90 days.</div>
        </div>
      </div>

      {activeEvent && activeEvent.id !== '__worker_view__' && activeEvent.id !== '__add_event__' && (
        <EventCard
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          onComplete={(ev) => {
            const updated = events.map(e => e.id === ev.id ? { ...e, status: 'Completed' } : e);
            setEvents(updated);
            persist({ events: updated });
            setActiveEvent(null);
            window.dispatchEvent(new CustomEvent('maintenanceEventUpdated', { detail: ev }));
          }}
          onReassign={(ev) => {
            const updated = events.map(e => e.id === ev.id ? { ...e, assignedTo: ev.assignedTo } : e);
            setEvents(updated);
            persist({ events: updated });
            setActiveEvent(null);
            window.dispatchEvent(new CustomEvent('maintenanceEventUpdated', { detail: ev }));
          }}
        />
      )}

      {activeEvent && activeEvent.id === '__add_event__' && (
        <div className="nx-modal-overlay" role="dialog" aria-modal="true">
          <div className="nx-modal">
            <div className="nx-modal-title">Add Event — {activeEvent.date}</div>
            <div>
              <div className="nx-modal-q">Event Title</div>
              <input 
                className="nx-modal-text" 
                placeholder="Enter event title"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const title = e.target.value;
                    if (title) {
                      const newEvent = {
                        id: `event_${Date.now()}`,
                        title,
                        date: activeEvent.date,
                        assignedTo: 'Unassigned',
                        deadline: activeEvent.date,
                        status: 'Pending'
                      };
                      const updated = dedupeByDateAndTitle([...events, newEvent]);
                      setEvents(updated);
                      persist({ events: updated });
                      setActiveEvent(null);
                    }
                  }
                }}
              />
            </div>
            <div className="nx-modal-actions">
              <button className="nx-modal-btn" onClick={()=>setActiveEvent(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {activeEvent && activeEvent.id === '__worker_view__' && (
        <div className="nx-modal-overlay" role="dialog" aria-modal="true">
          <div style={{width:'min(820px, 94vw)'}}>
            <WorkerTasks />
            <div className="nx-modal-actions" style={{marginTop:12}}>
              <button className="nx-pill" onClick={()=>setActiveEvent(null)} aria-label="Close worker view">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Selector Modal */}
      {showWorkerSelector && (
        <div className="nx-modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowWorkerSelector(false)}>
          <div className="nx-card" style={{width: 'min(680px, 94vw)', maxHeight: '85vh', display: 'flex', flexDirection: 'column'}} onClick={(e) => e.stopPropagation()}>
            <div className="nx-card-header">
              <div>
                <div className="nx-card-title">Select Worker to View</div>
                <div className="nx-subtle">Choose an employee to see their assigned tasks</div>
              </div>
              <button className="nx-pill" onClick={() => setShowWorkerSelector(false)}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '4px', display: 'inline-block'}}>
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
                Close
              </button>
            </div>
            <div style={{flex: 1, overflow: 'auto', padding: '8px 0'}}>
              {EMPLOYEES.map(emp => {
                const currentWorker = localStorage.getItem('currentWorker') || 'Soorya';
                const isActive = emp.name === currentWorker;
                const positionColor = getPositionColor(emp.position);
                
                return (
                  <div
                    key={emp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                      borderTop: '1px solid #1c1c27',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => {
                      localStorage.setItem('currentWorker', emp.name);
                      setShowWorkerSelector(false);
                      setActiveEvent({ id: '__worker_view__' });
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${positionColor} 0%, ${positionColor}dd 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {getInitials(emp.name)}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '4px'}}>
                        {emp.name}
                        {isActive && <span style={{marginLeft: '8px', fontSize: '12px', color: '#c4b5fd', fontWeight: '400'}}>(Current)</span>}
                      </div>
                      <div style={{fontSize: '13px', color: '#94a3b8', marginBottom: '6px'}}>{emp.position}</div>
                      {emp.certifications && emp.certifications.length > 0 && (
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                          {emp.certifications.slice(0, 3).map((cert, idx) => (
                            <span key={idx} style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              background: 'rgba(124, 58, 237, 0.12)',
                              border: '1px solid rgba(124, 58, 237, 0.2)',
                              borderRadius: '4px',
                              color: '#c4b5fd'
                            }}>
                              {cert}
                            </span>
                          ))}
                          {emp.certifications.length > 3 && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              background: 'rgba(124, 58, 237, 0.12)',
                              border: '1px solid rgba(124, 58, 237, 0.2)',
                              borderRadius: '4px',
                              color: '#c4b5fd'
                            }}>
                              +{emp.certifications.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <svg width="20" height="20" fill="#7c3aed" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


