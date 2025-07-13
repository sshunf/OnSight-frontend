import React from 'react';
import '../css/Waitlist.css';
import WaitlistSection from '../components/WaitlistSection';

function WaitlistPage() {
  return (
    <div className="bg-black text-white min-h-screen waitlist-container">
      <WaitlistSection />
    </div>
  );
}

export default WaitlistPage;