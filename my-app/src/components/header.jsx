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
          <a href="#dashboardSection">Dashboard</a>
          <a href="#foundersNoteSection">Founder's Note</a>
          <a href="#waitlistSection">Waitlist</a>
          <a href="#loginSection">Login</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;