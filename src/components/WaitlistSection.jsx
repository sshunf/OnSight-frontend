import React, { useState, useEffect } from 'react';
import '../css/Waitlist.css';

function WaitlistSection() {
    // const [email, setEmail] = useState('');
    const [form, setForm] = useState({
      name: '',
      company: '',
      email: '',
      notes: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [popup, setPopup] = useState({ show: false, message: '', type: '' });

    // useEffect(() => {
    //   // Create asterisk background effect
    //   const createAsterisks = () => {
    //     const container = document.getElementById('asteriskContainer');
    //     if (!container) return;
    //     container.innerHTML = '';
    //     const numAsterisks = 100;
    //     for (let i = 0; i < numAsterisks; i++) {
    //       const asterisk = document.createElement('span');
    //       asterisk.className = 'asterisk';
    //       asterisk.textContent = '*';
    //       const x = Math.random() * 100;
    //       const y = Math.random() * 100;
    //       asterisk.style.left = `${x}%`;
    //       asterisk.style.top = `${y}%`;
    //       container.appendChild(asterisk);
    //     }
    //   };
    //   createAsterisks();
    //   window.addEventListener('resize', createAsterisks);
    //   return () => {
    //     window.removeEventListener('resize', createAsterisks);
    //   };
    // }, []);

    useEffect(() => {
      if (popup.show) {
        const timer = setTimeout(() => {
          setPopup({ show: false, message: '', type: '' });
        }, 3500);
        return () => clearTimeout(timer);
      }
    }, [popup.show]);

    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${backendURL}/api/waitlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ form }),
        });
        if (response.ok) {
          setSubmitted(true);
          setForm({
            name: '',
            company: '',
            email: '',
            notes: '',
          });
          setPopup({ show: true, message: 'Thank you for registering for a demo!', type: 'success' });
        } else {
          setPopup({ show: true, message: 'There was a problem registering for a demo. Please try again.', type: 'error' });
        }
      } catch (error) {
        setPopup({ show: true, message: 'There was a problem registering for a demo. Please try again.', type: 'error' });
      }
    };

    return (
    <div className="bg-black text-white relative min-h-screen">
      <div id="asteriskContainer" className="pointer-events-none absolute inset-0"></div>
      <section className="waitlist-section relative z-10 px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* intro */}
          <div className="space-y-6 ">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Want this at your gym?
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-prose">
              Let us manage your gym equipment so you don{"'"}t have to.
            </p>
          </div>
          {/* form */}
          <div className="w-full">
            <div className="rounded-2xl border border-indigo-600 bg-gray-900/60 backdrop-blur p-6 md:p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 text-center">Book A Demo</h2>
              <p className="text-gray-400 mb-6 text-center">Tell us a bit about you and we’ll reach out.</p>
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-300 mb-1"></label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="First And Last Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0D0F17] border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm text-gray-300 mb-1"></label>
                  <input
                    id="company"
                    type="text"
                    name="company"
                    placeholder="Company/Gym"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0D0F17] border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-300 mb-1"></label>
                  <input
                    id="email"
                    name="email"
                    placeholder="Work Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0D0F17] border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm text-gray-300 mb-1"></label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Notes (optional)"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0D0F17] border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Submit
                </button>
                {submitted && (
                  <p className="text-sm text-purple-400">
                    Thanks! We{"'"}ll be in touch shortly.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
        {popup.show && (
          <div
            className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 min-w-[280px] max-w-[90vw] px-8 py-5 rounded-xl shadow-2xl text-lg font-semibold flex items-center justify-between gap-4 transition-all duration-300
              ${popup.type === 'success' ? 'bg-purple-500/95 text-white' : ''}
              ${popup.type === 'error' ? 'bg-red-500/95 text-white' : ''}
              ${popup.type === 'info' ? 'bg-blue-500/95 text-white' : ''}
              animate-popup
            `}
            style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)', marginTop: '1.5rem' }}
          >
            <span className="flex-1 text-center w-full">{popup.message}</span>
          </div>
        )}
      </section>
    </div>
  );
}

export default WaitlistSection;
