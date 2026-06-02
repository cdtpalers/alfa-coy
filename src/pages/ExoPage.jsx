import React, { useState, useEffect } from 'react';

const EXO_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOiJzXdmxDYEy4KaOEqViF6jqne0Y0wWIEL-9chZPwRHvSJFOVewmAodu52kgRuSApvfIHDlS04Lfa/pub?gid=415706244&single=true&output=csv";

function parseCsvRow(line) {
  const vals = [];
  let cur = '', inQ = false;
  for (let ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  vals.push(cur.trim());
  return vals;
}

export default function ExoPage() {
  const [punishments, setPunishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPunishments() {
      try {
        const res = await fetch(EXO_SHEET_URL);
        if (!res.ok) throw new Error('Failed to fetch punishment list: ' + res.status);
        const text = await res.text();
        
        const lines = text.trim().split('\n');
        // Data starts at row 8 (index 7)
        if (lines.length <= 7) throw new Error('Invalid sheet structure');

        const parsedData = [];
        for (let i = 7; i < lines.length; i++) {
          const row = parseCsvRow(lines[i]);
          
          // Skip if LAST NAME is empty
          if (!row[2]) continue;

          parsedData.push({
            no: row[0] || '',
            rank: row[1] || '',
            lastName: row[2] || '',
            offense: row[3] || '',
            classType: row[4] || '',
            nature: row[5] || '',
            demerits: row[6] || '0',
            confined: row[7] || 'No',
            start: row[8] || '',
            end: row[9] || '',
            totalHours: row[10] || '0',
            convertedHours: row[11] || '0',
            servedHours: row[12] || '0',
            remainingHours: row[13] || '0',
            reference: row[14] || '',
            remarks: row[15] || ''
          });
        }
        
        setPunishments(parsedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPunishments();
  }, []);

  const totalPunishments = punishments.length;
  const totalConfined = punishments.filter(p => p.confined.toLowerCase() === 'yes').length;

  return (
    <div className="page active" id="page-exo">
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">⚖️</div>
          <div>
            <h2>EXECUTIVE OFFICER</h2>
            <p>COMPANY PUNISHMENT & DELINQUENCY LIST</p>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '20px' }}>
        <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>TOTAL DELINQUENT <i className="fa fa-users" style={{ marginLeft: '4px' }}></i></div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{loading ? '-' : totalPunishments}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Active Punishments</div>
        </div>
        <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>CONFINED <i className="fa fa-lock" style={{ marginLeft: '4px' }}></i></div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--danger)', lineHeight: 1 }}>{loading ? '-' : totalConfined}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Currently Serving Confinement</div>
        </div>
      </div>

      <div className="panel glass" style={{ padding: '20px', overflowX: 'auto' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: 'var(--text-main)', letterSpacing: '1px' }}>
          ACTIVE PUNISHMENTS
        </h3>
        
        {loading && <p>Loading punishment list from Google Sheets...</p>}
        {error && <p style={{ color: 'var(--danger)' }}>Error: {error}</p>}
        
        {!loading && !error && punishments.length === 0 && (
          <p>No active punishments to display.</p>
        )}

        {!loading && !error && punishments.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 8px' }}>NO</th>
                <th style={{ padding: '12px 8px' }}>RANK & NAME</th>
                <th style={{ padding: '12px 8px' }}>CLASS</th>
                <th style={{ padding: '12px 8px' }}>DEMERITS</th>
                <th style={{ padding: '12px 8px' }}>CONFINED</th>
                <th style={{ padding: '12px 8px' }}>TOURING (REM)</th>
                <th style={{ padding: '12px 8px' }}>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {punishments.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 8px' }}>{p.no}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.rank} {p.lastName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.offense}>
                      {p.offense}
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className="tag" style={{ background: 'var(--surface-active)' }}>{p.classType}</span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {p.demerits > 0 ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{p.demerits}</span>
                    ) : '0'}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {p.confined.toLowerCase() === 'yes' ? (
                      <span className="tag tag-red">YES</span>
                    ) : (
                      <span className="tag" style={{ background: 'var(--border)' }}>NO</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {p.remainingHours} / {p.totalHours} hr
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '12px' }}>
                    {p.remarks}
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
