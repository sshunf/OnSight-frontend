import React, { useMemo, useRef, useState, useEffect } from 'react';

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onOutside?.();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'reports'
  const [alerts, setAlerts] = useState(() => ([
    { id: 'a1', title: 'Machine Issue Detected', machineId: 'Treadmill #1', description: 'Usage drop vs baseline detected', resolved: false, type: 'anomaly' },
    { id: 'a2', title: 'Sensor Offline', machineId: 'Bike #1', description: 'Last heartbeat > 20 min', resolved: false, type: 'sensor' },
    { id: 'a3', title: 'Maintenance Due Soon', machineId: 'Bench Press #1', description: 'Preventive window approaching', resolved: true, type: 'maintenance' },
  ]));
  const [reports] = useState(() => ([
    { id: 'r1', date: 'Today', totalUsageMin: 9257, peak: '5-7 PM', topMachine: 'Treadmill #1', idleCount: 2 },
    { id: 'r2', date: 'Yesterday', totalUsageMin: 8811, peak: '6-8 PM', topMachine: 'Bike #1', idleCount: 3 },
  ]));

  const unreadCount = useMemo(() => alerts.filter(a => !a.resolved).length + reports.length, [alerts, reports]);
  const hasAlert = unreadCount > 0;

  const wrapRef = useRef(null);
  useClickOutside(wrapRef, () => setOpen(false));

  // Maintenance form state
  const [formOpen, setFormOpen] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [formState, setFormState] = useState({ checked: undefined, broken: undefined, issues: new Set(), notes: '', contact: '' });
  const [activeAlert, setActiveAlert] = useState(null);

  function openForm(alert) {
    setActiveAlert(alert);
    setFormOpen(true);
    setFormStep(0);
    setFormState({ checked: undefined, broken: undefined, issues: new Set(), notes: '', contact: '' });
  }

  function toggleResolved(id) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: !a.resolved } : a));
  }

  function toggleIssue(key) {
    setFormState(s => {
      const next = new Set(s.issues);
      if (next.has(key)) next.delete(key); else next.add(key);
      return { ...s, issues: next };
    });
  }

  return (
    <div className="nb-wrap" ref={wrapRef}>
      <style>{`
        .nb-wrap { position: relative; }
        .nb-btn { position: relative; background:transparent; border:none; color:#e5e7eb; padding:0; cursor:pointer; display:flex; align-items:center; gap:8px; }
        .nb-dot { width:8px; height:8px; border-radius:999px; background:#ef4444; display:inline-block; }
        .nb-menu { position:absolute; right:0; top: calc(100% + 8px); width: 360px; background:#0f0f15; border:1px solid #1d1d29; border-radius:14px; box-shadow:0 20px 50px rgba(0,0,0,.45); overflow:hidden; z-index:60; }
        .nb-tabs { display:flex; border-bottom:1px solid #1d1d29; }
        .nb-tab { flex:1; padding:10px 12px; text-align:center; color:#a3a3b2; cursor:pointer; }
        .nb-tab.active { color:#fff; background:rgba(124,58,237,0.12); }
        .nb-list { max-height: 320px; overflow:auto; }
        .nb-item { padding:12px; border-bottom:1px solid #161622; display:grid; grid-template-columns:1fr auto; gap:8px; }
        .nb-title { font-weight:600; color:#e5e7eb; font-size:14px; }
        .nb-meta { font-size:12px; color:#9ca3af; }
        .nb-actions { display:flex; gap:8px; }
        .nb-chip { font-size:11px; border:1px solid #262633; padding:4px 8px; border-radius:999px; color:#cbd5e1; background:#13131a; cursor:pointer; }
        .nb-chip.primary { background:#7C3AED; border-color:#7C3AED; color:#fff; }
        /* Form */
        .nb-form { border-top:1px solid #1d1d29; padding:12px; background:#0b0b0f; }
        .nb-q { color:#e5e7eb; font-weight:600; margin-bottom:8px; }
        .nb-row { display:flex; gap:8px; flex-wrap:wrap; }
        .nb-radio, .nb-checkbox { background:#13131a; border:1px solid #262633; color:#e5e7eb; padding:8px 10px; border-radius:10px; cursor:pointer; }
        .nb-checkbox.active { outline:2px solid rgba(124,58,237,0.45); }
        .nb-text { width:100%; background:#13131a; border:1px solid #262633; color:#e5e7eb; padding:8px 10px; border-radius:10px; margin-top:8px; }
        .nb-form-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
      `}</style>
      <button className="nb-btn" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}>
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5"/>
          <path d="M9 17a3 3 0 0 0 6 0"/>
        </svg>
        {hasAlert && <span className="nb-dot" aria-label="alerts present" />}
      </button>
      {open && (
        <div className="nb-menu" role="menu">
          <div className="nb-tabs">
            <div className={`nb-tab ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>Alerts</div>
            <div className={`nb-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Daily Reports</div>
          </div>
          {activeTab === 'alerts' ? (
            <div className="nb-list">
              {alerts.map(alert => (
                <div key={alert.id} className="nb-item">
                  <div>
                    <div className="nb-title">{alert.title}</div>
                    <div className="nb-meta">{alert.machineId} • {alert.description}</div>
                  </div>
                  <div className="nb-actions">
                    <button className="nb-chip" onClick={() => toggleResolved(alert.id)}>{alert.resolved ? 'Mark Unresolved' : 'Mark Resolved'}</button>
                    <button className="nb-chip primary" onClick={() => openForm(alert)}>Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="nb-list">
              {reports.map(rep => (
                <div key={rep.id} className="nb-item">
                  <div>
                    <div className="nb-title">Daily Usage Report — {rep.date}</div>
                    <div className="nb-meta">Total {Math.round(rep.totalUsageMin/60)} hrs • Peak {rep.peak} • Top {rep.topMachine} • Idle {rep.idleCount}</div>
                  </div>
                  <div className="nb-actions">
                    <button className="nb-chip">Open</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {formOpen && (
            <div className="nb-form" role="dialog" aria-modal="false">
              {formStep === 0 && (
                <div>
                  <div className="nb-q">Did you check {activeAlert?.machineId}? </div>
                  <div className="nb-row">
                    <button className="nb-radio" onClick={() => { setFormState(s=>({ ...s, checked: true })); setFormStep(1); }}>Yes</button>
                    <button className="nb-radio" onClick={() => { setFormState(s=>({ ...s, checked: false })); setFormStep(99); }}>No</button>
                  </div>
                </div>
              )}

              {formStep === 1 && (
                <div>
                  <div className="nb-q">Is it broken?</div>
                  <div className="nb-row">
                    <button className="nb-radio" onClick={() => { setFormState(s=>({ ...s, broken: true })); setFormStep(2); }}>Yes</button>
                    <button className="nb-radio" onClick={() => { setFormState(s=>({ ...s, broken: false })); setFormStep(5); }}>No</button>
                  </div>
                </div>
              )}

              {formStep === 99 && (
                <div>
                  <div className="nb-q">Please check {activeAlert?.machineId} when you can.</div>
                  <div className="nb-row">
                    <button className="nb-radio" onClick={() => setFormOpen(false)}>Dismiss</button>
                    <button className="nb-radio" onClick={() => setFormOpen(false)}>Snooze</button>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div>
                  <div className="nb-q">What’s broken?</div>
                  <div className="nb-row">
                    {['Power','Mechanical','Electronic','Sensor','Other'].map(opt => (
                      <button key={opt} className={`nb-checkbox ${formState.issues.has(opt) ? 'active' : ''}`} onClick={() => toggleIssue(opt)}>{opt}</button>
                    ))}
                  </div>
                  <textarea className="nb-text" rows={3} placeholder="Notes (optional)" value={formState.notes} onChange={(e)=>setFormState(s=>({ ...s, notes: e.target.value }))} />
                  <div className="nb-form-actions">
                    <button className="nb-chip" onClick={()=>setFormStep(1)}>Back</button>
                    <button className="nb-chip primary" onClick={()=>setFormStep(3)}>Next</button>
                  </div>
                </div>
              )}

              {formStep === 5 && (
                <div>
                  <div className="nb-q">Great. We’ll keep monitoring {activeAlert?.machineId}.</div>
                  <div className="nb-form-actions">
                    <button className="nb-chip primary" onClick={()=>setFormOpen(false)}>Close</button>
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div>
                  <div className="nb-q">Contact maintenance?</div>
                  <select className="nb-text" value={formState.contact} onChange={(e)=>setFormState(s=>({ ...s, contact: e.target.value }))}>
                    <option value="">Select contact…</option>
                    <option>Front Desk</option>
                    <option>Facilities</option>
                    <option>Vendor: ACME Fitness</option>
                  </select>
                  <div className="nb-form-actions">
                    <button className="nb-chip" onClick={()=>setFormStep(2)}>Back</button>
                    <button className="nb-chip primary" onClick={()=>setFormOpen(false)}>Submit</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


