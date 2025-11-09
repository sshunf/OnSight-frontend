import React, { useEffect, useMemo, useState } from 'react';
import MaintenanceCalendar from '../components/MaintenanceCalendar.jsx';
import WorkerTasks from '../components/WorkerTasks.jsx';
import EventCard from '../components/EventCard.jsx';
import { EMPLOYEES, getPositionColor, getInitials } from '../data/employees';

// Local storage key (reuse dashboard pattern). If a higher-level state exists later,
// this component can be swapped to use that provider without changing its UI.
const DASHBOARD_STATE_KEY = 'dashboard:state';

function readState() {
  try { return JSON.parse(localStorage.getItem(DASHBOARD_STATE_KEY) || '{}'); }
  catch { return {}; }
}

function writeState(updater) {
  const current = readState();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(next));
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

  // initialize from storage
  useEffect(() => {
    const s = readState();
    const maint = s.maintenance || {};
    const interval = Number(maint.maintenanceIntervalDays) || 90;
    const last = maint.lastManualDate || null;
    const ev = maint.events || [
      { id: 'event1',  title: 'Treadmill Belt Lubrication',     date: '2025-10-15', assignedTo: 'Worker A', deadline: '2025-10-20', status: 'Pending' },
      { id: 'event2',  title: 'Air Filter Replacement',          date: '2025-11-05', assignedTo: 'Worker B', deadline: '2025-11-07', status: 'Scheduled' },
      { id: 'event3',  title: 'Weight Machine Inspection',       date: '2025-11-20', assignedTo: 'Worker C', deadline: '2025-11-21', status: 'Completed' },
      { id: 'event4',  title: 'Elliptical Drive Belt Check',     date: '2025-12-01', assignedTo: 'Worker D', deadline: '2025-12-03', status: 'Scheduled' },
      { id: 'event5',  title: 'HVAC System Service',             date: '2025-12-15', assignedTo: 'Worker E', deadline: '2025-12-17', status: 'Pending' },
      { id: 'event6',  title: 'Locker Room Plumbing Check',      date: '2026-01-05', assignedTo: 'Worker F', deadline: '2026-01-07', status: 'Scheduled' },
      { id: 'event7',  title: 'Emergency Exit Lighting Test',    date: '2026-01-20', assignedTo: 'Worker G', deadline: '2026-01-20', status: 'Completed' },
      { id: 'event8',  title: 'Sauna Heater Inspection',         date: '2026-02-02', assignedTo: 'Worker H', deadline: '2026-02-04', status: 'Pending' },
      { id: 'event9',  title: 'Fire Extinguisher Replacement',   date: '2026-02-15', assignedTo: 'Worker I', deadline: '2026-02-18', status: 'Scheduled' },
      { id: 'event10', title: 'Swimming Pool Chlorine Check',    date: '2026-03-01', assignedTo: 'Worker J', deadline: '2026-03-02', status: 'Pending' },
      { id: 'event_oct17_1', title: 'Squat Rack Maintenance',   date: '2025-10-17', assignedTo: 'Worker A', deadline: '2025-10-17', status: 'Pending' },
      { id: 'event_oct17_2', title: 'Rowing Machine Service',   date: '2025-10-17', assignedTo: 'Worker B', deadline: '2025-10-17', status: 'Scheduled' },
      { id: 'event_oct17_3', title: 'Bench Press Inspection',   date: '2025-10-17', assignedTo: 'Worker C', deadline: '2025-10-17', status: 'Pending' },
      { id: 'event_oct10', title: 'Daily safety inspection',    date: '2025-10-10', assignedTo: 'Angel', deadline: '2025-10-10', status: 'Pending' },
    ];
    // Seed a daily task for every day of the current month so each cell has at least one event
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const workerPool = ['Angel','Matt','Soorya','Shun','Kevin','Matias'];
    const taskPool = [
      'Sanitize benches and wipe touchpoints',
      'Inspect cable tension and pulleys',
      'Lubricate treadmill belts',
      'Tighten hardware on weight machines',
      'Calibrate machine displays',
      'Clean and realign sensor mounts',
      'Vacuum debris around moving parts'
    ];
    const dailyEvents = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1);
      const iso = toISODate(d);
      const status = 'Pending';
      const assignedTo = workerPool[i % workerPool.length];
      const title = taskPool[i % taskPool.length];
      return { id: `daily_${iso}`, title, date: iso, assignedTo, deadline: iso, status };
    });
    // Add alert pills on a few days of this week for visual variety
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()); // Sunday
    const alertOffsets = [0, 2, 4]; // Sun, Tue, Thu
    const alertEvents = alertOffsets.map((off, i) => {
      const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + off);
      return { id: `alert_${i+1}`, title: 'Machine Alert', date: toISODate(d), status: 'Alert' };
    });
    setIntervalDays(interval);
    setLastManualDate(last);
    // Normalize existing events: replace 'Daily check' titles and generic assignees
    const normalize = (list) => list.map((e, idx) => {
      const needsTitle = /^Daily\s*check/i.test(e.title || '');
      const title = needsTitle ? taskPool[idx % taskPool.length] : e.title;
      const badAssignee = !e.assignedTo || /^(ops|worker\s*#?)/i.test(String(e.assignedTo));
      const assignedTo = badAssignee ? workerPool[idx % workerPool.length] : e.assignedTo;
      return { ...e, title, assignedTo };
    });
    const combined = normalize([...(ev||[]), ...dailyEvents, ...alertEvents]);
    const unique = dedupeByDateAndTitle(combined);
    setEvents(unique);
    persist({ events: unique });
    // compute next two dates
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
              events={events}
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
            {(() => {
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
            })()}
          </div>
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


