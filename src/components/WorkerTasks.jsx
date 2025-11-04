import React, { useEffect, useMemo, useState } from 'react';
import TaskRunner from './TaskRunner.jsx';

const DASHBOARD_STATE_KEY = 'dashboard:state';
function readState() { try { return JSON.parse(localStorage.getItem(DASHBOARD_STATE_KEY) || '{}'); } catch { return {}; } }
function writeState(updater) {
  const current = readState();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(next));
  return next;
}

export default function WorkerTasks() {
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState(null);
  const currentWorker = useMemo(() => localStorage.getItem('currentWorker') || 'Soorya', []);
  const todayISO = useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }, []);

  useEffect(() => {
    const s = readState();
    const ev = (s.maintenance && s.maintenance.events) || [];
    setEvents(ev);
  }, []);

  const myToday = useMemo(() => events.filter(e => e.assignedTo === currentWorker && e.date === todayISO), [events, currentWorker, todayISO]);

  function persistEvents(next) {
    writeState((curr) => ({ ...curr, maintenance: { ...(curr.maintenance||{}), events: next, updatedAt: new Date().toISOString() } }));
  }

  return (
    <div className="nx-card">
      <div className="nx-card-header">
        <div>
          <div className="nx-card-title">My Tasks Today</div>
          <div className="nx-subtle">{currentWorker} — {todayISO}</div>
        </div>
      </div>

      {myToday.length === 0 && <div className="nx-subtle">No tasks for today.</div>}

      {myToday.map(ev => (
        <div key={ev.id} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:8, padding:'10px 0', borderTop:'1px solid #1c1c27'}}>
          <div>
            <div style={{color:'#e5e7eb'}}>{ev.title}</div>
            <div className="nx-subtle">Machine: {ev.machineId || 'N/A'} • Deadline: {ev.deadline}</div>
          </div>
          <button className="nx-pill primary" onClick={()=>setActive(ev)} aria-label={`Start ${ev.title}`}>Start</button>
        </div>
      ))}

      {active && (
        <div className="nx-modal-overlay" role="dialog" aria-modal="true">
          <div style={{width:'min(720px, 92vw)'}}>
            <TaskRunner
              taskId={active.id}
              title={active.title}
              steps={(active.steps && active.steps.length ? active.steps : [{title:'Perform task'},{title:'Verify result'},{title:'Record notes'}])}
              onCancel={()=>setActive(null)}
              onComplete={(result, payload)=>{
                const updated = events.map(e => e.id === active.id ? { ...e, status: 'Completed', notes: payload?.notes } : e);
                setEvents(updated); persistEvents(updated); setActive(null);
                // Create ticket
                writeState((curr) => {
                  const tickets = (curr.tickets || []).slice();
                  tickets.unshift({ id: `t_${Date.now()}`, title: active.title, machineId: active.machineId, worker: currentWorker, result, notes: payload?.notes, status: 'Open', createdAt: new Date().toISOString() });
                  return { ...curr, tickets, updatedAt: new Date().toISOString() };
                });
                window.dispatchEvent(new CustomEvent('workerTaskCompleted', { detail: { id: active.id, result } }));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

