// TicketsTab.jsx
import React, { useEffect, useMemo, useState } from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

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

  useEffect(() => { fetchStatus(); }, []);

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

  return (
    <div>
      {errorMsg && (
        <div style={{ marginBottom:12, color:'#f87171', fontSize:13 }}>Error: {errorMsg}</div>
      )}

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
            <button className="nx-pill" onClick={fetchStatus}>Refresh</button>
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
        <div className="nx-modal-overlay" role="dialog" aria-modal="true">
          <div className="nx-card" style={{ width:'min(700px,94vw)' }}>
            <div className="nx-card-header">
              <div className="nx-card-title">Create Ticket</div>
              <button className="nx-pill" onClick={() => setCreateOpen(false)}>Close</button>
            </div>
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <input
                className="nx-input"
                placeholder="Title"
                value={form.title}
                onChange={e => setForm({ ...form, title:e.target.value })}
              />
              <input
                className="nx-input"
                placeholder="Machine Name"
                value={form.machineName}
                onChange={e => setForm({ ...form, machineName:e.target.value })}
              />
              <input
                className="nx-input"
                placeholder="Assign To"
                value={form.worker}
                onChange={e => setForm({ ...form, worker:e.target.value })}
              />
              <input
                className="nx-input"
                placeholder="Deadline"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline:e.target.value })}
              />
              <textarea
                className="nx-input"
                rows={5}
                placeholder="Checklist items (one per line)"
                value={form.checklistText}
                onChange={e => setForm({ ...form, checklistText:e.target.value })}
              />
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                <input
                  type="checkbox"
                  checked={form.sendEmail}
                  onChange={e => setForm({ ...form, sendEmail:e.target.checked })}
                />
                Send email (uses machine email)
              </label>
              <button
                className="nx-pill primary"
                onClick={onCreate}
                disabled={!form.title || !form.machineName}
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}