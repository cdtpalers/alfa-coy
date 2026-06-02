import React from 'react';

const COUNCILS = [
  { id: 's1', label: 'S1 Personnel', icon: 'fa-user-group' },
  { id: 's2', label: 'S2 Security', icon: 'fa-shield-halved' },
  { id: 's3', label: 'S3 Operations', icon: 'fa-crosshairs' },
  { id: 's4', label: 'S4 Logistics', icon: 'fa-cubes' },
  { id: 's5', label: 'S5 Plans & Programs', icon: 'fa-chart-simple' },
  { id: 's6', label: 'S6 Signal', icon: 'fa-tower-broadcast' },
  { id: 's7', label: 'S7 Civil-Military', icon: 'fa-handshake-angle' },
  { id: 's8', label: 'S8 Education & Training', icon: 'fa-book-open' },
  { id: 's10', label: 'S10 Finance', icon: 'fa-coins' },
  { id: 'athletic', label: 'Athletic Council', icon: 'fa-person-running' },
  { id: 'academic', label: 'Academic Council', icon: 'fa-graduation-cap' },
];

export default function SideBar({ 
  currentPage, 
  setCurrentPage, 
  theme, 
  toggleTheme, 
  onRefresh, 
  openEventModal,
  openAnnouncementModal,
  isAdmin,
  openLoginModal,
  handleLogout
}) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-coa" style={{ overflow: 'hidden', padding: 0 }}>
          <img src="/logo.jpg" alt="ALFA CO. Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="sidebar-brand-text">
          <h1>ALFA CO.</h1>
          <p>CCAFP • BULLETIN BOARD</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="sidebar-nav-container">
        {/* Core Pages */}
        <div className="sidebar-nav-group">
          <span className="sidebar-group-title">MAIN NAVIGATION</span>
          <nav className="sidebar-menu">
            <button 
              className={`sidebar-menu-item ${currentPage === 'home' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('home')}
            >
              <i className="fa fa-house"></i>
              <span>Home Overview</span>
            </button>
            <button 
              className={`sidebar-menu-item ${currentPage === 'commanders' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('commanders')}
            >
              <i className="fa fa-star"></i>
              <span>Company Staff</span>
            </button>
            <button 
              className={`sidebar-menu-item ${currentPage === 'calendar' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('calendar')}
            >
              <i className="fa fa-calendar-days"></i>
              <span>Event Calendar</span>
            </button>
            <button 
              className={`sidebar-menu-item ${currentPage === 'rack' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('rack')}
            >
              <i className="fa fa-mobile-screen"></i>
              <span>Smartphone Rack</span>
            </button>
            <button 
              className={`sidebar-menu-item ${currentPage === 'roster' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('roster')}
            >
              <i className="fa fa-address-book"></i>
              <span>Company Roster</span>
            </button>
            <button 
              className={`sidebar-menu-item ${currentPage === 'exo' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('exo')}
            >
              <i className="fa fa-clipboard-list"></i>
              <span>EXO Punishment List</span>
            </button>
          </nav>
        </div>

        {/* Councils */}
        <div className="sidebar-nav-group">
          <span className="sidebar-group-title">COUNCILS</span>
          <nav className="sidebar-menu">
            {COUNCILS.map(c => (
              <button 
                key={c.id}
                className={`sidebar-menu-item ${currentPage === c.id ? 'active' : ''}`} 
                onClick={() => setCurrentPage(c.id)}
              >
                <i className={`fa ${c.icon}`}></i>
                <span>{c.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot"></span>
          <span>SYSTEM LIVE</span>
        </div>
        <div className="sidebar-actions">
          <button className="sidebar-action-btn" title="Toggle theme" onClick={toggleTheme} style={{ flex: 2, fontWeight: 'bold' }}>
            <i className={theme === 'dark' ? 'fa fa-circle-half-stroke' : 'fa fa-sun'}></i>
            <span style={{ marginLeft: '6px' }}>{theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}</span>
          </button>
          {isAdmin ? (
            <>
              <button className="sidebar-action-btn btn-success" title="Add event" onClick={openEventModal}>
                <i className="fa fa-calendar-plus"></i>
              </button>
              <button className="sidebar-action-btn" title="Add announcement" onClick={openAnnouncementModal} style={{color: '#44aaff'}}>
                <i className="fa fa-bullhorn"></i>
              </button>
              <button className="sidebar-action-btn" title="Logout" onClick={handleLogout} style={{color: '#ff4d4d'}}>
                <i className="fa fa-arrow-right-from-bracket"></i>
              </button>
            </>
          ) : (
            <button className="sidebar-action-btn" title="Admin Login" onClick={openLoginModal}>
              <i className="fa fa-lock"></i>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
