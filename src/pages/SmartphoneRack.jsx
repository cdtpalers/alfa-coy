import React, { useState, useEffect } from 'react';
import './SmartphoneRack.css';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQysEcov38gZR35RvnqLAGnVSNLLOYk_gnXHP9pkHOb5D5Fk-eUaOujsSrPzpdUA8IlQ5Vx6K5V0qdD/pub?gid=0&single=true&output=csv';

export default function SmartphoneRack() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(CSV_URL);
      if (!res.ok) throw new Error('Failed to fetch data');
      const text = await res.text();
      const parsedSlots = parseSmartphoneCSV(text);
      setSlots(parsedSlots);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load smartphone rack data. Please ensure you are online and the sheet is published.');
    } finally {
      setLoading(false);
    }
  };

  const parseSmartphoneCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    // The data starts after the 1CL header (usually row 2 in standard CSV, row 3 if row 1 is 1CL)
    // Looking at the fetched CSV:
    // Line 1: 1CL,,,,,,,,,,,,,
    // Line 2: NAME ,,BRAND,,SERIAL NUMBER,,MODEL,,COLOR,,RACK #,QUANTITY,REMARKS,STATUS
    // Line 3+: Data
    
    let dataStartIndex = 1;
    if (lines[0].includes('1CL')) {
      dataStartIndex = 2; // Data starts at index 2
    }

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

      // We know from the structure that:
      // cols[0] = NAME
      // cols[2] = BRAND
      // cols[6] = MODEL
      // cols[8] = COLOR
      // cols[10] = RACK #
      // cols[13] = STATUS

      const name = cols[0] || '';
      if (!name) continue; // Skip empty rows

      const brands = (cols[2] || '').split('/').map(s => s.trim());
      const models = (cols[6] || '').split(',').map(s => s.trim());
      const colors = (cols[8] || '').split(',').map(s => s.trim());
      const rackNumbers = (cols[10] || '').split('/').map(s => s.trim());
      const remarks = cols[12] || '';
      const status = (cols[13] || '').toUpperCase().includes('IN');

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
        {slots.map((slot, idx) => (
          <div 
            key={`${slot.rackNumber}-${idx}`} 
            className={`rack-slot ${slot.status ? 'status-in' : 'status-out'}`}
          >
            <div className="slot-number">#{slot.rackNumber}</div>
            <i className={`fa fa-mobile-screen slot-icon`}></i>
            <div className="slot-info">
              <h4>{slot.name}</h4>
              <p>{slot.brand} {slot.model}</p>
              {slot.remarks && <p style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '6px', color: 'var(--accent-base)', fontWeight: 'bold' }}>{slot.remarks}</p>}
            </div>
            <div className="slot-status-badge">
              {slot.status ? 'IN (SURRENDERED)' : 'NOT IN'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
