import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Lock body scroll when mobile menu is open and handle Escape to close
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
      <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/logodraft.png" alt="OnSight Logo" className="w-12 h-auto mr-3" />
          </Link>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/features" className={isActive('/features') ? "text-white hover:text-white" : "text-gray-300 hover:text-white"}>Features</Link>
          <Link to="/dashboard-demo" className={isActive('/dashboard-demo') ? "text-white hover:text-white" : "text-gray-300 hover:text-white"}>Dashboard</Link>
          <Link to="/foundersNote" className={isActive('/foundersNote') ? "text-white hover:text-white" : "text-gray-300 hover:text-white"}>Founders' Note</Link>
          <Link to="/waitlist" className={isActive('/waitlist') ? "text-white hover:text-white" : "text-gray-300 hover:text-white"}>Waitlist</Link>
          <Link to="/login" className="bg-transparent hover:bg-white/10 text-gray-300 hover:text-white px-4 py-2 rounded">Login</Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-white/10 text-gray-200"
          onClick={() => setMobileOpen(true)}
        >
          {/* Inline hamburger icon (three horizontal lines) */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Mobile full-screen overlay menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm md:hidden">
          <div className="h-16 px-6 flex items-center justify-between">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center">
              <img src="/logodraft.png" alt="OnSight Logo" className="w-10 h-auto" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              className="inline-flex items-center justify-center p-2 rounded hover:bg-white/10 text-gray-200"
              onClick={() => setMobileOpen(false)}
            >
              {/* Close (X) icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 pt-6 pb-10 flex flex-col gap-6">
            <button className="text-left text-2xl text-white/90" onClick={() => { setMobileOpen(false); navigate('/features'); }}>Features</button>
            <button className="text-left text-2xl text-white/90" onClick={() => { setMobileOpen(false); navigate('/dashboard-demo'); }}>Dashboard</button>
            <button className="text-left text-2xl text-white/90" onClick={() => { setMobileOpen(false); navigate('/foundersNote'); }}>Founders' Note</button>
            <div className="h-2" />
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setMobileOpen(false); navigate('/waitlist'); }}
                className="px-5 py-2 rounded-full border border-white/20 bg-white/10 text-white text-sm"
              >
                WAITLIST
              </button>
              <button
                onClick={() => { setMobileOpen(false); navigate('/login'); }}
                className="px-5 py-2 rounded-full bg-white text-black text-sm"
              >
                LOGIN
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;