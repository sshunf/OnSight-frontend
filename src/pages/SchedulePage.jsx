import React, { useEffect, useState } from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

export default function SchedulePage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('t') || '';
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [slots, setSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successAt, setSuccessAt] = useState(null);

  const buildDisplayDate = (slot) => {
    const dateIso = slot.dateIso;
    const hour = Number.isFinite(slot.hour) ? slot.hour : 0;
    if (dateIso) {
      const [y, m, d] = dateIso.split('-').map(Number);
      return new Date(y, m - 1, d, hour, 0, 0, 0);
    }
    const base = new Date(slot.startIso || slot.start);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour || base.getHours(), 0, 0, 0);
  };

  useEffect(() => {
    const load = async () => {
      if (!backendURL || !token) {
        setError('Invalid or missing link.');
        setStatus('error');
        return;
      }
      try {
        const res = await fetch(`${backendURL}/api/maintenance/schedule/verify?t=${encodeURIComponent(token)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError(err.error || 'Link invalid or expired.');
          setStatus('error');
          return;
        }
        const data = await res.json();
        setTicket(data);
        setSlots((data.availability || []).map(s => {
          const start = new Date(s.start);
          const hourVal = Number(s.hour);
          const hour = Number.isFinite(hourVal) ? hourVal : start.getHours();
          return {
            ...s,
            startIso: s.start,
            endIso: s.end,
            hour,
            dateIso: s.date || null
          };
        }));
        setStatus('ready');
      } catch (e) {
        setError(e.message || 'Failed to load link.');
        setStatus('error');
      }
    };
    load();
  }, [token]);

  const onSelect = async (slot) => {
    if (!backendURL || !token || submitting) return;
    const display = buildDisplayDate(slot);
    const dateLabel = display.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const timeLabel = display.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const confirmed = window.confirm(`You are scheduling ${dateLabel} at ${timeLabel}. Confirm?`);
    if (!confirmed) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${backendURL}/api/maintenance/schedule/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          start: slot.startIso || slot.start,
          date: slot.dateIso,
          hour: slot.hour
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to schedule');
      }
      const data = await res.json();
      setSuccessAt(new Date(data.scheduledAt));
      setStatus('done');
    } catch (e) {
      setError(e.message || 'Failed to schedule');
      setStatus('ready');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return <PageShell><p>Loading...</p></PageShell>;
  if (status === 'error') return <PageShell><p style={{ color: '#fca5a5' }}>{error || 'Link invalid'}</p></PageShell>;
  if (status === 'done') {
    return (
      <PageShell>
        <h2>Maintenance scheduled</h2>
        <p>Thank you! Your appointment is set for {successAt?.toLocaleString() || 'selected time'}.</p>
        <p>This link has been used.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h2>Choose a time</h2>
      <p>Machine: <strong>{ticket?.machineName || 'Equipment'}</strong></p>
      <p>{ticket?.description}</p>
      {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
      {slots.length === 0 ? (
        <p>No availability has been published yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', marginTop: '16px' }}>
          {slots
            .map((slot) => ({ slot, displayDate: buildDisplayDate(slot) }))
            .sort((a, b) => a.displayDate - b.displayDate)
            .map(({ slot, displayDate }, idx) => {
              const dateLabel = displayDate.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
              const timeLabel = displayDate.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
              return (
                <button
                  key={idx}
                  onClick={() => onSelect(slot)}
                  disabled={submitting}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #2a2a38',
                    background: '#111119',
                    color: '#e5e7eb',
                    cursor: 'pointer'
                  }}
                >
                  {dateLabel} · {timeLabel}
                </button>
              );
            })}
        </div>
      )}
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050507', color: '#e5e7eb' }}>
      <div style={{ width: 'min(720px, 90vw)', padding: '32px', borderRadius: '16px', background: '#0f0f16', border: '1px solid #1d1d29', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
        {children}
      </div>
    </div>
  );
}
