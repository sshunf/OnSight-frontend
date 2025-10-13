import React, { useEffect, useState } from 'react';

export default function SensorsTab() {
  const [sensors, setSensors] = useState([
    { id: 'S-001', zone: 'Cardio NE', lastHeartbeatMin: 2, rssi: -58, power: 'Energy Harvesting', status: 'OK' },
    { id: 'S-002', zone: 'Free Weights', lastHeartbeatMin: 5, rssi: -62, power: 'Energy Harvesting', status: 'OK' },
    { id: 'S-003', zone: 'Cardio SW', lastHeartbeatMin: 18, rssi: -70, power: 'Energy Harvesting', status: 'Warn' },
    { id: 'S-004', zone: 'Stretching', lastHeartbeatMin: 1, rssi: -55, power: 'Energy Harvesting', status: 'OK' },
    { id: 'S-005', zone: 'Entry', lastHeartbeatMin: 9, rssi: -65, power: 'Energy Harvesting', status: 'OK' },
  ]);

  useEffect(() => {
    // In a real app, poll health endpoints; here it’s static/stubbed
  }, []);

  return (
    <div className="nx-card">
      <div className="nx-card-header">
        <div>
          <div className="nx-card-title">Sensors</div>
          <div className="nx-subtle">5 sensors • batteryless (no battery swaps)</div>
        </div>
      </div>
      <div className="nx-table-wrap">
        <div className="nx-thead" style={{gridTemplateColumns:'160px 1fr 140px 120px 100px'}}>
          <div>ID</div>
          <div>Zone</div>
          <div>Last Heartbeat</div>
          <div>RSSI</div>
          <div>Status</div>
        </div>
        {sensors.map(s => (
          <div key={s.id} className="nx-trow" style={{gridTemplateColumns:'160px 1fr 140px 120px 100px'}}>
            <div>{s.id}</div>
            <div>{s.zone}</div>
            <div>{s.lastHeartbeatMin} min ago</div>
            <div>{s.rssi} dBm</div>
            <div><span className={`nx-badge ${s.status==='OK'?'active': s.status==='Warn'?'maintenance':'inactive'}`}>{s.status}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}


