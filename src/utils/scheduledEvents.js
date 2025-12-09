export function mergeScheduledEvents(events, scheduledTickets) {
  const scheduledEvents = (scheduledTickets || [])
    .filter(t => t.scheduledAt && t.gymId)
    .map(t => {
      const dt = new Date(t.scheduledAt);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      return {
        id: `scheduled_${t._id}`,
        title: t.machineName ? `${t.machineName} (${t.ticketType || 'Ticket'})` : (t.description || 'Scheduled maintenance'),
        date: iso,
        assignedTo: t.worker || t.assignedTo || 'Technician',
        deadline: iso,
        status: 'Scheduled',
        ticketId: t._id,
        scheduledAt: dt
      };
    });

  const deduped = [];
  const seen = new Set(events.map(e => e.id));
  for (const ev of scheduledEvents) {
    if (seen.has(ev.id)) continue;
    deduped.push(ev);
  }
  return [...events, ...deduped];
}
