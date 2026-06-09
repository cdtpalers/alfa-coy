import React, { useState, useEffect } from 'react';

export default function EventModal({ isOpen, onClose, onSave, initialData = null }) {
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('training');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [council, setCouncil] = useState('all');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setCat(initialData.cat || 'training');
        setDate(initialData.date || '');
        setTime(initialData.time || '');
        setCouncil(initialData.council || 'all');
        setDesc(initialData.desc || '');
      } else {
        setTitle('');
        setCat('training');
        setDate('');
        setTime('');
        setCouncil('all');
        setDesc('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !date) {
      alert('Title and date are required.');
      return;
    }
    const newEvent = {
      ...(initialData ? { id: initialData.id } : {}),
      title: title.trim(),
      date,
      time,
      cat,
      council,
      desc
    };
    onSave(newEvent);
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') onClose();
    }}>
      <div className="modal glass">
        <h3><i className="fa fa-calendar-plus"></i> {initialData ? 'EDIT' : 'ADD'} COMPANY EVENT</h3>
        <div className="form-row">
          <div className="form-group" style={{flex: 1}}>
            <label>Event Title *</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Event name…" 
              style={{width: '100%'}}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group" style={{flex: '0 0 160px'}}>
            <label>Category</label>
            <select 
              className="glass-input" 
              style={{width: '100%'}}
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              <option value="training">Training</option>
              <option value="formation">Formation</option>
              <option value="academic">Academic</option>
              <option value="athletic">Athletic</option>
              <option value="ceremony">Ceremony</option>
              <option value="activity">Activity</option>
              <option value="other">Other</option>
              <option value="bessang pass">Bessang Pass</option>
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
            <label>Time</label>
            <input 
              type="time" 
              className="glass-input" 
              style={{width: '100%'}}
              value={time}
              onChange={(e) => setTime(e.target.value)}
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
              <option value="s1">S1</option><option value="s2">S2</option><option value="s3">S3</option><option value="s4">S4</option>
              <option value="s5">S5</option><option value="s6">S6</option><option value="s7">S7</option><option value="s8">S8</option>
              <option value="s10">S10</option><option value="rso">RSO Council</option><option value="athletic">Athletic Council</option><option value="academic">Academic Council</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea 
            className="glass-input" 
            placeholder="Event details, venue, requirements…" 
            style={{width: '100%'}}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}><i className="fa fa-xmark"></i> CANCEL</button>
          <button className="btn btn-primary" onClick={handleSave}><i className="fa fa-floppy-disk"></i> SAVE EVENT</button>
        </div>
      </div>
    </div>
  );
}
