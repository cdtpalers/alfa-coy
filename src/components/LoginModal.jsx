import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLogin, toast }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = () => {
    if (password === 'alfabestcoy') {
      onLogin();
      setPassword('');
      setError('');
    } else {
      setError('Incorrect passcode.');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') onClose();
    }}>
      <div className="modal glass" style={{ maxWidth: '400px' }}>
        <h3><i className="fa fa-lock"></i> ADMIN LOGIN</h3>
        <div className="form-group" style={{marginTop: '15px'}}>
          <label>Passcode</label>
          <input 
            type="password" 
            className="glass-input" 
            placeholder="Enter admin passcode" 
            style={{width: '100%'}}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && <p style={{color: 'var(--danger)', marginTop: '8px', fontSize: '14px', fontWeight: '500'}}>{error}</p>}
        </div>
        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button className="btn" onClick={onClose}><i className="fa fa-xmark"></i> CANCEL</button>
          <button className="btn btn-primary" onClick={handleLogin}><i className="fa fa-unlock"></i> LOGIN</button>
        </div>
      </div>
    </div>
  );
}
