import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import '../css/DashboardSidebar.css';

function DashboardSidebar({ user, collapsed, onLogout }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <>
            <img
              src={user?.photoURL || '/default-avatar.png'}
              alt="Avatar"
              className="avatar"
            />
            <p className="username">{user?.displayName || 'User'}</p>
          </>
        )}
      </div>
      <nav className="nav-links">
        <a href="#dashboard">🏠{!collapsed && ' Dashboard'}</a>
        <a href="#devices">💡{!collapsed && ' Devices'}</a>
        <a href="#analytics">📊{!collapsed && ' Analytics'}</a>
        <a href="#settings">⚙️{!collapsed && ' Settings'}</a>
      </nav>
      <button className="sidebar-logout" onClick={onLogout}>
        {!collapsed ? 'Sign Out' : '🚪'}
      </button>
    </aside>
  );
}

export default DashboardSidebar;
