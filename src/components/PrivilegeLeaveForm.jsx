import React, { useState, useEffect } from 'react';

export default function PrivilegeLeaveForm({ isAdmin }) {
  const [privilegeDates, setPrivilegeDates] = useState([]);
  const [date, setDate] = useState('');
  const [cadetClass, setCadetClass] = useState('1CL');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('Full Duty');
  const [requests, setRequests] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const storedRequests = localStorage.getItem('s1_leave_requests');
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    }
    const storedDates = localStorage.getItem('s1_privilege_dates');
    if (storedDates) {
      const dates = JSON.parse(storedDates);
      setPrivilegeDates(dates);
      if (dates.length > 0) {
        setDate(dates[0]); // Default to first available date
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !cadetClass || !lastName) {
      alert('Please fill out all fields.');
      return;
    }

    const newRequest = {
      id: Date.now(),
      date,
      cadetClass,
      lastName,
      status,
      timestamp: new Date().toLocaleString()
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    localStorage.setItem('s1_leave_requests', JSON.stringify(updated));
    
    setDate('');
    setCadetClass('1CL');
    setLastName('');
    setStatus('Full Duty');
    
    setSuccessMsg('Request submitted successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id) => {
    const updated = requests.filter(r => r.id !== id);
    setRequests(updated);
    localStorage.setItem('s1_leave_requests', JSON.stringify(updated));
  };

  return (
    <div className="section-container" style={{ marginTop: '20px' }}>
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">📝</div>
          <div><h2>PRIVILEGE & LEAVE DUTY SIGN-UP</h2><p>SIGNIFY FOR S1 APPROVAL</p></div>
        </div>
      </div>
      
      <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
        {privilegeDates.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
            <i className="fa fa-calendar-xmark" style={{ fontSize: '30px', opacity: 0.5, marginBottom: '10px' }}></i>
            <p>No privileges have been announced at this time.</p>
          </div>
        ) : (
          <>
            {successMsg && <div style={{ color: '#39ff6e', marginBottom: '15px', fontWeight: 'bold' }}>{successMsg}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label>DATE OF PRIVILEGE / LEAVE</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  {privilegeDates.map(d => {
                    const [yearStr, monthStr, dayStr] = d.split('-');
                    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    const month = months[parseInt(monthStr, 10) - 1];
                    const day = parseInt(dayStr, 10);
                    const isSelected = date === d;

                    return (
                      <div 
                        key={d} 
                        onClick={() => setDate(d)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          padding: '16px',
                          border: isSelected ? '2px solid var(--accent-base)' : '1px solid var(--border)',
                          borderRadius: '16px',
                          background: isSelected ? 'rgba(26, 48, 30, 0.04)' : 'var(--card-bg)',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isSelected ? '0 4px 12px rgba(26, 48, 30, 0.08)' : 'none'
                        }}
                      >
                        <div className="event-date-badge" style={{ background: 'transparent', borderColor: isSelected ? 'var(--accent-base)' : 'var(--border)' }}>
                          <span className="d">{day}</span>
                          <span className="m">{month} {yearStr}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>
                            Upperclass Privilege
                          </h4>
                          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                            10:00 FDS cadets only
                          </p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="tag tag-green">ACTIVITY</span>
                            <span className="tag tag-green">S1</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
                    <div className="form-group">
                <label>CADET CLASS</label>
                <select 
                  className="glass-input"
                  style={{ width: '100%' }}
                  value={cadetClass} 
                  onChange={(e) => setCadetClass(e.target.value)}
                >
                  <option value="1CL">1CL</option>
                  <option value="2CL">2CL</option>
                  <option value="3CL">3CL</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>LAST NAME</label>
                <input 
                  type="text" 
                  className="glass-input"
                  style={{ width: '100%' }}
                  placeholder="Last Name"
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>STATUS</label>
                <select 
                  className="glass-input"
                  style={{ width: '100%' }}
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Full Duty">Full Duty</option>
                  <option value="Not Full Duty">Not Full Duty</option>
                </select>
              </div>
          
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                SUBMIT SIGNIFICATION
              </button>
            </form>
          </>
        )}
      </div>

      {requests.length > 0 && (
        <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>CLASS</th>
                  <th>LAST NAME</th>
                  <th>STATUS</th>
                  {isAdmin && <th>ACTION</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.cadetClass}</td>
                    <td>{r.lastName}</td>
                    <td>
                      <span className={`tag ${r.status === 'Full Duty' ? 'tag-green' : 'tag-gold'}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
