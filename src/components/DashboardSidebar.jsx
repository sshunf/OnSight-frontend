import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import '../css/DashboardSidebar.css';

function DashboardSidebar({ user, collapsed, onLogout, onLinkClick }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img
          src={user?.photoURL || '/default-avatar.png'}
          alt="Avatar"
          className="avatar"
        />
        {!collapsed && (
          <p className="username">{user?.displayName || 'User'}</p>
        )}
      </div>
      <nav className="nav-links">
        <a href="#dashboard" onClick={() => onLinkClick('dashboard')}>
          🏠{!collapsed && ' Dashboard'}
        </a>
        <a href="#devices" onClick={() => onLinkClick('devices')}>
          💡{!collapsed && ' Devices'}
        </a>
        <a href="#analytics" onClick={() => onLinkClick('analytics')}>
          📊{!collapsed && ' Analytics'}
        </a>
      </nav>
      <button className="sidebar-logout" onClick={onLogout}>
        {!collapsed ? 'Sign Out' : '🚪'}
      </button>
    </aside>
  );
}

export default DashboardSidebar;
