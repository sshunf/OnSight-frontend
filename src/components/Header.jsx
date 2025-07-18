import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Header.css';

function Header() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
      <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/logodraft.png" alt="OnSight Logo" className="w-12 h-auto mr-3" />
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/features" className={isActive('/features') ? "text-white hover:text-white" : "text-gray-300 hover:text-white"}>Features</Link>
          <Link to="/dashboard-demo" className={isActive('/dashboard-demo') ? "text-white hover:text-white" : "text-gray-300 hover:text-white"}>Dashboard</Link>
          <Link to="/foundersNote" className={isActive('/foundersNote') ? "text-white hover:text-white" : "text-gray-300 hover:text-white"}>Founders' Note</Link>
          <Link to="/waitlist" className={isActive('/waitlist') ? "text-white hover:text-white" : "text-gray-300 hover:text-white"}>Waitlist</Link>
          <Link to="/login" className="bg-transparent hover:bg-white/10 text-gray-300 hover:text-white px-4 py-2 rounded">Login</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;