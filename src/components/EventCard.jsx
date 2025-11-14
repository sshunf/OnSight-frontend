import React, { useEffect, useRef, useState } from 'react';
import { getMaintenanceInstructions, getDifficultyColor } from '../data/maintenanceInstructions';

export default function EventCard({ event, onClose, onComplete, onReassign }) {
  const dialogRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const instructions = getMaintenanceInstructions(event?.title);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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

  const difficultyColor = getDifficultyColor(instructions.difficulty);

  return (
    <div className="nx-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <style>{`
        .nx-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .maint-modal {
          width: min(920px, 96vw);
          max-height: 90vh;
          background: #0f0f16;
          border: 1px solid #1d1d29;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .maint-header {
          padding: 24px;
          border-bottom: 1px solid #1d1d29;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(124, 58, 237, 0.02) 100%);
        }
        .maint-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }
        .maint-title {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
        }
        .maint-close {
          background: transparent;
          border: 1px solid #262633;
          color: #e5e7eb;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .maint-close svg {
          flex-shrink: 0;
        }
        .maint-close:hover {
          background: #13131a;
          border-color: #7c3aed;
        }
        .maint-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .maint-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e5e7eb;
        }
        .maint-badge.difficulty {
          background: ${difficultyColor}22;
          border-color: ${difficultyColor}44;
          color: ${difficultyColor};
        }
        .maint-badge-icon {
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .maint-tabs {
          display: flex;
          gap: 4px;
          padding: 0 24px;
          background: #13131a;
          border-bottom: 1px solid #1d1d29;
        }
        .maint-tab {
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
        }
        .maint-tab svg {
          transition: all 0.2s;
        }
        .maint-tab:hover {
          color: #e5e7eb;
          background: rgba(255,255,255,0.03);
        }
        .maint-tab.active {
          color: #c4b5fd;
          border-bottom-color: #7c3aed;
        }
        .maint-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .maint-section {
          margin-bottom: 32px;
        }
        .maint-section:last-child {
          margin-bottom: 0;
        }
        .maint-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .maint-section-icon {
          width: 20px;
          height: 20px;
          color: #7c3aed;
        }
        .maint-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }
        .maint-info-card {
          background: #13131a;
          border: 1px solid #1d1d29;
          border-radius: 10px;
          padding: 12px;
        }
        .maint-info-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .maint-info-value {
          font-size: 14px;
          color: #e5e7eb;
          font-weight: 500;
        }
        .maint-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .maint-list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          background: #13131a;
          border: 1px solid #1d1d29;
          border-radius: 8px;
          font-size: 14px;
          color: #e5e7eb;
        }
        .maint-list-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7c3aed;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .safety-warning {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-left: 4px solid #ef4444;
          color: #fca5a5;
        }
        .safety-warning .maint-list-bullet {
          background: #ef4444;
        }
        .maint-step {
          background: #13131a;
          border: 1px solid #1d1d29;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
        }
        .maint-step::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%);
        }
        .maint-step-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .maint-step-number {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid rgba(124, 58, 237, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: #c4b5fd;
          flex-shrink: 0;
        }
        .maint-step-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }
        .maint-step-desc {
          font-size: 14px;
          line-height: 1.6;
          color: #d1d5db;
          margin-bottom: 8px;
          margin-left: 44px;
        }
        .maint-step-note {
          margin-left: 44px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 8px;
        }
        .maint-step-note.warning {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }
        .maint-step-note.tip {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #93c5fd;
        }
        .maint-note-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .maint-troubleshoot {
          background: #13131a;
          border: 1px solid #1d1d29;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
        }
        .maint-ts-issue {
          font-weight: 600;
          color: #f59e0b;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .maint-ts-solution {
          color: #d1d5db;
          font-size: 13px;
          line-height: 1.5;
        }
        .maint-reference {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: 8px;
          color: #c4b5fd;
          font-size: 13px;
          margin-bottom: 8px;
          text-decoration: none;
        }
        .maint-reference:hover {
          background: rgba(124, 58, 237, 0.15);
        }
        .maint-footer {
          padding: 16px 24px;
          border-top: 1px solid #1d1d29;
          background: #0a0a0f;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }
        .maint-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid #262633;
          background: #13131a;
          color: #e5e7eb;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .maint-btn svg {
          flex-shrink: 0;
        }
        .maint-btn:hover {
          background: #1a1a24;
          border-color: #7c3aed;
        }
        .maint-btn.primary {
          background: #7c3aed;
          border-color: #7c3aed;
          color: #ffffff;
        }
        .maint-btn.primary:hover {
          background: #6d28d9;
        }
        .maint-btn.success {
          background: #22c55e;
          border-color: #22c55e;
          color: #ffffff;
        }
        .maint-btn.success:hover {
          background: #16a34a;
        }
        .maint-empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }
        .maint-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .maint-grid-2 {
            grid-template-columns: 1fr;
          }
          .maint-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="maint-modal" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="maint-header">
          <div className="maint-title-row">
            <div>
              <div className="maint-title">{event.title}</div>
              <div className="maint-meta">
                <span className="maint-badge">
                  <svg className="maint-badge-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                  </svg>
                  {instructions.equipment}
                </span>
                <span className="maint-badge difficulty">
                  <svg className="maint-badge-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
                  </svg>
                  {instructions.difficulty}
                </span>
                <span className="maint-badge">
                  <svg className="maint-badge-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                  </svg>
                  {instructions.timeRequired}
                </span>
                <span className="maint-badge">
                  <svg className="maint-badge-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                  </svg>
                  {instructions.frequency}
                </span>
              </div>
            </div>
            <button className="maint-close" onClick={onClose} aria-label="Close">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'middle'}}>
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
              Close
            </button>
          </div>
          <div className="maint-info-grid">
            <div className="maint-info-card">
              <div className="maint-info-label">Assigned To</div>
              <div className="maint-info-value">{event.assignedTo || 'Unassigned'}</div>
            </div>
            <div className="maint-info-card">
              <div className="maint-info-label">Deadline</div>
              <div className="maint-info-value">{event.deadline}</div>
            </div>
            <div className="maint-info-card">
              <div className="maint-info-label">Status</div>
              <div className="maint-info-value">{event.status}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="maint-tabs">
          <button 
            className={`maint-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'middle'}}>
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            Overview
          </button>
          <button 
            className={`maint-tab ${activeTab === 'instructions' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructions')}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'middle'}}>
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"/>
            </svg>
            Instructions
          </button>
          <button 
            className={`maint-tab ${activeTab === 'troubleshooting' ? 'active' : ''}`}
            onClick={() => setActiveTab('troubleshooting')}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'middle'}}>
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
            </svg>
            Troubleshooting
          </button>
        </div>

        {/* Body Content */}
        <div className="maint-body">
          {activeTab === 'overview' && (
            <>
              {/* Safety Warnings */}
              {instructions.safety && instructions.safety.length > 0 && (
                <div className="maint-section">
                  <div className="maint-section-title">
                    <svg className="maint-section-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                    </svg>
                    Safety Warnings
                  </div>
                  <div className="maint-list">
                    {instructions.safety.map((warning, idx) => (
                      <div key={idx} className="maint-list-item safety-warning">
                        <div className="maint-list-bullet"></div>
                        <div>{warning}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools Required */}
              {instructions.tools && instructions.tools.length > 0 && (
                <div className="maint-section">
                  <div className="maint-section-title">
                    <svg className="maint-section-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
                    </svg>
                    Tools Required
                  </div>
                  <div className="maint-list">
                    {instructions.tools.map((tool, idx) => (
                      <div key={idx} className="maint-list-item">
                        <div className="maint-list-bullet"></div>
                        <div>{tool}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {instructions.references && instructions.references.length > 0 && (
                <div className="maint-section">
                  <div className="maint-section-title">
                    <svg className="maint-section-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                    </svg>
                    References & Resources
                  </div>
                  {instructions.references.map((ref, idx) => (
                    <div key={idx} className="maint-reference">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"/>
                      </svg>
                      {ref}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'instructions' && (
            <div className="maint-section">
              <div className="maint-section-title">
                <svg className="maint-section-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"/>
                </svg>
                Step-by-Step Instructions
              </div>
              {instructions.steps && instructions.steps.length > 0 ? (
                instructions.steps.map((step, idx) => (
                  <div key={idx} className="maint-step">
                    <div className="maint-step-header">
                      <div className="maint-step-number">{step.number}</div>
                      <div className="maint-step-title">{step.title}</div>
                    </div>
                    <div className="maint-step-desc">{step.description}</div>
                    {step.warning && (
                      <div className="maint-step-note warning">
                        <svg className="maint-note-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                        </svg>
                        <div><strong>Warning:</strong> {step.warning}</div>
                      </div>
                    )}
                    {step.tip && (
                      <div className="maint-step-note tip">
                        <svg className="maint-note-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                        </svg>
                        <div><strong>Tip:</strong> {step.tip}</div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="maint-empty-state">
                  <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20" style={{marginBottom: '12px', opacity: 0.5}}>
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"/>
                  </svg>
                  <div style={{fontSize: '16px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px'}}>
                    No detailed instructions available
                  </div>
                  <div style={{fontSize: '14px', color: '#6b7280'}}>
                    Consult equipment manual or contact maintenance supervisor
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'troubleshooting' && (
            <div className="maint-section">
              <div className="maint-section-title">
                <svg className="maint-section-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                </svg>
                Common Issues & Solutions
              </div>
              {instructions.troubleshooting && instructions.troubleshooting.length > 0 ? (
                instructions.troubleshooting.map((item, idx) => (
                  <div key={idx} className="maint-troubleshoot">
                    <div className="maint-ts-issue">
                      <svg style={{width: '16px', height: '16px', display: 'inline', marginRight: '6px'}} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                      </svg>
                      Issue: {item.issue}
                    </div>
                    <div className="maint-ts-solution">
                      <svg style={{width: '14px', height: '14px', display: 'inline', marginRight: '6px', color: '#22c55e'}} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                      <strong>Solution:</strong> {item.solution}
                    </div>
                  </div>
                ))
              ) : (
                <div className="maint-empty-state">
                  <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20" style={{marginBottom: '12px', opacity: 0.5, color: '#22c55e'}}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                  <div style={{fontSize: '16px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px'}}>
                    No common issues documented
                  </div>
                  <div style={{fontSize: '14px', color: '#6b7280'}}>
                    If you encounter problems, contact maintenance supervisor
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="maint-footer">
          {onReassign && (
            <button 
              className="maint-btn" 
              onClick={() => onReassign?.(event)} 
              aria-label="Reassign worker"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'middle'}}>
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              Reassign
            </button>
          )}
          <div style={{display: 'flex', gap: '8px', marginLeft: 'auto'}}>
            <button 
              className="maint-btn success" 
              onClick={()=>onComplete?.(event)} 
              aria-label="Mark event completed"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'middle'}}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              Mark Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
