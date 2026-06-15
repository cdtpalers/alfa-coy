import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ 
  events, 
  announcements, 
  onEditEvent, 
  onDeleteEvent, 
  onEditAnnouncement, 
  onDeleteAnnouncement 
}) {
  const [activeTab, setActiveTab] = useState('events');
  const [privilegeDates, setPrivilegeDates] = useState([]);
  const [newPrivilegeDate, setNewPrivilegeDate] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('s1_privilege_dates');
    if (stored) {
      setPrivilegeDates(JSON.parse(stored));
    }
  }, []);

  const handleAddPrivilege = () => {
    if (!newPrivilegeDate) return;
    if (privilegeDates.includes(newPrivilegeDate)) {
      alert('This date is already announced.');
      return;
    }
    const updated = [...privilegeDates, newPrivilegeDate].sort();
    setPrivilegeDates(updated);
    localStorage.setItem('s1_privilege_dates', JSON.stringify(updated));
    setNewPrivilegeDate('');
  };

  const handleDeletePrivilege = (date) => {
    const updated = privilegeDates.filter(d => d !== date);
    setPrivilegeDates(updated);
    localStorage.setItem('s1_privilege_dates', JSON.stringify(updated));
  };


  return (
    <div className="page active" id="page-admin-dashboard">
      <div className="cal-topbar">
        <div className="cal-topbar-left">
          <h2>Content Management</h2>
        </div>
        <div className="cal-topbar-center">
          <div className={`cal-tab cal-tab--clickable ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
            Events ({events.length})
          </div>
          <div className={`cal-tab cal-tab--clickable ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>
            Announcements ({announcements.length})
          </div>
          <div className={`cal-tab cal-tab--clickable ${activeTab === 'privileges' ? 'active' : ''}`} onClick={() => setActiveTab('privileges')}>
            S1 Privileges ({privilegeDates.length})
          </div>
        </div>
      </div>
      
      <div className="admin-panel">
        {activeTab === 'events' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Category</th>
                <th>Council</th>
                <th className="admin-table--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="5">
                  <div className="empty-state">
                    <i className="fa fa-calendar"></i>
                    <p>No events found. Create one to get started.</p>
                  </div>
                </td></tr>
              ) : events.map(e => (
                <tr key={e.id}>
                  <td><strong>{e.title}</strong></td>
                  <td>{e.date} {e.time && <span className="admin-time-hint">({e.time})</span>}</td>
                  <td><span className={`cal-pill pill-${e.cat === 'formation' || e.cat === 'ceremony' ? 'gold' : e.cat === 'academic' || e.cat === 'activity' ? 'blue' : 'green'}`}>{e.cat}</span></td>
                  <td>{e.council}</td>
                  <td className="admin-table--actions">
                    <button className="btn btn-sm admin-btn-edit" onClick={() => onEditEvent(e)}>
                      <i className="fa fa-pen"></i> Edit
                    </button>
                    <button className="btn btn-sm admin-btn-delete" onClick={() => { if(window.confirm('Delete this event?')) onDeleteEvent(e.id); }}>
                      <i className="fa fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'announcements' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Tag</th>
                <th>Council</th>
                <th className="admin-table--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr><td colSpan="5">
                  <div className="empty-state">
                    <i className="fa fa-bullhorn"></i>
                    <p>No announcements found. Add bulletins via Google Sheets.</p>
                  </div>
                </td></tr>
              ) : announcements.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.Title}</strong></td>
                  <td>{a.Date}</td>
                  <td>{a.Tag}</td>
                  <td>{a.Council}</td>
                  <td className="admin-table--actions">
                    <button className="btn btn-sm admin-btn-edit" onClick={() => onEditAnnouncement(a)}>
                      <i className="fa fa-pen"></i> Edit
                    </button>
                    <button className="btn btn-sm admin-btn-delete" onClick={() => { if(window.confirm('Delete this announcement?')) onDeleteAnnouncement(a.id); }}>
                      <i className="fa fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'privileges' && (
          <div>
            <div className="admin-privilege-form">
              <input 
                type="date" 
                className="glass-input" 
                value={newPrivilegeDate}
                onChange={(e) => setNewPrivilegeDate(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAddPrivilege}>
                <i className="fa fa-plus"></i> Announce Privilege Date
              </button>
            </div>
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Announced Date</th>
                  <th className="admin-table--actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {privilegeDates.length === 0 ? (
                  <tr><td colSpan="2">
                    <div className="empty-state">
                      <i className="fa fa-calendar-check"></i>
                      <p>No privileges announced. Add a date above.</p>
                    </div>
                  </td></tr>
                ) : privilegeDates.map(date => (
                  <tr key={date}>
                    <td><strong>{date}</strong></td>
                    <td className="admin-table--actions">
                      <button className="btn btn-sm admin-btn-delete" onClick={() => { if(window.confirm('Delete this announced privilege date?')) handleDeletePrivilege(date); }}>
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
