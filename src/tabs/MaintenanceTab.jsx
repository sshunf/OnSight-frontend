import React, { useEffect, useMemo, useState } from 'react';
import MaintenanceCalendar from '../components/MaintenanceCalendar.jsx';
import WorkerTasks from '../components/WorkerTasks.jsx';

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
    ];
    // Seed a daily task for every day of the current month so each cell has at least one event
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const statusCycle = ['Pending', 'Scheduled', 'Completed'];
    const dailyEvents = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1);
      const iso = toISODate(d);
      const status = statusCycle[i % statusCycle.length];
      return { id: `daily_${iso}`, title: 'Daily check', date: iso, assignedTo: 'Ops', deadline: iso, status };
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
    setEvents([...(ev||[]), ...dailyEvents, ...alertEvents]);
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
    if (lastManualDate && new Date(useISO) < new Date(lastManualDate)) {
      if (!window.confirm('Manual date is earlier than the last persisted maintenance date. Proceed?')) return;
    }
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
          <div>
            <button className="nx-pill" onClick={()=>{
              const name = window.prompt('Enter worker name for demo view', localStorage.getItem('currentWorker')||'Soorya');
              if (name != null) localStorage.setItem('currentWorker', name);
              setActiveEvent({ id: '__worker_view__' });
            }} aria-label="Open worker view">Open as Worker View</button>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'4fr 1fr', gap:16}}>
          <div>
            <MaintenanceCalendar
              manualDate={lastManualDate}
              nextDates={[next1, next2]}
              events={events}
              onEventClick={(ev)=>{ setActiveEvent(ev); setSelectedDate(ev.date); }}
              onSelectDate={(iso)=>{ setSelectedDate(iso); setManualInput(iso); onApplyWith(iso); }}
              onReset={onReset}
            />
          </div>
          <div style={{borderLeft:'1px solid #1d1d29', paddingLeft:12}}>
            <div className="nx-card-title" style={{marginBottom:8}}>Tasks — {selectedDate}</div>
            <div className="nx-subtle" style={{marginBottom:8}}>Click a day or pill to update.</div>
            <div>
              {events.filter(e=>e.date===selectedDate).length === 0 && (
                <div className="nx-subtle">No tasks for this day.</div>
              )}
              {events.filter(e=>e.date===selectedDate).map(ev => (
                <div key={ev.id} className="nx-alert-row" style={{gridTemplateColumns:'1fr auto'}}>
                  <div>
                    <div style={{color:'#e5e7eb'}}>{ev.title}</div>
                    <div className="nx-subtle">Status: {ev.status}{ev.assignedTo ? ` • Assignee: ${ev.assignedTo}` : ''}</div>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button className="nx-pill" onClick={()=>setActiveEvent(ev)}>Details</button>
                  </div>
                </div>
              ))}
            </div>
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

      {activeEvent && activeEvent.id !== '__worker_view__' && (
        <div>
          {React.createElement(require('../components/EventCard.jsx').default, {
            event: activeEvent,
            onClose: ()=>setActiveEvent(null),
            onComplete: (ev)=>{
              const updated = events.map(e=> e.id===ev.id ? { ...e, status:'Completed' } : e);
              setEvents(updated);
              persist({ events: updated });
              setActiveEvent(null);
              window.dispatchEvent(new CustomEvent('maintenanceEventUpdated', { detail: ev }));
            },
            onReassign: (ev)=>{
              const name = window.prompt('Assign to:', ev.assignedTo || '');
              if (name == null) return;
              const updated = events.map(e=> e.id===ev.id ? { ...e, assignedTo: name } : e);
              setEvents(updated);
              persist({ events: updated });
              window.dispatchEvent(new CustomEvent('maintenanceEventUpdated', { detail: ev }));
            }
          })}
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
    </div>
  );
}


