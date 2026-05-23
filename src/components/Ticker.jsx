import React from 'react';

export default function Ticker({ data, events }) {
  const items = [
    ...data.filter(d => d.Priority === 'high'),
    ...events.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)
  ];

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
    </div>
  );
}
