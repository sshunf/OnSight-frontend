import React, { useEffect, useMemo, useState } from 'react';
import TaskRunner from './TaskRunner.jsx';
import { EMPLOYEES, getEmployeeByName, getPositionColor, getInitials } from '../data/employees';

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
  const [currentWorker, setCurrentWorker] = useState(localStorage.getItem('currentWorker') || 'Soorya');
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
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

  // Lock body scroll when modal is open
  useEffect(() => {
    const hasModal = active || showEmployeeSelector;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [active, showEmployeeSelector]);

  const myToday = useMemo(() => events.filter(e => e.assignedTo === currentWorker && e.date === todayISO && e.status !== 'Completed'), [events, currentWorker, todayISO]);
  const myUpcoming = useMemo(() => events.filter(e => e.assignedTo === currentWorker && e.date > todayISO && e.status !== 'Completed').sort((a, b) => a.date.localeCompare(b.date)), [events, currentWorker, todayISO]);
  const myOverdue = useMemo(() => events.filter(e => e.assignedTo === currentWorker && e.date < todayISO && e.status !== 'Completed').sort((a, b) => b.date.localeCompare(a.date)), [events, currentWorker, todayISO]);
  const currentEmployeeData = getEmployeeByName(currentWorker);

  function persistEvents(next) {
    writeState((curr) => ({ ...curr, maintenance: { ...(curr.maintenance||{}), events: next, updatedAt: new Date().toISOString() } }));
  }

  const handleWorkerChange = (workerName) => {
    setCurrentWorker(workerName);
    localStorage.setItem('currentWorker', workerName);
    setShowEmployeeSelector(false);
  };

  const totalTasks = myToday.length + myUpcoming.length + myOverdue.length;

  return (
    <>
      <style>{`
        .worker-selector-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(124, 58, 237, 0.12);
          border: 1px solid rgba(124, 58, 237, 0.25);
          border-radius: 8px;
          color: #c4b5fd;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .worker-selector-btn:hover {
          background: rgba(124, 58, 237, 0.2);
          border-color: rgba(124, 58, 237, 0.4);
        }
        .worker-avatar-small {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          color: #ffffff;
        }
        .task-section {
          margin-bottom: 20px;
        }
        .task-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .task-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #c4b5fd;
        }
        .overdue-badge {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }
      `}</style>
      <div className="nx-card">
        <div className="nx-card-header" style={{alignItems: 'center'}}>
          <div style={{flex: 1}}>
            <div className="nx-card-title">Worker Tasks</div>
            <div className="nx-subtle">
              {currentEmployeeData ? `${currentEmployeeData.position} • ${totalTasks} total tasks` : `${totalTasks} total tasks`}
            </div>
          </div>
          <button 
            className="worker-selector-btn"
            onClick={() => setShowEmployeeSelector(true)}
          >
            <div className="worker-avatar-small" style={{
              background: currentEmployeeData ? `linear-gradient(135deg, ${getPositionColor(currentEmployeeData.position)} 0%, ${getPositionColor(currentEmployeeData.position)}dd 100%)` : undefined
            }}>
              {getInitials(currentWorker)}
            </div>
            {currentWorker}
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>

        {/* Overdue Tasks */}
        {myOverdue.length > 0 && (
          <div className="task-section">
            <div className="task-section-title">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{color: '#ef4444'}}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
              </svg>
              Overdue
              <span className="task-count-badge overdue-badge">{myOverdue.length}</span>
            </div>
            {myOverdue.map(ev => (
              <div key={ev.id} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:8, padding:'10px 0', borderTop:'1px solid #1c1c27'}}>
                <div>
                  <div style={{color:'#fca5a5', fontWeight: 500}}>{ev.title}</div>
                  <div className="nx-subtle">Due: {ev.deadline} • {ev.date}</div>
                </div>
                <button className="nx-pill primary" onClick={()=>setActive(ev)} aria-label={`Start ${ev.title}`}>Start</button>
              </div>
            ))}
          </div>
        )}

        {/* Today's Tasks */}
        <div className="task-section">
          <div className="task-section-title">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{color: '#7c3aed'}}>
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
            </svg>
            Today
            <span className="task-count-badge">{myToday.length}</span>
          </div>
          {myToday.length === 0 ? (
            <div className="nx-subtle">No tasks for today.</div>
          ) : (
            myToday.map(ev => (
              <div key={ev.id} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:8, padding:'10px 0', borderTop:'1px solid #1c1c27'}}>
                <div>
                  <div style={{color:'#e5e7eb'}}>{ev.title}</div>
                  <div className="nx-subtle">Deadline: {ev.deadline}</div>
                </div>
                <button className="nx-pill primary" onClick={()=>setActive(ev)} aria-label={`Start ${ev.title}`}>Start</button>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Tasks */}
        {myUpcoming.length > 0 && (
          <div className="task-section">
            <div className="task-section-title">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{color: '#3b82f6'}}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
              </svg>
              Upcoming
              <span className="task-count-badge" style={{background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd'}}>{myUpcoming.length}</span>
            </div>
            {myUpcoming.map(ev => (
              <div key={ev.id} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:8, padding:'10px 0', borderTop:'1px solid #1c1c27'}}>
                <div>
                  <div style={{color:'#e5e7eb'}}>{ev.title}</div>
                  <div className="nx-subtle">Due: {ev.deadline} • {ev.date}</div>
                </div>
                <button className="nx-pill" onClick={()=>setActive(ev)} aria-label={`Start ${ev.title}`}>View</button>
              </div>
            ))}
          </div>
        )}

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

      {/* Employee Selector Modal */}
      {showEmployeeSelector && (
        <div className="nx-modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowEmployeeSelector(false)}>
          <div className="nx-card" style={{width: 'min(600px, 94vw)', maxHeight: '80vh', display: 'flex', flexDirection: 'column'}} onClick={(e) => e.stopPropagation()}>
            <div className="nx-card-header">
              <div className="nx-card-title">Select Worker</div>
              <button className="nx-pill" onClick={() => setShowEmployeeSelector(false)}>Close</button>
            </div>
            <div style={{flex: 1, overflow: 'auto', padding: '16px 0'}}>
              {EMPLOYEES.map(emp => {
                const isActive = emp.name === currentWorker;
                const positionColor = getPositionColor(emp.position);
                return (
                  <div
                    key={emp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
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
                    onClick={() => handleWorkerChange(emp.name)}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${positionColor} 0%, ${positionColor}dd 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {getInitials(emp.name)}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '4px'}}>
                        {emp.name}
                        {isActive && <span style={{marginLeft: '8px', fontSize: '12px', color: '#c4b5fd'}}>(Current)</span>}
                      </div>
                      <div style={{fontSize: '12px', color: '#94a3b8'}}>{emp.position}</div>
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
    </>
  );
}

