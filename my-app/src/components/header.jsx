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
          <a href="#aboutSection">About</a>
          <a href="#teamSection">Team</a>
          <a href="#waitlistSection">Waitlist</a>
          <button
            onClick={() =>
              document.getElementById('loginScreen').scrollIntoView({ behavior: 'smooth' })
            }
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;