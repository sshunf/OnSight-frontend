import React from 'react';
import TempDashboard from '../components/TempDashboard';
import NightBackground from '../components/NightBackground';

function TempDashboardPage() {
  return (
    <div style={{ position: 'relative', backgroundColor: '#0b0b0f', width: '100%', minHeight: '100vh' }}>
      <NightBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TempDashboard />
      </div>
    </div>
  );
}

export default TempDashboardPage;

