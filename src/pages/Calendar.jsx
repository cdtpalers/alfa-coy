import React, { useState } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const CAT_COLORS = { training:'tag-green', formation:'tag-gold', academic:'tag-blue', athletic:'tag-green', ceremony:'tag-gold', activity:'tag-blue', other:'tag-green' };

export default function Calendar({ events, openEventModal, isAdmin }) {
  const [calDate, setCalDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const today = new Date();

  const eventDates = new Set(events.map(e => e.date));

  const daysGrid = [];

  // prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    daysGrid.push({ day: prevDays - i, isOtherMonth: true, dateStr: '' });
  }

  // current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const hasEvent = eventDates.has(dateStr);
    daysGrid.push({ day: i, isOtherMonth: false, dateStr, isToday, hasEvent });
  }

  const handlePrevMonth = () => setCalDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCalDate(new Date(year, month + 1, 1));

  const displayEvents = selectedDate 
    ? events.filter(e => e.date === selectedDate)
    : events.slice().sort((a,b) => a.date.localeCompare(b.date));

  return (
    <div className="page active" id="page-calendar">
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">📅</div>
          <div><h2>EVENT CALENDAR</h2><p>ALFA COMPANY SCHEDULE</p></div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openEventModal}>
            <i className="fa fa-plus"></i> ADD EVENT
          </button>
        )}
      </div>
      <div className="cal-layout" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', alignItems: 'start'}}>
        <div className="glass cal-wrap">
          <div className="cal-header">
            <h3>{MONTHS[month]} {year}</h3>
            <div className="cal-nav">
              <button className="btn-icon" onClick={handlePrevMonth}><i className="fa fa-chevron-left"></i></button>
              <button className="btn-icon" onClick={handleNextMonth}><i className="fa fa-chevron-right"></i></button>
            </div>
          </div>
          <div className="cal-grid">
            {DAYS.map(day => <div className="cal-day-name" key={day}>{day}</div>)}
            {daysGrid.map((d, i) => (
              <div 
                key={i} 
                className={`cal-day ${d.isOtherMonth ? 'other-month' : ''} ${d.isToday ? 'today' : ''} ${d.hasEvent ? 'has-event' : ''} ${selectedDate === d.dateStr ? 'selected' : ''}`}
                onClick={() => { if(!d.isOtherMonth) setSelectedDate(d.dateStr); }}
              >
                {d.day}
              </div>
            ))}
          </div>
        </div>
        <div className="glass" style={{padding: '20px'}}>
          <h3 style={{fontFamily: "'Rajdhani', sans-serif", fontSize: '18px', fontWeight: 700, letterSpacing: '1px', color: 'var(--g1)', marginBottom: '14px'}}>
            <i className="fa fa-list"></i> {selectedDate ? `EVENTS ON ${selectedDate}` : 'ALL EVENTS'}
          </h3>
          <div className="event-list">
            {displayEvents.length ? displayEvents.map((e, i) => {
              const [y,m,d] = e.date.split('-');
              const mon = MONTHS[+m-1].substring(0,3);
              return (
                <div className="event-item" key={i}>
                  <div className="event-date-badge"><div className="d">{d}</div><div className="m">{mon} {y}</div></div>
                  <div className="event-info">
                    <h4>{e.title}</h4>
                    <p>{e.time||''} {e.desc||''}</p>
                    <div className="event-tags">
                      <span className={`tag ${CAT_COLORS[e.cat]||'tag-green'}`}>{(e.cat||'event').toUpperCase()}</span>
                      {e.council && e.council !== 'all' && <span className="tag tag-blue">{e.council}</span>}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="empty-state">
                <i className="fa fa-calendar-xmark"></i>
                <p>{selectedDate ? 'No events on this date' : 'No events scheduled'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
