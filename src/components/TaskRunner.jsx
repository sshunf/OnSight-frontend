import React, { useMemo, useState } from 'react';

export default function TaskRunner({ taskId, title, steps = [], onComplete, onCancel }) {
  const normalizedSteps = useMemo(() => steps.map((s, i) => ({ id: i, title: s.title, done: !!s.done, note: s.note || '' })), [steps]);
  const [index, setIndex] = useState(0);
  const [state, setState] = useState(normalizedSteps);
  const [result, setResult] = useState(null); // 'completed_success' | 'error_spotted'

  const current = state[index];
  const canNext = current && current.done;

  function markDone() {
    setState((prev) => prev.map((s, i) => (i === index ? { ...s, done: true } : s)));
  }

  function handleNext() {
    if (!canNext) return;
    if (index < state.length - 1) setIndex(index + 1);
    else setResult('completed_success');
  }

  function handleError() {
    setResult('error_spotted');
  }

  function handleFinish() {
    const notes = state.map(({ title, done, note }) => ({ title, done, note }));
    onComplete?.(result || 'completed_success', { taskId, title, notes });
  }

  function updateNote(v) {
    setState((prev) => prev.map((s, i) => (i === index ? { ...s, note: v } : s)));
  }

  if (result) {
    return (
      <div className="nx-card">
        <div className="nx-card-header"><div className="nx-card-title">Task Complete</div></div>
        <div className="nx-subtle" style={{marginBottom:12}}>
          {result === 'completed_success' ? 'Completed successfully' : 'Error spotted'}
        </div>
        <div className="nx-modal-actions">
          <button className="nx-pill primary" onClick={handleFinish} aria-label="Finish">Finish</button>
          <button className="nx-pill" onClick={onCancel} aria-label="Close">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nx-card">
      <div className="nx-card-header"><div className="nx-card-title">{title || 'Task'}</div></div>
      <div style={{marginBottom:12}}>
        <div className="nx-subtle">Step {index + 1} of {state.length}</div>
        <div style={{marginTop:6}}>{current?.title}</div>
        <div style={{marginTop:10}}>
          <label className="nx-subtle" htmlFor="stepNote">Note (optional)</label>
          <input id="stepNote" className="nx-select" value={current?.note || ''} onChange={(e)=>updateNote(e.target.value)} aria-label="Step note" />
        </div>
      </div>
      <div className="nx-modal-actions">
        <button className="nx-pill" onClick={onCancel} aria-label="Cancel">Cancel</button>
        <button className="nx-pill" onClick={handleError} aria-label="Report error">Error spotted</button>
        <button className="nx-pill" onClick={markDone} aria-label="Mark step done">Mark step done</button>
        <button className="nx-pill primary" onClick={handleNext} disabled={!canNext} aria-label="Next">Next</button>
      </div>
    </div>
  );
}


