// src/utils/occupancyTable.js
export function buildEquipmentRows(occData) {
  if (!occData || !occData.machineStatus) return [];

  const statusMap   = occData.machineStatus; // { [machineName]: 'active' | 'inactive' | ... }
  const lastSeenMap = occData.machineLastSeen || occData.lastSeenMap || {}; // optional
  const windowMins  = occData.windowMinutes;

  const formatLastSeen = (val) => {
    if (!val) return windowMins != null ? `≤ ${windowMins} min` : '—';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    const diffM = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
    if (diffM < 1) return 'just now';
    if (diffM < 60) return `${diffM} min ago`;
    const hrs = Math.floor(diffM / 60);
    return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  };

  return Object.keys(statusMap)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const status = statusMap[name];
      const lastSeenRaw = lastSeenMap[name] || null;
      const lastSeen = status === 'active'
        ? formatLastSeen(lastSeenRaw) // show “≤ window” if missing
        : formatLastSeen(lastSeenRaw);
      return { name, status, lastSeen };
    });
}
