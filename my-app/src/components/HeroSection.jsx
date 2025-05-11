import React from 'react';
import '../css/HeroSection.css'; // Import the CSS file

function HeroSection() {
  return (
    <section id="heroSection">
      <div className="container">
        {/* LEFT SIDE: Text */}
        <div className="flex-1 text-center lg:text-left">
          <h1>
            <span>Stop Guessing.</span>
            <span>Start Knowing.</span>
          </h1>
          <p>
            Onsight provides gyms with real-time occupancy and equipment usage data to optimize
            resources, cut costs, and enhance member experiences.
          </p>
          <div className="buttons">
            <a href="#waitlistSection">Join Waitlist</a>
            <a href="#featuresSection">Learn More</a>
          </div>
        </div>
        {/* RIGHT SIDE: OnSight Logo */}
        <div className="relative">
          <div className="absolute"></div>
          <img
            src="/logo.png"
            alt="OnSight Logo"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;