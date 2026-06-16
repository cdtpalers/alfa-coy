import { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import SideBar from './components/SideBar';
import Ticker from './components/Ticker';
import EventModal from './components/EventModal';
import AnnouncementModal from './components/AnnouncementModal';
import Home from './pages/Home';
import CouncilPage from './pages/CouncilPage';
import CompanyStaff from './pages/CompanyStaff';
import Calendar from './pages/Calendar';
import RosterPage from './pages/RosterPage';
import ExoPage from './pages/ExoPage';
import LoginModal from './components/LoginModal';
import AdminDashboard from './pages/AdminDashboard';
import SmartphoneRack from './pages/SmartphoneRack';
import TacoCorner from './pages/TacoCorner';
import { supabase } from './lib/supabase';

const INITIAL_EVENTS = [];

// CSV parsing removed, relying only on Supabase

function AppContent() {
  const toast = useToast();
  const [theme, setTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState('home');
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [localAnnouncements, setLocalAnnouncements] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editEventData, setEditEventData] = useState(null);
  const [editAnnouncementData, setEditAnnouncementData] = useState(null);
  const [showTicker, setShowTicker] = useState(() => {
    const stored = localStorage.getItem('alfa_show_ticker');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('alfa_show_ticker', String(showTicker));
  }, [showTicker]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = (e.target.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

      // Escape — close any open modal
      if (e.key === 'Escape') {
        if (isEventModalOpen) { setIsEventModalOpen(false); setEditEventData(null); }
        else if (isAnnouncementModalOpen) { setIsAnnouncementModalOpen(false); setEditAnnouncementData(null); }
        else if (isLoginModalOpen) { setIsLoginModalOpen(false); }
        return;
      }

      // Don't fire shortcuts while typing
      if (isTyping) return;

      // Don't fire shortcuts while a modal is open
      const anyModalOpen = isEventModalOpen || isAnnouncementModalOpen || isLoginModalOpen;

      // t/T — toggle theme
      if ((e.key === 't' || e.key === 'T') && !anyModalOpen) {
        toggleTheme();
        return;
      }

      // / — focus search input on Home page
      if (e.key === '/' && !anyModalOpen) {
        const searchInput = document.getElementById('home-search-input');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEventModalOpen, isAnnouncementModalOpen, isLoginModalOpen]);

  useEffect(() => {
    try {
      fetchSupabaseData().finally(() => setLoading(false));

      if (localStorage.getItem('alfa_is_admin') === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error('Initialization error', e);
      setLoading(false);
    }
  }, []);

  async function fetchSupabaseData() {
    try {
      const { data: dbEvents, error: evError } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (evError) console.error("Events fetch error:", evError);
      if (dbEvents) setEvents(dbEvents);
      
      const { data: dbAnnouncements, error: annError } = await supabase.from('announcements').select('*').order('date', { ascending: false });
      if (annError) console.error("Announcements fetch error:", annError);
      if (dbAnnouncements) {
        const mapped = dbAnnouncements.map(row => ({
          id: row.id,
          Title: row.title,
          Body: row.body,
          Date: row.date,
          Council: row.council,
          Tag: row.tag,
          Priority: row.priority
        }));
        setLocalAnnouncements(mapped);
      }
    } catch (err) {
      console.error("Error fetching Supabase data:", err);
    }
  }

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('alfa_is_admin', 'true');
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('alfa_is_admin');
  };

  const addEvent = async (ev) => {
    const { id, ...eventData } = ev;
    
    if (id) {
      const { error } = await supabase.from('events').update(eventData).eq('id', id);
      if (error) {
        console.error("Error updating event:", error);
        toast.error("Failed to update event.");
        return;
      }
      setEvents(events.map(e => e.id === id ? { ...eventData, id } : e));
    } else {
      const { data, error } = await supabase.from('events').insert([eventData]).select();
      if (error) {
        console.error("Error adding event:", error);
        toast.error("Failed to save event to database.");
        return;
      }
      if (data && data.length > 0) setEvents([...events, data[0]]);
    }
    setIsEventModalOpen(false);
    setEditEventData(null);
  };

  const deleteEvent = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event.");
      return;
    }
    setEvents(events.filter(e => e.id !== id));
  };

  const addAnnouncement = async (ann) => {
    const { id, ...annData } = ann;
    const dbRow = {
      title: annData.Title,
      body: annData.Body,
      date: annData.Date,
      council: annData.Council,
      tag: annData.Tag,
      priority: annData.Priority
    };

    if (id) {
      const { error } = await supabase.from('announcements').update(dbRow).eq('id', id);
      if (error) {
        console.error("Error updating announcement:", error);
        toast.error("Failed to update announcement.");
        return;
      }
      setLocalAnnouncements(localAnnouncements.map(a => a.id === id ? { ...annData, id } : a));
    } else {
      const { data, error } = await supabase.from('announcements').insert([dbRow]).select();
      if (error) {
        console.error("Error adding announcement:", error);
        toast.error("Failed to save announcement.");
        return;
      }
      if (data && data.length > 0) {
        const inserted = data[0];
        setLocalAnnouncements([{ id: inserted.id, Title: inserted.title, Body: inserted.body, Date: inserted.date, Council: inserted.council, Tag: inserted.tag, Priority: inserted.priority }, ...localAnnouncements]);
      }
    }
    setIsAnnouncementModalOpen(false);
    setEditAnnouncementData(null);
  };

  const deleteAnnouncement = async (id) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement.");
      return;
    }
    setLocalAnnouncements(localAnnouncements.filter(a => a.id !== id));
  };

  const handleRefresh = () => {
    fetchSupabaseData();
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <Home 
          announcements={localAnnouncements} 
          events={events} 
          isAdmin={isAdmin}
          loading={loading}
        />
      );
    }
    if (currentPage === 'commanders') {
      return <CompanyStaff />;
    }
    if (currentPage === 'taco-corner') {
      return <TacoCorner announcements={localAnnouncements} loading={loading} />;
    }
    if (currentPage === 'exo') {
      return <ExoPage />;
    }
    if (currentPage === 'calendar') {
      return <Calendar events={events} openEventModal={() => setIsEventModalOpen(true)} isAdmin={isAdmin} />;
    }
    if (currentPage === 'rack') {
      return <SmartphoneRack />;
    }
    if (currentPage === 'roster') {
      return <RosterPage />;
    }
    if (currentPage === 'admin-dashboard' && isAdmin) {
      return (
        <AdminDashboard 
          events={events}
          announcements={localAnnouncements}
          onEditEvent={(e) => { setEditEventData(e); setIsEventModalOpen(true); }}
          onDeleteEvent={deleteEvent}
          onEditAnnouncement={(a) => { setEditAnnouncementData(a); setIsAnnouncementModalOpen(true); }}
          onDeleteAnnouncement={deleteAnnouncement}
        />
      );
    }
    return <CouncilPage councilId={currentPage} announcements={localAnnouncements} events={events} isAdmin={isAdmin} loading={loading} />;
  };

  return (
    <div className="dashboard-layout">
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <SideBar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        theme={theme}
        toggleTheme={toggleTheme}
        onRefresh={handleRefresh}
        openEventModal={() => setIsEventModalOpen(true)}
        openAnnouncementModal={() => setIsAnnouncementModalOpen(true)}
        isAdmin={isAdmin}
        openLoginModal={() => setIsLoginModalOpen(true)}
        handleLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        announcements={localAnnouncements}
      />
      
      <div className="main-panel">
        <header className="panel-header">
          <div className="panel-header-left">
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <i className="fa fa-bars"></i>
            </button>
            <span className="panel-breadcrumb">
              ALFA CO. BULLETIN BOARD <span className="breadcrumb-divider">/</span> <strong>{currentPage.toUpperCase()}</strong>
            </span>
          </div>
          <div className="panel-header-right">
            <div className="status-pill"><span className="status-dot"></span>LIVE FEED</div>
            <button className="btn" title="Toggle theme" onClick={toggleTheme} style={{ padding: '8px 16px', fontWeight: 'bold' }}>
              <i className={theme === 'dark' ? 'fa fa-circle-half-stroke' : 'fa fa-sun'} style={{ marginRight: '6px' }}></i>
              {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
            </button>
            {isAdmin && (
              <>
                <button className="btn btn-primary btn-sm" title="Add event" onClick={() => setIsEventModalOpen(true)} style={{marginRight: '8px'}}>
                  <i className="fa fa-calendar-plus"></i> ADD EVENT
                </button>
                <button className="btn btn-primary btn-sm" title="Add announcement" onClick={() => setIsAnnouncementModalOpen(true)}>
                  <i className="fa fa-bullhorn"></i> ADD ANNOUNCEMENT
                </button>
              </>
            )}
          </div>
        </header>

        {showTicker && (
          <Ticker data={localAnnouncements} events={events} onClose={() => setShowTicker(false)} />
        )}

        <main className="content pb-40">
          {renderPage()}
        </main>
      </div>

      <EventModal 
        isOpen={isEventModalOpen} 
        onClose={() => { setIsEventModalOpen(false); setEditEventData(null); }}
        onSave={(ev) => addEvent(ev)}
        initialData={editEventData}
        toast={toast}
      />

      <AnnouncementModal 
        isOpen={isAnnouncementModalOpen} 
        onClose={() => { setIsAnnouncementModalOpen(false); setEditAnnouncementData(null); }}
        onSave={(ann) => addAnnouncement(ann)}
        initialData={editAnnouncementData}
        toast={toast}
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginSuccess}
        toast={toast}
      />

      {/* Bottom Navigation Bar (visible on mobile only via CSS) */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          <i className="fa fa-house"></i>
          <span>Home</span>
        </button>
        <button
          className={`bottom-nav-item ${currentPage === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentPage('calendar')}
        >
          <i className="fa fa-calendar"></i>
          <span>Calendar</span>
        </button>
        <button
          className={`bottom-nav-item ${currentPage === 'commanders' ? 'active' : ''}`}
          onClick={() => setCurrentPage('commanders')}
        >
          <i className="fa fa-user-shield"></i>
          <span>Staff</span>
        </button>
        <button
          className={`bottom-nav-item ${currentPage === 'exo' ? 'active' : ''}`}
          onClick={() => setCurrentPage('exo')}
        >
          <i className="fa fa-list-check"></i>
          <span>EXO</span>
        </button>
        {isAdmin && (
          <button
            className={`bottom-nav-item ${currentPage === 'admin-dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('admin-dashboard')}
          >
            <i className="fa fa-gear"></i>
            <span>Admin</span>
          </button>
        )}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
