import React from 'react';

export default function Ticker({ data, events, onClose }) {
  // Only show high-priority announcements and events within 3 days
  const now = new Date();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  const priorityAnnouncements = data.filter(d => d.Priority === 'high');
  const upcomingEvents = events
    .filter(ev => {
      const evDate = new Date(ev.date);
      const diff = evDate - now;
      return diff >= 0 && diff <= threeDaysMs;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const items = [...priorityAnnouncements, ...upcomingEvents];

  // Don't render the ticker if there's nothing to show
  if (items.length === 0) return null;

  const htmlContent = items.map((item, idx) => {
    if (item.title) {
      return (
        <div className="ticker-item" key={`ev-${item.id}-${idx}`}>
          <i className="fa fa-calendar-check"></i>EVENT: {item.title} — {item.date}
        </div>
      );
    }
    return (
      <div className="ticker-item" key={`ann-${idx}`}>
        <i className="fa fa-bullhorn"></i>{item.Title}: {(item.Body || '').slice(0, 80)}…
      </div>
    );
  });

  return (
    <div className="ticker-wrap">
      <div className="ticker-label">📡 ALFA CO.</div>
      <div className="ticker-inner">
        {htmlContent}
        {htmlContent}
      </div>
      <button className="ticker-close" onClick={onClose} title="Dismiss ticker">
        <i className="fa fa-xmark"></i>
      </button>
    </div>
  );
}
