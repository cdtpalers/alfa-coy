import React, { useState } from 'react';

export default function AdminDashboard({ 
  events, 
  announcements, 
  onEditEvent, 
  onDeleteEvent, 
  onEditAnnouncement, 
  onDeleteAnnouncement 
}) {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="page active" id="page-admin-dashboard">
      <div className="cal-topbar">
        <div className="cal-topbar-left">
          <h2>Content Management</h2>
        </div>
        <div className="cal-topbar-center">
          <div className={`cal-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')} style={{cursor: 'pointer'}}>
            Events ({events.length})
          </div>
          <div className={`cal-tab ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')} style={{cursor: 'pointer'}}>
            Announcements ({announcements.length})
          </div>
        </div>
      </div>
      
      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', overflowX: 'auto' }}>
        {activeTab === 'events' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase' }}>Title</th>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase' }}>Council</th>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No events found.</td></tr>
              ) : events.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}><strong>{e.title}</strong></td>
                  <td style={{ padding: '12px' }}>{e.date} {e.time && <span style={{color: 'var(--text-muted)', fontSize: '12px'}}>({e.time})</span>}</td>
                  <td style={{ padding: '12px' }}><span className={`cal-pill pill-${e.cat === 'formation' || e.cat === 'ceremony' ? 'gold' : e.cat === 'academic' || e.cat === 'activity' ? 'blue' : 'green'}`} style={{margin: 0}}>{e.cat}</span></td>
                  <td style={{ padding: '12px' }}>{e.council}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button className="btn btn-sm" onClick={() => onEditEvent(e)} style={{ marginRight: '8px', padding: '6px 12px' }}>
                      <i className="fa fa-pen"></i> Edit
                    </button>
                    <button className="btn btn-sm" onClick={() => { if(window.confirm('Delete this event?')) onDeleteEvent(e.id); }} style={{ padding: '6px 12px', color: '#ff4d4d', borderColor: '#ff4d4d' }}>
                      <i className="fa fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'announcements' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase' }}>Title</th>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase' }}>Tag</th>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase' }}>Council</th>
                <th style={{ padding: '12px', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No announcements found.</td></tr>
              ) : announcements.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}><strong>{a.Title}</strong></td>
                  <td style={{ padding: '12px' }}>{a.Date}</td>
                  <td style={{ padding: '12px' }}>{a.Tag}</td>
                  <td style={{ padding: '12px' }}>{a.Council}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button className="btn btn-sm" onClick={() => onEditAnnouncement(a)} style={{ marginRight: '8px', padding: '6px 12px' }}>
                      <i className="fa fa-pen"></i> Edit
                    </button>
                    <button className="btn btn-sm" onClick={() => { if(window.confirm('Delete this announcement?')) onDeleteAnnouncement(a.id); }} style={{ padding: '6px 12px', color: '#ff4d4d', borderColor: '#ff4d4d' }}>
                      <i className="fa fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
