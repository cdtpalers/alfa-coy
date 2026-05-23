import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const TAG_COLORS = {
  urgent: 'tag-red',
  important: 'tag-gold',
  info: 'tag-blue',
  training: 'tag-green',
  activity: 'tag-green',
  default: 'tag-green'
};

function tagClass(tag) {
  return TAG_COLORS[tag?.toLowerCase()] || 'tag-green';
}

export default function AnnCard({ item }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="glass ann-card" onClick={() => setIsOpen(true)}>
        <div className="ann-meta">
          <span className={`tag ${tagClass(item.Tag)}`}>
            {(item.Tag || 'INFO').toUpperCase()}
          </span>
          {item.Priority === 'high' && (
            <span className="tag tag-red" style={{marginLeft: '8px'}}>PRIORITY</span>
          )}
          <span className="ann-date" style={{marginLeft: 'auto'}}>{item.Date || ''}</span>
        </div>
        <div className="ann-title">{item.Title || 'Untitled'}</div>
        <div className="ann-body">{item.Body || ''}</div>
        <div className="ann-source">
          <i className="fa-brands fa-google"></i>
          {item.Council ? item.Council.toUpperCase() + ' COUNCIL' : 'ALFA CO.'}
        </div>
      </div>

      {isOpen && createPortal(
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setIsOpen(false);
        }}>
          <div className="modal glass" style={{maxWidth: '600px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
              <div className="ann-meta" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <span className={`tag ${tagClass(item.Tag)}`}>
                  {(item.Tag || 'INFO').toUpperCase()}
                </span>
                {item.Priority === 'high' && (
                  <span className="tag tag-red">PRIORITY</span>
                )}
                <span className="ann-date">{item.Date || ''}</span>
              </div>
              <button className="btn-icon" onClick={() => setIsOpen(false)} style={{border: 'none', background: 'transparent'}}><i className="fa fa-xmark"></i></button>
            </div>
            
            <h3 style={{marginBottom: '16px', fontSize: '22px', lineHeight: '1.3'}}>{item.Title || 'Untitled'}</h3>
            <div style={{color: 'var(--text-muted)', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '24px', fontSize: '14px'}}>
              {item.Body || ''}
            </div>
            <div className="ann-source" style={{paddingTop: '16px', borderTop: '1px solid var(--border-strong)', color: 'var(--text-dim)', fontSize: '12px'}}>
              <i className="fa-brands fa-google" style={{marginRight: '6px'}}></i> 
              Posted by {item.Council ? item.Council.toUpperCase() + ' COUNCIL' : 'ALFA CO.'}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
