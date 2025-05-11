import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Header.css';

function Header() {
  return (
    <header>
      <div className="container">
        <div className="flex items-center">
          <img
            src="/logodraft.PNG"
            alt="OnSight Logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/features">Features</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/foundersNote">Founders' Note</Link>
          <Link to="/waitlist">Waitlist</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;