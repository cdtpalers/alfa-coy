import React, { useState, useEffect, useMemo } from 'react';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { supabase } from '../lib/supabase';

export default function AnnouncementModal({ isOpen, onClose, onSave, initialData = null, toast }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState('');
  const [council, setCouncil] = useState('all');
  const [tag, setTag] = useState('info');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.Title || '');
        setBody(initialData.Body || '');
        setDate(initialData.Date || '');
        setCouncil(initialData.Council || 'all');
        setTag(initialData.Tag || 'info');
        setPriority(initialData.Priority || 'normal');
      } else {
        setTitle('');
        setBody('');
        setDate('');
        setCouncil('all');
        setTag('info');
        setPriority('normal');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !body.trim() || !date) {
      if (toast) toast.warning('Title, Body, and Date are required.');
      return;
    }
    const newAnnouncement = {
      ...(initialData ? { id: initialData.id } : {}),
      Title: title.trim(),
      Body: body.trim(),
      Date: date,
      Council: council,
      Tag: tag,
      Priority: priority
    };
    onSave(newAnnouncement);
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') onClose();
    }}>
      <div className="modal glass">
        <h3><i className="fa fa-bullhorn"></i> {initialData ? 'EDIT' : 'ADD'} ANNOUNCEMENT</h3>
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
              <option value="s1">S1</option><option value="s2">S2</option><option value="s3">S3</option><option value="s4">S4</option>
              <option value="s5">S5</option><option value="s6">S6</option><option value="s7">S7</option><option value="s8">S8</option>
              <option value="s10">S10</option><option value="rso">RSO Council</option><option value="athletic">Athletic Council</option><option value="academic">Academic Council</option>
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
          <SimpleMdeReact
            value={body}
            onChange={setBody}
            options={{
              uploadImage: true,
              toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "upload-image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"],
              imageUploadFunction: async (file, onSuccess, onError) => {
                try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                  
                  const { error: uploadError } = await supabase.storage
                    .from('announcement-images')
                    .upload(fileName, file);

                  if (uploadError) {
                    throw uploadError;
                  }

                  const { data } = supabase.storage
                    .from('announcement-images')
                    .getPublicUrl(fileName);

                  onSuccess(data.publicUrl);
                } catch (error) {
                  console.error('Error uploading image:', error);
                  onError('Failed to upload image. Ensure the "announcement-images" bucket is public.');
                }
              },
              spellChecker: false,
              placeholder: 'Detailed announcement content…',
              status: false
            }}
          />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}><i className="fa fa-xmark"></i> CANCEL</button>
          <button className="btn btn-primary" onClick={handleSave}><i className="fa fa-paper-plane"></i> POST ANNOUNCEMENT</button>
        </div>
      </div>
    </div>
  );
}
