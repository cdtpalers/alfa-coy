import React, { useState } from 'react';

export default function AnnouncementModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState('');
  const [council, setCouncil] = useState('all');
  const [tag, setTag] = useState('info');
  const [priority, setPriority] = useState('normal');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !body.trim() || !date) {
      alert('Title, Body, and Date are required.');
      return;
    }
    const newAnnouncement = {
      Title: title.trim(),
      Body: body.trim(),
      Date: date,
      Council: council,
      Tag: tag,
      Priority: priority
    };
    onSave(newAnnouncement);
    // Reset form
    setTitle('');
    setBody('');
    setDate('');
    setCouncil('all');
    setTag('info');
    setPriority('normal');
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') onClose();
    }}>
      <div className="modal glass">
        <h3><i className="fa fa-bullhorn"></i> ADD ANNOUNCEMENT</h3>
        <div className="form-row">
          <div className="form-group" style={{flex: 1}}>
            <label>Title *</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Announcement title…" 
              style={{width: '100%'}}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group" style={{flex: '0 0 160px'}}>
            <label>Tag</label>
            <select 
              className="glass-input" 
              style={{width: '100%'}}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <option value="info">Info</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
              <option value="training">Training</option>
              <option value="activity">Activity</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{flex: 1}}>
            <label>Date *</label>
            <input 
              type="date" 
              className="glass-input" 
              style={{width: '100%'}}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label>Council</label>
            <select 
              className="glass-input" 
              style={{width: '100%'}}
              value={council}
              onChange={(e) => setCouncil(e.target.value)}
            >
              <option value="all">All Company</option>
              <option>S1</option><option>S2</option><option>S3</option><option>S4</option>
              <option>S5</option><option>S6</option><option>S7</option><option>S8</option>
              <option>S10</option><option>Athletic</option><option>Academic</option>
            </select>
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label>Priority</label>
            <select 
              className="glass-input" 
              style={{width: '100%'}}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Body *</label>
          <textarea 
            className="glass-input" 
            placeholder="Detailed announcement content…" 
            style={{width: '100%'}}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}><i className="fa fa-xmark"></i> CANCEL</button>
          <button className="btn btn-primary" onClick={handleSave}><i className="fa fa-paper-plane"></i> POST ANNOUNCEMENT</button>
        </div>
      </div>
    </div>
  );
}
