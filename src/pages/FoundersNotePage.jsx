import React from 'react';
import '../css/FoundersNote.css';
import FoundersNoteSection from '../components/FoundersNoteSection';
import AsteriskBackground from '../components/AsteriskBackground';

function FoundersNotePage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <AsteriskBackground />
      <FoundersNoteSection />
    </div>
  );
}

export default FoundersNotePage;