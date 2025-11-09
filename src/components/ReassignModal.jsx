import React, { useState, useRef, useEffect } from 'react';
import { EMPLOYEES, POSITION_TYPES, getAllPositions, getEmployeesByPosition, getPositionColor, getInitials } from '../data/employees';

export default function ReassignModal({ currentAssignee, onReassign, onClose }) {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const modalRef = useRef(null);

  // Filter employees based on position and search term
  const filteredEmployees = EMPLOYEES.filter(emp => {
    const matchesPosition = !selectedPosition || emp.position === selectedPosition;
    const matchesSearch = !searchTerm || 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPosition && matchesSearch;
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Focus trap
  useEffect(() => {
    const trap = (e) => {
      if (!modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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

  const handleConfirm = () => {
    if (selectedEmployee) {
      onReassign(selectedEmployee.name);
    }
  };

  return (
    <div className="reassign-overlay" onClick={onClose}>
      <style>{`
        .reassign-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 90;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .reassign-modal {
          width: min(720px, 94vw);
          max-height: 85vh;
          background: #0f0f16;
          border: 1px solid #1d1d29;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .reassign-header {
          padding: 20px 24px;
          border-bottom: 1px solid #1d1d29;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(124, 58, 237, 0.02) 100%);
        }
        .reassign-title {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }
        .reassign-subtitle {
          font-size: 13px;
          color: #94a3b8;
        }
        .reassign-current {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: 6px;
          color: #c4b5fd;
          font-weight: 500;
        }
        .reassign-filters {
          padding: 16px 24px;
          background: #13131a;
          border-bottom: 1px solid #1d1d29;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .reassign-search {
          flex: 1;
          min-width: 200px;
          height: 40px;
          padding: 0 12px;
          background: #0f0f16;
          border: 1px solid #262633;
          border-radius: 8px;
          color: #e5e7eb;
          font-size: 14px;
        }
        .reassign-search:focus {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }
        .reassign-search::placeholder {
          color: #6b7280;
        }
        .reassign-filter-btn {
          padding: 8px 14px;
          background: #0f0f16;
          border: 1px solid #262633;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .reassign-filter-btn:hover {
          background: #13131a;
          border-color: #7c3aed;
          color: #e5e7eb;
        }
        .reassign-filter-btn.active {
          background: rgba(124, 58, 237, 0.15);
          border-color: #7c3aed;
          color: #c4b5fd;
        }
        .reassign-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
        }
        .reassign-count {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 12px;
        }
        .reassign-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 12px;
        }
        .employee-card {
          background: #13131a;
          border: 1px solid #1d1d29;
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .employee-card:hover {
          background: #181824;
          border-color: #7c3aed;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
        }
        .employee-card.selected {
          background: rgba(124, 58, 237, 0.12);
          border-color: #7c3aed;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
        }
        .employee-card.current-assignee {
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.25);
        }
        .employee-avatar {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: #ffffff;
          flex-shrink: 0;
        }
        .employee-info {
          flex: 1;
          min-width: 0;
        }
        .employee-name {
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .employee-position {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .employee-certs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .cert-badge {
          font-size: 10px;
          padding: 2px 6px;
          background: rgba(124, 58, 237, 0.12);
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: 4px;
          color: #c4b5fd;
          white-space: nowrap;
        }
        .employee-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #262633;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .employee-card.selected .employee-check {
          background: #7c3aed;
          border-color: #7c3aed;
        }
        .reassign-footer {
          padding: 16px 24px;
          border-top: 1px solid #1d1d29;
          background: #0a0a0f;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .reassign-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid #262633;
          background: #13131a;
          color: #e5e7eb;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .reassign-btn:hover {
          background: #1a1a24;
          border-color: #7c3aed;
        }
        .reassign-btn.primary {
          background: #7c3aed;
          border-color: #7c3aed;
          color: #ffffff;
        }
        .reassign-btn.primary:hover {
          background: #6d28d9;
        }
        .reassign-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .reassign-btn:disabled:hover {
          background: #13131a;
          border-color: #262633;
        }
        .reassign-empty {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }
        @media (max-width: 768px) {
          .reassign-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="reassign-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="reassign-header">
          <div className="reassign-title">Reassign Task</div>
          <div className="reassign-subtitle">
            Currently assigned to: <span className="reassign-current">{currentAssignee || 'Unassigned'}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="reassign-filters">
          <input
            type="text"
            className="reassign-search"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`reassign-filter-btn ${!selectedPosition ? 'active' : ''}`}
            onClick={() => setSelectedPosition('')}
          >
            All Positions
          </button>
          {Object.values(POSITION_TYPES).map(position => (
            <button
              key={position}
              className={`reassign-filter-btn ${selectedPosition === position ? 'active' : ''}`}
              onClick={() => setSelectedPosition(position)}
            >
              {position}
            </button>
          ))}
        </div>

        {/* Employee List */}
        <div className="reassign-body">
          <div className="reassign-count">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'} available
          </div>
          {filteredEmployees.length > 0 ? (
            <div className="reassign-grid">
              {filteredEmployees.map(employee => {
                const isCurrentAssignee = employee.name === currentAssignee;
                const isSelected = selectedEmployee?.id === employee.id;
                const positionColor = getPositionColor(employee.position);

                return (
                  <div
                    key={employee.id}
                    className={`employee-card ${isSelected ? 'selected' : ''} ${isCurrentAssignee ? 'current-assignee' : ''}`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="employee-avatar" style={{
                      background: `linear-gradient(135deg, ${positionColor} 0%, ${positionColor}dd 100%)`
                    }}>
                      {getInitials(employee.name)}
                    </div>
                    <div className="employee-info">
                      <div className="employee-name">
                        {employee.name}
                        {isCurrentAssignee && (
                          <span style={{
                            marginLeft: '6px',
                            fontSize: '11px',
                            color: '#c4b5fd',
                            fontWeight: '400'
                          }}>
                            (Current)
                          </span>
                        )}
                      </div>
                      <div className="employee-position">{employee.position}</div>
                      {employee.certifications && employee.certifications.length > 0 && (
                        <div className="employee-certs">
                          {employee.certifications.slice(0, 3).map((cert, idx) => (
                            <span key={idx} className="cert-badge">{cert}</span>
                          ))}
                          {employee.certifications.length > 3 && (
                            <span className="cert-badge">+{employee.certifications.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="employee-check">
                      {isSelected && (
                        <svg width="12" height="12" fill="white" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="reassign-empty">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20" style={{marginBottom: '12px', opacity: 0.3}}>
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <div style={{fontSize: '16px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px'}}>
                No employees found
              </div>
              <div style={{fontSize: '14px', color: '#6b7280'}}>
                Try adjusting your filters or search term
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="reassign-footer">
          <button className="reassign-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="reassign-btn primary"
            onClick={handleConfirm}
            disabled={!selectedEmployee}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '6px', display: 'inline-block'}}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

