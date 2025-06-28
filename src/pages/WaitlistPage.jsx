import React, { useState, useEffect } from 'react';
import '../css/Waitlist.css';

function WaitlistPage() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Create asterisk background effect
    const createAsterisks = () => {
      const container = document.getElementById('asteriskContainer');
      if (!container) return;
      
      // Clear existing asterisks
      container.innerHTML = '';
      
      // Create new asterisks
      const numAsterisks = 100;
      for (let i = 0; i < numAsterisks; i++) {
        const asterisk = document.createElement('span');
        asterisk.className = 'asterisk';
        asterisk.textContent = '*';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        asterisk.style.left = `${x}%`;
        asterisk.style.top = `${y}%`;
        
        container.appendChild(asterisk);
      }
    };
    
    createAsterisks();
    window.addEventListener('resize', createAsterisks);
    
    return () => {
      window.removeEventListener('resize', createAsterisks);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted with email:', email);
    // Reset the form
    setEmail('');
    // You could add a success message or other feedback here
  };

  return (
    <div className="bg-black text-white min-h-screen waitlist-container">
      {/* Asterisk Background - will be provided by the App.jsx AsteriskBackground component */}
      
      {/* WAITLIST SECTION */}
      <section className="waitlist-section flex flex-col items-center justify-center min-h-screen px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-8xl md:text-9xl font-bold mb-2 text-white">
            Want this at your gym?
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Join our waitlist to be among the first to experience how OnSight can transform your facility.
          </p>
          
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex items-center mb-2">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow px-5 py-4 bg-gray-900 border border-gray-800 rounded-l text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-black font-medium rounded-r hover:bg-gray-200 transition-colors duration-200"
            >
              Join Now
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default WaitlistPage; 