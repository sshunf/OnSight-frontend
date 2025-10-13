import React from 'react';
import '../css/FoundersNote.css';
import FoundersNoteSection from '../components/FoundersNoteSection';
// import AsteriskBackground from '../components/AsteriskBackground';
import NightBackground from '../components/NightBackground';

function FoundersNotePage() {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* <AsteriskBackground /> */}
      <NightBackground />
      <FoundersNoteSection />
    </div>
  );
}

export default FoundersNotePage;