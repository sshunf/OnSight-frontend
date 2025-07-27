import React from 'react';
import '../css/Waitlist.css';
import WaitlistSection from '../components/WaitlistSection';

function WaitlistPage() {
  return (
    <div className="bg-black text-white waitlist-container py-12">
      <WaitlistSection />
    </div>
  );
}

export default WaitlistPage;