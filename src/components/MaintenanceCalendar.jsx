import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';

function pad(n) { return String(n).padStart(2, '0'); }
function toISODate(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function fromISO(iso) { const [y,m,da] = iso.split('-').map(Number); return new Date(y, m-1, da); }

export default function MaintenanceCalendar({
  manualDate,            // ISO
  nextDates = [],        // [ISO, ISO]
  onSelectDate,          // (iso) => void
  onReset,               // () => void
  events = [],           // [{id,title,date,assignedTo,deadline,status}]
  onEventClick,          // (event) => void
}) {
  const today = useMemo(()=>new Date(), []);
  const todayISO = useMemo(()=>toISODate(today), [today]);
  const [mode, setMode] = useState('month'); // 'month' | 'week'
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const gridRef = useRef(null);

  const prev = () => setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const jumpToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = useMemo(() => cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' }), [cursor]);

  const days = useMemo(() => {
    // Build 6x7 grid for the month
    const firstDow = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay(); // 0=Sun
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - firstDow);
    const out = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      out.push(d);
    }
    return out;
  }, [cursor]);

  const isSameDay = (a, bISO) => toISODate(a) === bISO;
  const next1 = nextDates[0];
  const next2 = nextDates[1];

  const onKeyDown = useCallback((e) => {
    if (!gridRef.current) return;
    const focusEl = document.activeElement;
    if (!focusEl || !focusEl.dataset?.iso) return;
    const date = fromISO(focusEl.dataset.iso);
    let delta = 0;
    if (e.key === 'ArrowLeft') delta = -1;
    else if (e.key === 'ArrowRight') delta = 1;
    else if (e.key === 'ArrowUp') delta = -7;
    else if (e.key === 'ArrowDown') delta = 7;
    else if (e.key === 'Enter' || e.key === ' ') { onSelectDate?.(focusEl.dataset.iso); e.preventDefault(); return; }
    else if (e.key === 'Escape') { gridRef.current.blur?.(); return; }
    if (delta !== 0) {
      const target = new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
      const iso = toISODate(target);
      const btn = gridRef.current.querySelector(`[data-iso="${iso}"]`);
      if (btn) { btn.focus(); e.preventDefault(); }
    }
  }, [onSelectDate]);

  return (
    <div>
      <style>{`
        .mc-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .mc-title { font-weight:700; color:#fff; }
        .mc-actions { display:flex; gap:8px; }
        .mc-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }
        .mc-dow { color:#a3a3b2; font-size:12px; text-align:center; padding:6px 0; }
        .mc-cell { background:#111119; border:1px solid #1d1d29; border-radius:10px; height:88px; padding:6px; position:relative; color:#e5e7eb; }
        .mc-btn { width:100%; height:100%; background:transparent; color:inherit; border:none; text-align:left; border-radius:8px; cursor:pointer; padding:0; }
        .mc-btn:focus { outline:2px solid rgba(124,58,237,.6); }
        .mc-num { position:absolute; top:6px; right:8px; font-size:12px; opacity:.9; }
        .mc-out { opacity:.45; }
        .mc-today { border:1px solid rgba(124,58,237,.6); }
        .mc-next { background:rgba(124,58,237,.25); box-shadow:0 0 0 1px rgba(124,58,237,.45) inset; }
        .mc-next2 { background:rgba(124,58,237,.16); box-shadow:0 0 0 1px rgba(124,58,237,.35) inset; }
        .mc-manual { box-shadow:0 0 0 2px rgba(124,58,237,.9) inset; background:rgba(124,58,237,.35); }
        .mc-legend { display:flex; gap:12px; margin-top:10px; color:#a3a3b2; font-size:12px; }
        .mc-dot { width:10px; height:10px; border-radius:999px; display:inline-block; background:#7C3AED; margin-right:6px; }
        .mc-ev { margin-top:22px; display:flex; flex-direction:column; gap:4px; }
        .mc-pill { font-size:11px; padding:3px 6px; border-radius:999px; border:1px solid rgba(124,58,237,.4); color:#fff; background:rgba(124,58,237,.18); cursor:pointer; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; }
        .mc-pill.pending { box-shadow:0 0 8px rgba(124,58,237,.8); }
        .mc-pill.scheduled { background:transparent; color:#c4b5fd; }
        .mc-pill.completed { background:rgba(255,255,255,.06); color:#cbd5e1; text-decoration:line-through; }
        .mc-pill.alert { background:#7C3AED; color:#fff; border-color:#7C3AED; }
      `}</style>
      <div className="mc-head" style={{position:'relative'}}>
        <button className="nx-pill" onClick={prev} aria-label="Previous month" style={{position:'absolute', left:0}}>&lt;</button>
        <div className="mc-title" aria-live="polite" style={{margin:'0 auto'}}>{monthLabel}</div>
        <button className="nx-pill" onClick={next} aria-label="Next month" style={{position:'absolute', right:0}}>&gt;</button>
      </div>
      <div className="mc-grid" role="grid" aria-label={`Calendar ${monthLabel}`} ref={gridRef} onKeyDown={onKeyDown}>
        {[...'SMTWTFS'].map((c,i)=>(<div key={i} className="mc-dow" role="columnheader" aria-label={new Date(2020,0,5+i).toLocaleString(undefined,{weekday:'long'})}>{c}</div>))}
        {days.map((d, idx) => {
          const iso = toISODate(d);
          const outMonth = d.getMonth() !== cursor.getMonth();
          const classes = ['mc-cell'];
          if (outMonth && mode==='month') classes.push('mc-out');
          if (iso === todayISO) classes.push('mc-today');
          if (iso === next1) classes.push('mc-next');
          if (iso === next2) classes.push('mc-next2');
          if (manualDate && iso === manualDate) classes.push('mc-manual');
          // Events for this day
          const dayISO = iso;
          const dayEvents = (events||[]).filter(e => e.date === dayISO);
          return (
            <div key={idx} className={classes.join(' ')}>
              <button className="mc-btn" data-iso={iso} onClick={()=>onSelectDate?.(iso)} aria-label={`Select ${d.toLocaleDateString()}`}>
                <span className="mc-num">{d.getDate()}</span>
              </button>
              {dayEvents.length > 0 && (
                <div className="mc-ev">
                  {dayEvents.map(ev => {
                    const kind = String(ev.status).toLowerCase();
                    const cls = `mc-pill ${kind === 'alert' ? 'alert' : kind}`;
                    return (
                      <button key={ev.id} className={cls} title={`${ev.title} — ${ev.status}`} onClick={(e)=>{ e.stopPropagation(); onEventClick?.(ev); }} aria-label={`${ev.title} on ${d.toLocaleDateString()}, status ${ev.status}`}>{ev.title}</button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {null}
    </div>
  );
}


