import React from 'react';
import '../css/Waitlist.css';
import WaitlistSection from '../components/WaitlistSection';

function WaitlistPage() {
  return (
    <div className="page-gradient text-white waitlist-container py-12 min-h-screen">
      <WaitlistSection />
    </div>
  );
}

export default WaitlistPage;