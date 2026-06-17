import React, { useState, useEffect } from 'react';
import './SmartphoneRack.css';

const URL_1CL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQysEcov38gZR35RvnqLAGnVSNLLOYk_gnXHP9pkHOb5D5Fk-eUaOujsSrPzpdUA8IlQ5Vx6K5V0qdD/pub?gid=0&single=true&output=csv';
const URL_2CL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQysEcov38gZR35RvnqLAGnVSNLLOYk_gnXHP9pkHOb5D5Fk-eUaOujsSrPzpdUA8IlQ5Vx6K5V0qdD/pub?gid=1510726778&single=true&output=csv';
const URL_3CL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQysEcov38gZR35RvnqLAGnVSNLLOYk_gnXHP9pkHOb5D5Fk-eUaOujsSrPzpdUA8IlQ5Vx6K5V0qdD/pub?gid=148922328&single=true&output=csv';

export default function SmartphoneRack() {
  const [activeTab, setActiveTab] = useState('1CL');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const csvUrl = activeTab === '1CL' ? URL_1CL : activeTab === '2CL' ? URL_2CL : URL_3CL;
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error('Failed to fetch data');
      const text = await res.text();
      const parsedSlots = parseSmartphoneCSV(text, activeTab);
      setSlots(parsedSlots);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load smartphone rack data. Please ensure you are online and the sheet is published.');
    } finally {
      setLoading(false);
    }
  };

  const parseSmartphoneCSV = (text, classYear) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    let dataStartIndex = 1;
    if (lines[0].includes(classYear) || lines[0].includes('CL')) {
      dataStartIndex = 2; // Data starts at index 2
    }

    // Parse header to find column indices dynamically
    const headerLine = lines[dataStartIndex - 1];
    const headers = [];
    let curH = '', inQH = false;
    for (let ch of headerLine) {
      if (ch === '"') { inQH = !inQH; }
      else if (ch === ',' && !inQH) { headers.push(curH.trim().toUpperCase()); curH = ''; }
      else curH += ch;
    }
    headers.push(curH.trim().toUpperCase());

    const getIdx = (keyword, fallback) => {
      const idx = headers.findIndex(h => h.includes(keyword));
      return idx >= 0 ? idx : fallback;
    };
    
    const iName = getIdx('NAME', 0);
    const iBrand = getIdx('BRAND', 2);
    const iModel = getIdx('MODEL', 6);
    const iColor = getIdx('COLOR', 8);
    const iRack = getIdx('RACK', 10);
    const iRemarks = getIdx('REMARK', 11);
    const iStatus = getIdx('STATUS', 12);

    const parsedData = [];

    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const cols = [];
      let cur = '', inQ = false;
      for (let ch of line) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
      cols.push(cur.trim());

      const name = cols[iName] || '';
      if (!name) continue; // Skip empty rows

      const brands = (cols[iBrand] || '').split('/').map(s => s.trim());
      const models = (cols[iModel] || '').split(',').map(s => s.trim());
      const colors = (cols[iColor] || '').split(',').map(s => s.trim());
      const rackNumbers = (cols[iRack] || '').split('/').map(s => s.trim());
      const remarks = cols[iRemarks] || '';
      const status = (cols[iStatus] || '').trim().toUpperCase() === 'IN';

      // Handle multiple phones per cadet
      rackNumbers.forEach((rackNum, index) => {
        if (!rackNum) return;
        
        parsedData.push({
          rackNumber: parseInt(rackNum, 10) || rackNum,
          name: name,
          brand: brands[index] || brands[0] || 'Unknown',
          model: models[index] || models[0] || 'Unknown',
          color: colors[index] || colors[0] || '',
          remarks: remarks,
          status: status
        });
      });
    }

    // Sort by rack number numerically
    return parsedData.sort((a, b) => {
      const numA = parseInt(a.rackNumber, 10);
      const numB = parseInt(b.rackNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.rackNumber.toString().localeCompare(b.rackNumber.toString());
    });
  };

  if (loading && slots.length === 0) {
    return (
      <div className="rack-loading">
        <i className="fa fa-spinner fa-spin fa-3x" style={{marginBottom: '16px'}}></i>
        <p>Loading smartphone rack data...</p>
      </div>
    );
  }

  if (error && slots.length === 0) {
    return (
      <div className="rack-error">
        <i className="fa fa-triangle-exclamation"></i>
        <p>{error}</p>
      </div>
    );
  }

  const loggedInCount = slots.filter(s => s.status).length;
  const totalCount = slots.length;

  return (
    <div className="smartphone-rack-container fade-in">
      <div className="rack-header">
        <h2>Simulated Smartphone Rack</h2>
        <p>Live status of cadet smartphones. Updates automatically every 30 seconds.</p>
        
        <div className="rack-tabs" style={{ display: 'flex', gap: '10px', marginTop: '16px', marginBottom: '16px' }}>
          <button 
            className={`btn ${activeTab === '1CL' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('1CL')}
          >
            1CL Cadets
          </button>
          <button 
            className={`btn ${activeTab === '2CL' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('2CL')}
          >
            2CL Cadets
          </button>
          <button 
            className={`btn ${activeTab === '3CL' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('3CL')}
          >
            3CL Cadets
          </button>
        </div>
        
        <div className="rack-stats">
          <div className="stat-pill">
            <i className="fa fa-mobile-screen"></i>
            Total Devices: {totalCount}
          </div>
          <div className="stat-pill success">
            <i className="fa fa-check-circle"></i>
            Logged In: {loggedInCount}
          </div>
          <div className="stat-pill danger">
            <i className="fa fa-times-circle"></i>
            Not Logged In: {totalCount - loggedInCount}
          </div>
        </div>
      </div>

      <div className="rack-grid">
        {slots.map((slot, idx) => {
          const isIphone = slot.brand.toLowerCase().includes('apple') || slot.brand.toLowerCase().includes('iphone');
          const mockupClass = isIphone ? 'iphone-mockup' : 'android-mockup';
          const statusClass = slot.status ? 'status-in' : 'status-out';
          
          // Extract last name
          const nameParts = slot.name.trim().split(' ');
          const lastName = nameParts[nameParts.length - 1];
          
          // Generate an avatar based on initials
          const initial = lastName.charAt(0);
          const avatarUrl = `https://ui-avatars.com/api/?name=${initial}&background=${slot.status ? '047857' : '171822'}&color=fff&size=128&bold=true`;

          return (
            <div 
              key={`${slot.rackNumber}-${idx}`} 
              className={`phone-mockup ${mockupClass} ${statusClass}`}
            >
              {/* Hardware elements */}
              <div className="phone-buttons"></div>
              <div className="phone-power"></div>
              <div className="phone-home-indicator"></div>
              
              {isIphone ? <div className="dynamic-island"></div> : <div className="hole-punch"></div>}

              {/* Status Bar */}
              <div className="status-bar">
                <span>9:41</span>
                <div className="status-dot"></div>
              </div>

              {/* Content Area */}
              <div className="phone-content">
                <div className="avatar-container">
                  <img src={avatarUrl} alt={`${lastName} avatar`} />
                </div>
                
                <h4 className="cadet-name">{lastName}</h4>
                <div className="cadet-status-text">
                  {slot.status ? 'LOGGED IN' : 'LOGGED OUT'}
                </div>

                <div className="app-icons">
                  <div className="app-icon-wrapper">
                    <div className="app-icon">
                      <i className="fa fa-phone" style={{ color: slot.status ? '#fff' : '#aaa' }}></i>
                    </div>
                    <span>Phone</span>
                  </div>
                  <div className="app-icon-wrapper">
                    <div className="app-icon">
                      {isIphone ? (
                        <i className="fa fa-comment" style={{ color: slot.status ? '#3b82f6' : '#aaa' }}></i>
                      ) : (
                        <i className="fa fa-message" style={{ color: slot.status ? '#10b981' : '#aaa' }}></i>
                      )}
                    </div>
                    <span>{isIphone ? 'Signal' : 'Messages'}</span>
                  </div>
                </div>

                {!slot.status && slot.remarks && (
                  <div className="authorized-reason">
                    <div className="authorized-reason-title">Authorized Reason</div>
                    <div className="authorized-reason-text">{slot.remarks}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
