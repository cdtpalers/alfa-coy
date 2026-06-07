import { useState, useEffect } from 'react';
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
import { supabase } from './lib/supabase';

const DEMO_DATA = [
  { Title:'Welcome to ALFA Co. Bulletin Board', Body:'This is the official digital bulletin board of ALFA Company, CCAFP. All cadets are reminded to check this board regularly for updates, announcements, and schedules.', Date:'2025-04-26', Tag:'info', Council:'all', Priority:'high' },
  { Title:'S3: Drill and Ceremony Practice', Body:'All cadets are required to attend D&C practice this Saturday at 0700H at the parade grounds. Full BDU uniform required. Attendance is mandatory.', Date:'2025-04-25', Tag:'training', Council:'s3', Priority:'high' },
  { Title:'S1: Roster Update Deadline', Body:'All cadets must submit updated personal information forms to S1 personnel no later than April 30. Forms available at the S1 office.', Date:'2025-04-24', Tag:'important', Council:'s1', Priority:'normal' },
  { Title:'Academic: Study Hall Schedule', Body:'Weekly study hall sessions will be held every Monday and Wednesday from 1800-2000H at the study area. Academic council officers will be on duty to assist.', Date:'2025-04-23', Tag:'info', Council:'academic', Priority:'normal' },
  { Title:'S4: Equipment Accountability', Body:'Quarterly equipment inspection will be conducted on May 3. All cadets must ensure issued equipment is in serviceable condition and accounted for.', Date:'2025-04-22', Tag:'urgent', Council:'s4', Priority:'high' },
  { Title:'Athletic: Intramurals Sign-Up', Body:'Sign-up sheets for the company intramurals are now available. Available sports: basketball, volleyball, badminton, and track events. Deadline to sign up is May 1.', Date:'2025-04-21', Tag:'activity', Council:'athletic', Priority:'normal' },
];

const INITIAL_EVENTS = [];

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/"/g,'').trim());
  return lines.slice(1).map(line => {
    const vals = [];
    let cur='', inQ=false;
    for (let ch of line) {
      if (ch==='"' ) { inQ=!inQ; }
      else if (ch===',' && !inQ) { vals.push(cur.trim()); cur=''; }
      else cur+=ch;
    }
    vals.push(cur.trim());
    const obj={};
    headers.forEach((h,i)=>{ obj[h]=vals[i]||''; });
    return obj;
  });
}

export default function App() {
  const [theme, setTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState('home');
  const [sheetData, setSheetData] = useState(DEMO_DATA);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [localAnnouncements, setLocalAnnouncements] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedStatus, setFeedStatus] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editEventData, setEditEventData] = useState(null);
  const [editAnnouncementData, setEditAnnouncementData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      fetchSupabaseData();

      const storedData = localStorage.getItem('alfa_sheet_data');
      if (storedData) {
        setSheetData(JSON.parse(storedData));
      }
      const url = localStorage.getItem('alfa_sheet_url');
      if (url) {
        loadGoogleSheet(url);
      }
      if (localStorage.getItem('alfa_is_admin') === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error('Initialization error', e);
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
        alert("Failed to update event.");
        return;
      }
      setEvents(events.map(e => e.id === id ? { ...eventData, id } : e));
    } else {
      const { data, error } = await supabase.from('events').insert([eventData]).select();
      if (error) {
        console.error("Error adding event:", error);
        alert("Failed to save event to database.");
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
      alert("Failed to delete event.");
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
        alert("Failed to update announcement.");
        return;
      }
      setLocalAnnouncements(localAnnouncements.map(a => a.id === id ? { ...annData, id } : a));
    } else {
      const { data, error } = await supabase.from('announcements').insert([dbRow]).select();
      if (error) {
        console.error("Error adding announcement:", error);
        alert("Failed to save announcement.");
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
      alert("Failed to delete announcement.");
      return;
    }
    setLocalAnnouncements(localAnnouncements.filter(a => a.id !== id));
  };

  async function loadGoogleSheet(url) {
    if (!url) { 
      setFeedStatus({msg: 'Please enter a valid Google Sheets CSV URL.', type: 'err'}); 
      return; 
    }
    let csvUrl = url;
    if (url.includes('/edit') || url.includes('/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
    }
    setFeedStatus({msg: 'Connecting to Google Sheets…', type: ''});
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error('HTTP '+res.status);
      const text = await res.text();
      const data = parseCSV(text);
      if (!data.length) throw new Error('Empty or unreadable sheet');
      
      setSheetData(data);
      localStorage.setItem('alfa_sheet_url', url);
      localStorage.setItem('alfa_sheet_data', JSON.stringify(data));
      setFeedStatus({msg: `✓ Loaded ${data.length} records from Google Sheets.`, type: 'ok'});
    } catch(e) {
      setFeedStatus({msg: 'Could not fetch sheet. Ensure it is published. Error: '+e.message, type: 'err'});
    }
  };

  const handleClearSheet = () => {
    setSheetData(DEMO_DATA);
    localStorage.removeItem('alfa_sheet_url');
    localStorage.removeItem('alfa_sheet_data');
    setFeedStatus({msg: 'Cleared. Showing demo data.', type: ''});
  };

  const handleRefresh = () => {
    fetchSupabaseData();
    const url = localStorage.getItem('alfa_sheet_url');
    if (url) loadGoogleSheet(url);
    else setFeedStatus({msg: 'Refreshed local data.', type: 'ok'});
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const combinedData = [...localAnnouncements, ...sheetData];

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <Home 
          sheetData={combinedData} 
          events={events} 
          onSheetConnect={loadGoogleSheet}
          onSheetClear={handleClearSheet}
          feedStatus={feedStatus}
          isAdmin={isAdmin}
        />
      );
    }
    if (currentPage === 'commanders') {
      return <CompanyStaff />;
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
    return <CouncilPage councilId={currentPage} sheetData={combinedData} events={events} />;
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

        <main className="content pb-40">
          {renderPage()}
        </main>
      </div>

      <Ticker data={combinedData} events={events} />

      <EventModal 
        isOpen={isEventModalOpen} 
        onClose={() => { setIsEventModalOpen(false); setEditEventData(null); }}
        onSave={(ev) => addEvent(ev)}
        initialData={editEventData}
      />

      <AnnouncementModal 
        isOpen={isAnnouncementModalOpen} 
        onClose={() => { setIsAnnouncementModalOpen(false); setEditAnnouncementData(null); }}
        onSave={(ann) => addAnnouncement(ann)}
        initialData={editAnnouncementData}
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginSuccess}
      />
    </div>
  );
}
