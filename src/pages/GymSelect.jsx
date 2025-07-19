import React from 'react';
import GymSelectScreen from '../components/GymSelectScreen';
import AsteriskBackground from '../components/AsteriskBackground';

function Login() {
  return (
    <div className="gym-select-page min-h-screen bg-black">
      <AsteriskBackground />
      <GymSelectScreen />
    </div>
  );
}

export default GymSelect;