import React, { useState, useEffect } from 'react';
import '../css/Waitlist.css';

function WaitlistSection() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [popup, setPopup] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
      // Create asterisk background effect
      const createAsterisks = () => {
        const container = document.getElementById('asteriskContainer');
        if (!container) return;
        container.innerHTML = '';
        const numAsterisks = 100;
        for (let i = 0; i < numAsterisks; i++) {
          const asterisk = document.createElement('span');
          asterisk.className = 'asterisk';
          asterisk.textContent = '*';
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

    useEffect(() => {
      if (popup.show) {
        const timer = setTimeout(() => {
          setPopup({ show: false, message: '', type: '' });
        }, 3500);
        return () => clearTimeout(timer);
      }
    }, [popup.show]);

    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${backendURL}/api/waitlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        if (response.ok) {
          setSubmitted(true);
          setEmail('');
          setPopup({ show: true, message: 'Thank you for joining the waitlist!', type: 'success' });
        } else {
          setPopup({ show: true, message: 'There was a problem joining the waitlist. Please try again.', type: 'error' });
        }
      } catch (error) {
        setPopup({ show: true, message: 'There was a problem joining the waitlist. Please try again.', type: 'error' });
      }
    };

    return (
      <div className="bg-black text-white min-h-screen waitlist-container">
        {/* Asterisk Background - will be provided by the App.jsx AsteriskBackground component */}
        <section className="waitlist-section flex flex-col items-center justify-center min-h-screen px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-8xl md:text-9xl font-extrabold mb-2 text-white mt-10">
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
            {popup.show && (
              <div
                className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 min-w-[280px] max-w-[90vw] px-8 py-5 rounded-xl shadow-2xl text-lg font-semibold flex items-center justify-between gap-4 transition-all duration-300
                  ${popup.type === 'success' ? 'bg-green-500/95 text-white' : ''}
                  ${popup.type === 'error' ? 'bg-red-500/95 text-white' : ''}
                  ${popup.type === 'info' ? 'bg-blue-500/95 text-white' : ''}
                  animate-popup
                `}
                style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)', marginTop: '1.5rem' }}
              >
                <span className="flex-1 text-center w-full">{popup.message}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    );
}

export default WaitlistSection;
