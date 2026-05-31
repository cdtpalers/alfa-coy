import React from 'react';

const COUNCILS = [
  { id: 's1', label: 'S1 COUNCIL' },
  { id: 's2', label: 'S2 COUNCIL' },
  { id: 's3', label: 'S3 COUNCIL' },
  { id: 's4', label: 'S4 COUNCIL' },
  { id: 's5', label: 'S5 COUNCIL' },
  { id: 's6', label: 'S6 COUNCIL' },
  { id: 's7', label: 'S7 COUNCIL' },
  { id: 's8', label: 'S8 COUNCIL' },
  { id: 's10', label: 'S10 COUNCIL' },
  { id: 'athletic', label: 'ATHLETIC' },
  { id: 'academic', label: 'ACADEMIC' },
];

export default function TopBar({ 
  currentPage, 
  setCurrentPage, 
  theme, 
  toggleTheme, 
  onRefresh, 
  openEventModal 
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="logo-area">
          <div className="coa">⚔️</div>
          <div className="brand">
            <h1>ALFA CO.</h1>
            <p>CCAFP • Bulletin Board</p>
          </div>
        </div>

        <div className="nav-scroll">
          <nav className="nav-tabs" id="mainNav">
            <button 
              className={`nav-tab ${currentPage === 'home' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('home')}
            >
              <i className="fa fa-home" style={{marginRight: '5px'}}></i>HOME
            </button>
            {COUNCILS.map(c => (
              <button 
                key={c.id}
                className={`nav-tab ${currentPage === c.id ? 'active' : ''}`} 
                onClick={() => setCurrentPage(c.id)}
              >
                {c.label}
              </button>
            ))}
            <button 
              className={`nav-tab ${currentPage === 'commanders' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('commanders')}
            >
              ⭐ COMPANY STAFF
            </button>
            <button 
              className={`nav-tab ${currentPage === 'calendar' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('calendar')}
            >
              📅 CALENDAR
            </button>
          </nav>
        </div>

        <div className="topbar-actions">
          <div className="status-pill"><span className="status-dot"></span>LIVE</div>
          <button className="btn-icon" title="Refresh feeds" onClick={onRefresh}>
            <i className="fa fa-rotate"></i>
          </button>
          <button className="btn-icon" title="Toggle theme" onClick={toggleTheme}>
            <i className={theme === 'dark' ? 'fa fa-circle-half-stroke' : 'fa fa-sun'}></i>
          </button>
          <button className="btn-icon" title="Add event" onClick={openEventModal}>
            <i className="fa fa-calendar-plus"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
