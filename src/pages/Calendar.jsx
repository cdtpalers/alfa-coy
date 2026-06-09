import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const CAT_COLORS = { training:'tag-green', formation:'tag-gold', academic:'tag-blue', athletic:'tag-green', ceremony:'tag-gold', activity:'tag-blue', other:'tag-green', 'bessang pass':'tag-orange' };

export default function Calendar({ events, openEventModal, isAdmin }) {
  const [calDate, setCalDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  
  const allFilters = ['training', 'formation', 'academic', 'athletic', 'ceremony', 'activity', 'other', 'bessang pass', 'birthdays'];
  const [filters, setFilters] = useState(new Set(allFilters));

  useEffect(() => {
    fetch('/roster.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const bdays = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const vals = [];
          let cur='', inQ=false;
          for (let ch of line) {
            if (ch==='"' ) { inQ=!inQ; }
            else if (ch===',' && !inQ) { vals.push(cur.trim()); cur=''; }
            else cur+=ch;
          }
          vals.push(cur.trim());
          if (vals.length > 11) {
            const lastName = vals[2] || '';
            const firstName = vals[3] || '';
            const cadetClass = vals[8] || '';
            const shortName = `${cadetClass} ${lastName}`.trim();
            let dobStr = vals[11];
            if (dobStr && dobStr !== 'N/A' && dobStr.trim() !== '') {
              dobStr = dobStr.replace(/[-/]/g, ' ').replace(/,/g, '');
              const d = new Date(dobStr);
              if (!isNaN(d.getTime())) {
                bdays.push({ 
                  name: `${firstName} ${lastName}`.trim(), 
                  shortName,
                  cadetClass,
                  month: d.getMonth(), 
                  day: d.getDate() 
                });
              }
            }
          }
        }
        setBirthdays(bdays);
      })
      .catch(console.error);
  }, []);

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
    const dayBirthdays = birthdays.filter(b => b.month === month && b.day === i);
    daysGrid.push({ day: i, isOtherMonth: false, dateStr, isToday, hasEvent, birthdays: dayBirthdays });
  }

  const handlePrevMonth = () => setCalDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCalDate(new Date(year, month + 1, 1));

  const displayEvents = selectedDate 
    ? events.filter(e => e.date === selectedDate)
    : events.slice().sort((a,b) => a.date.localeCompare(b.date));

  return (
    <div className="page active" id="page-calendar">
      <div className="cal-topbar">
        <div className="cal-topbar-left">
          <h2>Calendar</h2>
        </div>
        <div className="cal-topbar-center">
          <div className="cal-tab active">Month</div>
        </div>
        <div className="cal-topbar-right">
          {isAdmin && (
            <button className="btn-add" onClick={openEventModal}>
              <i className="fa fa-plus"></i> Add Event
            </button>
          )}
        </div>
      </div>
      
      <div className="cal-layout">
        <div className="cal-sidebar">
          <div className="cal-filters">
            <h4>Filters</h4>
            {allFilters.map(f => (
              <label key={f} className="filter-label">
                <input 
                  type="checkbox" 
                  checked={filters.has(f)} 
                  onChange={() => {
                    const nf = new Set(filters);
                    nf.has(f) ? nf.delete(f) : nf.add(f);
                    setFilters(nf);
                  }} 
                />
                <div className={`filter-icon ${f === 'birthdays' ? 'pill-bday-1cl' : `pill-${CAT_COLORS[f]?.split('-')[1] || 'green'}`}`} style={{width: 12, height: 12, borderRadius: 3, borderLeft: 'none'}}></div>
                <span style={{textTransform: 'capitalize'}}>{f}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="cal-wrap">
          <div className="cal-header">
            <h3>{MONTHS[month]} {year}</h3>
            <div className="cal-nav">
              <button className="btn-icon" onClick={handlePrevMonth}><i className="fa fa-chevron-left"></i></button>
              <button className="btn-icon" onClick={handleNextMonth}><i className="fa fa-chevron-right"></i></button>
            </div>
          </div>
          
          <div className="cal-grid">
            {DAYS.map(day => <div className="cal-day-name" key={day}>{day}</div>)}
            {daysGrid.map((d, i) => {
              const dayEvents = events.filter(e => e.date === d.dateStr && filters.has(e.cat || 'other'));
              return (
              <div 
                key={i} 
                className={`cal-day ${d.isOtherMonth ? 'other-month' : ''} ${d.isToday ? 'today' : ''} ${selectedDate === d.dateStr ? 'selected' : ''}`}
                onClick={() => { if(!d.isOtherMonth) setSelectedDate(d.dateStr); }}
              >
                <div className="cal-day-num">{d.day}</div>
                
                {!d.isOtherMonth && dayEvents.map((e, idx) => {
                  let pillClass = `pill-${CAT_COLORS[e.cat]?.split('-')[1] || 'green'}`;
                  return (
                    <div key={'e'+idx} className={`cal-pill ${pillClass}`} title={e.title}>
                      <i className="fa fa-calendar-check"></i> {e.title}
                    </div>
                  );
                })}
                
                {!d.isOtherMonth && filters.has('birthdays') && d.birthdays && d.birthdays.map((b, idx) => {
                  const classKey = (b.cadetClass || '').toLowerCase();
                  let pillClass = 'pill-bday-other';
                  if (classKey.includes('1cl')) pillClass = 'pill-bday-1cl';
                  else if (classKey.includes('2cl')) pillClass = 'pill-bday-2cl';
                  else if (classKey.includes('3cl')) pillClass = 'pill-bday-3cl';
                  else if (classKey.includes('4cl')) pillClass = 'pill-bday-4cl';
                  return (
                    <div key={'b'+idx} className={`cal-pill ${pillClass}`} title={`Birthday: ${b.name}`}>
                      <i className="fa-solid fa-cake-candles"></i> {b.shortName}
                    </div>
                  );
                })}
              </div>
            )})}
          </div>
        </div>
      </div>
      
      {selectedDate && (() => {
        const [sYear, sMonth, sDay] = selectedDate.split('-');
        const selMonth = parseInt(sMonth, 10) - 1;
        const selDay = parseInt(sDay, 10);
        const dayEvents = events.filter(e => e.date === selectedDate);
        const dayBirthdays = birthdays.filter(b => b.month === selMonth && b.day === selDay);
        
        const dateObj = new Date(parseInt(sYear), selMonth, selDay);
        const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        return createPortal(
          <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
            <div className="modal glass" onClick={e => e.stopPropagation()} style={{maxWidth: '500px'}}>
              <h3><i className="fa fa-calendar-day"></i> {formattedDate}</h3>
              
              {dayEvents.length === 0 && dayBirthdays.length === 0 && (
                <p style={{color: 'var(--text-muted)'}}>No events or birthdays on this day.</p>
              )}
              
              {dayEvents.length > 0 && (
                <div style={{marginBottom: 20}}>
                  <h4 style={{marginBottom: 10, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase'}}>Events</h4>
                  {dayEvents.map((e, idx) => (
                    <div key={idx} style={{padding: '12px', background: 'var(--app-bg)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--border)'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                        <strong>{e.title}</strong>
                        <span className={`cal-pill pill-${CAT_COLORS[e.cat]?.split('-')[1] || 'green'}`} style={{margin: 0}}>{e.cat}</span>
                      </div>
                      <div style={{fontSize: 13, color: 'var(--text-muted)', marginBottom: 8}}>
                        <i className="fa fa-clock"></i> {e.time || 'All Day'} &nbsp;|&nbsp; <i className="fa fa-users"></i> {e.council}
                      </div>
                      {e.desc && <div style={{fontSize: 14}}>{e.desc}</div>}
                    </div>
                  ))}
                </div>
              )}
              
              {dayBirthdays.length > 0 && (
                <div>
                  <h4 style={{marginBottom: 10, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase'}}>Birthdays</h4>
                  {dayBirthdays.map((b, idx) => (
                    <div key={idx} style={{padding: '10px 12px', background: 'var(--app-bg)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10}}>
                      <i className="fa-solid fa-cake-candles" style={{color: '#ff9800'}}></i>
                      <div>
                        <strong>{b.name}</strong>
                        <div style={{fontSize: 12, color: 'var(--text-muted)'}}>{b.cadetClass}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="modal-actions" style={{marginTop: 20}}>
                <button className="btn" onClick={() => setSelectedDate(null)}>CLOSE</button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
