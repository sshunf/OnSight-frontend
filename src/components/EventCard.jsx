import React, { useEffect, useRef } from 'react';

export default function EventCard({ event, onClose, onComplete, onReassign }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const trap = (e) => {
      if (!dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [onClose]);

  if (!event) return null;
  return (
    <div className="nx-modal-overlay" role="dialog" aria-modal="true">
      <div className="nx-card" ref={dialogRef} style={{width: 'min(560px, 94vw)'}}>
        <div className="nx-card-header" style={{alignItems:'center'}}>
          <div className="nx-card-title" aria-live="polite">{event.title}</div>
          <button className="nx-pill" onClick={onClose} aria-label="Close">Close</button>
        </div>
        <div style={{display:'grid', gap:10}}>
          <div className="nx-subtle"><strong>Deadline:</strong> {event.deadline}</div>
          <div className="nx-subtle"><strong>Assigned To:</strong> {event.assignedTo || 'Unassigned'}</div>
          <div className="nx-subtle"><strong>Status:</strong> {event.status}</div>
        </div>
        <div className="nx-modal-actions">
          <button className="nx-pill primary" onClick={()=>onComplete?.(event)} aria-label="Mark event completed">Mark Completed</button>
          <button className="nx-pill" onClick={()=>onReassign?.(event)} aria-label="Reassign worker">Reassign Worker</button>
        </div>
      </div>
    </div>
  );
}


