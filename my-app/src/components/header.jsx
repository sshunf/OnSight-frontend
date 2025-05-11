import React from 'react';
import '../css/Header.css'; // Import the CSS file

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
          <a href="#featuresSection">Features</a>
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