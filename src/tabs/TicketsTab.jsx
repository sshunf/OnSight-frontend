import React, { useEffect, useMemo, useRef, useState } from 'react';
import MaintenanceCalendar from '../components/MaintenanceCalendar.jsx';

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

export default function TicketsTab() {
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [showOpenOnly, setShowOpenOnly] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', machineId: '', worker: '', deadline: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDateISO, setPickerDateISO] = useState('');
  const [pickerTime, setPickerTime] = useState('10:00 AM');
  const createModalRef = useRef(null);
  const createTitleRef = useRef(null);

  useEffect(() => {
    const s = readState();
    const list = (s.tickets || []);
    setTickets(list);
  }, []);

  // Listen for automatic ticket updates
  useEffect(() => {
    const handleTicketsUpdated = () => {
      const s = readState();
      const list = (s.tickets || []);
      setTickets(list);
    };

    window.addEventListener('ticketsUpdated', handleTicketsUpdated);
    return () => window.removeEventListener('ticketsUpdated', handleTicketsUpdated);
  }, []);

  useEffect(() => {
    if (isCreateOpen) { setTimeout(() => createTitleRef.current?.focus(), 0); }
  }, [isCreateOpen]);

  function persist(next) {
    writeState((curr) => ({ ...curr, tickets: next, updatedAt: new Date().toISOString() }));
  }

  const openCount = useMemo(() => tickets.filter(t => t.status !== 'Closed').length, [tickets]);
  const visible = useMemo(() => showOpenOnly ? tickets.filter(t => t.status !== 'Closed') : tickets, [tickets, showOpenOnly]);

  function onCreate() {
    if (!form.title) return;
    const next = [{
      id: `t_${Date.now()}`,
      title: form.title,
      machineId: form.machineId || 'N/A',
      worker: form.worker || 'Unassigned',
      result: 'created',
      notes: {},
      status: 'Open',
      deadline: form.deadline || '',
      createdAt: new Date().toISOString(),
    }, ...tickets];
    setTickets(next); persist(next); setCreateOpen(false); setForm({ title: '', machineId: '', worker: '', deadline: '' });
  }

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
        .tk-date { background:#13131a; border:1px solid #262633; color:#e5e7eb; border-radius:8px; padding:8px 10px; height:40px; display:flex; align-items:center; justify-content:space-between; }
        .nx-dd { position:relative; }
        .nx-dd-button { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; background:#13131a; color:#e5e7eb; border:1px solid #262633; border-radius:8px; padding:8px 10px; height:40px; }
        .nx-dd-menu { position:absolute; top:calc(100% + 8px); left:0; right:0; background:#111119; border:1px solid #1d1d29; border-radius:12px; box-shadow:0 10px 24px rgba(0,0,0,0.45); padding:6px; z-index:60; }
        .nx-dd-item { padding:8px 10px; border-radius:8px; cursor:pointer; color:#e5e7eb; font-size:13px; }
        .nx-dd-item[aria-selected="true"], .nx-dd-item:hover { background:rgba(124,58,237,0.18); color:#c4b5fd; }
        .nx-select { height:40px; }
        .nx-pill { height:32px; }
        .tk-picker { display:grid; grid-template-columns: 1fr 220px; gap:16px; align-items:start; }
        .tk-time-list { border-left:1px solid #1d1d29; padding-left:12px; overflow:auto; max-height:600px; }
        .tk-time-item { display:flex; align-items:center; height:40px; padding:0 10px; border-radius:8px; cursor:pointer; color:#e5e7eb; }
        .tk-time-item:hover { background: rgba(255,255,255,.06); }
        .tk-time-item.active { background: rgba(124,58,237,.18); color:#fff; }
        .tk-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding-top:12px; border-top:1px solid #1d1d29; }
        .tk-chip { background:#13131a; border:1px solid #262633; color:#e5e7eb; border-radius:10px; padding:8px 12px; }

        /* Create Ticket modal refreshed styles */
        .tk-modal { width:min(640px, 80vw) !important; max-width:640px !important; border:1px solid #1d1d29; background:#0f0f16; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.6); overflow:hidden; }
        .tk-header { display:flex; align-items:flex-start; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #1d1d29; }
        .tk-title { font-size:18px; font-weight:600; color:#e5e7eb; }
        .tk-close { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px; color:#a1a1b3; background:transparent; border:1px solid transparent; }
        .tk-close:hover { background:#181824; color:#e5e7eb; }
        .tk-close:focus { outline:2px solid rgba(124,58,237,.5); outline-offset:2px; }
        .tk-body { padding:20px 24px; }
        .tk-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width: 768px) { .tk-grid { grid-template-columns:1fr 1fr; gap:18px; } }
        .tk-field { display:flex; flex-direction:column; }
        .tk-label { color:#c7c7d2; font-size:13px; margin-bottom:6px; }
        .tk-helper { color:#8b8ba1; font-size:12px; margin-top:6px; }
        .tk-input, .tk-select { height:44px; border-radius:10px; border:1px solid #262633; background:#13131a; color:#e5e7eb; padding:0 12px; }
        .tk-input::placeholder { color:#7b7b8f; }
        .tk-input:focus, .tk-select:focus, .tk-date:focus { border-color:#9b8cfb; outline:4px solid rgba(124,58,237,.18); }
        .tk-footer-bar { position:sticky; bottom:0; display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid #1d1d29; background:#0f0f16; }
        .tk-btn { height:40px; border-radius:10px; padding:0 14px; border:1px solid #2a2a38; color:#e5e7eb; background:#161624; }
        .tk-btn:hover { background:#1b1b2b; }
        .tk-btn:focus { outline:2px solid rgba(124,58,237,.5); outline-offset:2px; }
        .tk-btn.primary { background:#7c3aed; border-color:#7c3aed; color:#fff; }
        .tk-btn.primary:hover { background:#6d28d9; }
        .tk-btn[disabled] { opacity:.45; cursor:not-allowed; }
      `}</style>

      {/* small in-house dropdown */}
      {null}
      <div className="nx-card" style={{marginBottom:16, height:'830px', display:'flex', flexDirection:'column'}}>
        <div className="nx-card-header" style={{alignItems:'center'}}>
          <div>
            <div className="nx-card-title">Tickets</div>
            <div className="nx-subtle">Open: {openCount} • Total: {tickets.length}</div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className={`nx-pill ${showOpenOnly?'primary':''}`} onClick={()=>setShowOpenOnly(!showOpenOnly)} aria-label="Toggle open tickets">
              {showOpenOnly ? 'Showing Open' : 'Showing All'}
            </button>
            <button className="nx-pill" onClick={()=>setCreateOpen(true)} aria-label="Create ticket">New Ticket</button>
          </div>
        </div>
        <div style={{overflow:'auto', borderTop:'1px solid #1c1c27', marginTop:8}}>
          {visible.length === 0 && <div className="nx-subtle">No tickets yet.</div>}
          {visible.map(t => (
            <div key={t.id} className="nx-alert-row" style={{gridTemplateColumns:'1fr auto'}}>
              <div>
                <div style={{color:'#e5e7eb', display:'flex', alignItems:'center', gap:8}}>
                  {t.title}
                  {t.autoGenerated && (
                    <span style={{fontSize:10, padding:'2px 6px', background:'rgba(124,58,237,0.2)', color:'#c4b5fd', borderRadius:4, border:'1px solid rgba(124,58,237,0.3)'}}>
                      AUTO
                    </span>
                  )}
                </div>
                <div className="nx-subtle">Machine: {t.machineId || 'N/A'} • Worker: {t.worker || 'N/A'} • {new Date(t.createdAt).toLocaleString()}</div>
                <div className="nx-subtle">Result: {t.result}</div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button className="nx-pill" onClick={()=>setActive(t)}>Details</button>
                {t.status !== 'Closed' && (
                  <button className="nx-pill primary" onClick={()=>{
                    const updated = tickets.map(x => x.id === t.id ? { ...x, status:'Closed' } : x);
                    setTickets(updated); persist(updated);
                  }}>Close</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {active && (
        <div className="nx-modal-overlay" role="dialog" aria-modal="true">
          <div className="nx-card" style={{width:'min(700px, 94vw)'}}>
            <div className="nx-card-header">
              <div className="nx-card-title">{active.title}</div>
              <button className="nx-pill" onClick={()=>setActive(null)} aria-label="Close">Close</button>
            </div>
            <div className="nx-subtle">Machine: {active.machineId}</div>
            <div className="nx-subtle">Worker: {active.worker}</div>
            <div className="nx-subtle">Result: {active.result}</div>
            <div className="nx-subtle">Created: {new Date(active.createdAt).toLocaleString()}</div>
            {active.autoGenerated && (
              <div style={{marginTop:8, padding:8, background:'rgba(124,58,237,0.1)', borderRadius:8, border:'1px solid rgba(124,58,237,0.3)'}}>
                <div className="nx-subtle" style={{fontSize:11, color:'#c4b5fd'}}>
                  <strong>Auto-generated</strong> based on usage data analysis
                </div>
              </div>
            )}
            {active.notes && (
              <div style={{marginTop:8}}>
                <div className="nx-card-title" style={{fontSize:12, color:'#a3a3b2'}}>Notes</div>
                <div className="nx-subtle">
                  {typeof active.notes === 'object' ? (
                    <div style={{display:'grid', gap:4}}>
                      {active.notes.reason && <div>Reason: {active.notes.reason}</div>}
                      {active.notes.avgMinutes !== undefined && <div>Avg Minutes: {active.notes.avgMinutes.toFixed(1)}</div>}
                      {active.notes.threshold && <div>Threshold: {active.notes.threshold}</div>}
                      {active.notes.dropPercent && <div>Drop: {active.notes.dropPercent}%</div>}
                    </div>
                  ) : JSON.stringify(active.notes)}
                </div>
              </div>
            )}
            <div className="nx-modal-actions">
              {active.status !== 'Closed' && <button className="nx-pill primary" onClick={()=>{
                const updated = tickets.map(x => x.id === active.id ? { ...x, status:'Closed' } : x);
                setTickets(updated); persist(updated); setActive(null);
              }}>Close Ticket</button>}
              <button className="nx-pill" onClick={()=>setActive(null)}>Done</button>
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
                <div className="tk-field">
                  <label className="tk-label" htmlFor="tkMachine">Machine ID</label>
                  <input id="tkMachine" className="tk-input" placeholder="e.g., TM-003" value={form.machineId} onChange={(e)=>setForm({...form, machineId:e.target.value})} />
                  <div className="tk-helper">Optional. Helps route parts and history.</div>
                </div>
                <div className="tk-field">
                  <label className="tk-label" htmlFor="tkWorker">Assign To</label>
                  <div className="tk-select" style={{padding:0}}>
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
                </div>
                <div className="tk-field">
                  <label className="tk-label" htmlFor="tkDeadline">Deadline</label>
                  {/* Keep existing datepicker trigger and functionality intact */}
                  <button id="tkDeadline" className="tk-date" onClick={()=>{ setPickerDateISO(form.deadline || todayISO()); setPickerTime('10:00 AM'); setShowDatePicker(true); }} aria-haspopup="dialog" aria-expanded={showDatePicker}>
                    <span>{form.deadline ? formatDisplay(form.deadline) : 'Select date'}</span>
                    <span style={{opacity:.8}}>▾</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="tk-footer-bar">
              <button className="tk-btn" type="button" onClick={()=>setCreateOpen(false)}>Cancel</button>
              <button className="tk-btn primary" type="button" onClick={onCreate} disabled={!form.title}>Create ticket</button>
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


