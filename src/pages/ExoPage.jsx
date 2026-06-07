import React, { useState, useEffect } from 'react';

const EXO_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOiJzXdmxDYEy4KaOEqViF6jqne0Y0wWIEL-9chZPwRHvSJFOVewmAodu52kgRuSApvfIHDlS04Lfa/pub?gid=415706244&single=true&output=csv";
const MERIT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOiJzXdmxDYEy4KaOEqViF6jqne0Y0wWIEL-9chZPwRHvSJFOVewmAodu52kgRuSApvfIHDlS04Lfa/pub?gid=870226630&single=true&output=csv";

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
  const [activeTab, setActiveTab] = useState('punishments'); // 'punishments' or 'merits'

  const [punishments, setPunishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [merits, setMerits] = useState([]);
  const [meritLoading, setMeritLoading] = useState(true);
  const [meritError, setMeritError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch Punishments
      try {
        const res = await fetch(EXO_SHEET_URL);
        if (!res.ok) throw new Error('Failed to fetch punishment list: ' + res.status);
        const text = await res.text();
        
        const lines = text.trim().split('\n');
        // Data starts at row 8 (index 7)
        if (lines.length > 7) {
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
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

      // Fetch Merits
      try {
        const res = await fetch(MERIT_SHEET_URL);
        if (!res.ok) throw new Error('Failed to fetch merit list: ' + res.status);
        const text = await res.text();
        const lines = text.trim().split('\n');
        
        let headerIdx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toUpperCase().includes('NAME,CLASS I,CLASS II,CLASS III,CLASS IV')) {
            headerIdx = i;
            break;
          }
        }
        
        if (headerIdx !== -1) {
          const parsedMerits = [];
          let currentClass = 'UNKNOWN';
          
          for (let i = headerIdx + 1; i < lines.length; i++) {
            const row = parseCsvRow(lines[i]);
            const rowStr = row.join('').toUpperCase().replace(/,/g, ''); // strip commas just in case
            
            if (rowStr === '1CL') { currentClass = '1CL'; continue; }
            if (rowStr === '2CL') { currentClass = '2CL'; continue; }
            if (rowStr === '3CL') { currentClass = '3CL'; continue; }
            if (rowStr === '4CL') { currentClass = '4CL'; continue; }

            const name = row[0];
            const totalDemerits = row[5];
            
            if (!name && !totalDemerits) continue; // empty row

            parsedMerits.push({
              name: name || 'UNKNOWN',
              classType: currentClass,
              class1: row[1] || '0',
              class2: row[2] || '0',
              class3: row[3] || '0',
              class4: row[4] || '0',
              totalDemerits: totalDemerits || '0',
              remainingMerits: row[6] || '0'
            });
          }
          setMerits(parsedMerits);
        }
      } catch (err) {
        setMeritError(err.message);
      } finally {
        setMeritLoading(false);
      }
    }

    fetchData();
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

      <div className="tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'punishments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('punishments')}
          style={{ flex: 1 }}
        >
          <i className="fa fa-list" style={{ marginRight: '8px' }}></i> Punishment List
        </button>
        <button 
          className={`btn ${activeTab === 'merits' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('merits')}
          style={{ flex: 1 }}
        >
          <i className="fa fa-chart-line" style={{ marginRight: '8px' }}></i> Merit Allowance Tracker
        </button>
      </div>

      <div className="panel glass" style={{ padding: '20px', overflowX: 'auto' }}>
        {activeTab === 'punishments' && (
          <>
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
                  {punishments.map((p, idx) => {
                    const total = parseFloat(p.totalHours) || 0;
                    const rem = parseFloat(p.remainingHours) || 0;
                    const served = total - rem;
                    const progress = total > 0 ? Math.max(0, Math.min(100, (served / total) * 100)) : 0;
                    
                    return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 8px' }}>{p.no}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className={`tag ${
                            p.rank.toUpperCase().includes('1CL') ? 'tag-blue' : 
                            p.rank.toUpperCase().includes('2CL') ? 'tag-red' : 
                            p.rank.toUpperCase().includes('3CL') ? 'tag-gold' : 
                            p.rank.toUpperCase().includes('4CL') ? 'tag-green' : 'tag-orange'
                          }`} style={{ fontSize: '10px', padding: '2px 8px' }}>{p.rank}</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.lastName}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <span className="tag tag-red">YES</span>
                            {p.end && <span style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Until: {p.end}</span>}
                          </div>
                        ) : (
                          <span className="tag" style={{ background: 'var(--border)' }}>NO</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {total > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                              <span>{rem}h rem</span>
                              <span>{total}h</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--border-strong)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #81FBB8 0%, #28C76F 100%)', borderRadius: '3px', transition: 'width 0.3s' }}></div>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '12px' }}>
                        {p.remarks}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === 'merits' && (
          <>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: 'var(--text-main)', letterSpacing: '1px' }}>
              REMAINING MERIT ALLOWANCE
            </h3>
            
            {meritLoading && <p>Loading merit list from Google Sheets...</p>}
            {meritError && <p style={{ color: 'var(--danger)' }}>Error: {meritError}</p>}
            
            {!meritLoading && !meritError && merits.length === 0 && (
              <p>No merit records to display.</p>
            )}

            {!meritLoading && !meritError && merits.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 8px' }}>NAME</th>
                    <th style={{ padding: '12px 8px' }}>CLASS</th>
                    <th style={{ padding: '12px 8px' }}>CL I</th>
                    <th style={{ padding: '12px 8px' }}>CL II</th>
                    <th style={{ padding: '12px 8px' }}>CL III</th>
                    <th style={{ padding: '12px 8px' }}>CL IV</th>
                    <th style={{ padding: '12px 8px' }}>TOTAL DEMERITS</th>
                    <th style={{ padding: '12px 8px' }}>REMAINING MERITS</th>
                  </tr>
                </thead>
                <tbody>
                  {merits.map((m, idx) => {
                    const demerits = parseFloat(m.totalDemerits) || 0;
                    const remaining = parseFloat(m.remainingMerits) || 0;
                    const maxMerits = demerits + remaining;
                    const progress = maxMerits > 0 ? Math.max(0, Math.min(100, (remaining / maxMerits) * 100)) : 0;

                    // Gradient changes color if it's very low
                    const isLow = progress < 40;
                    const gradient = isLow 
                      ? 'linear-gradient(90deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)' 
                      : 'linear-gradient(90deg, #81FBB8 0%, #28C76F 100%)';

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--text-main)' }}>{m.name}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`tag ${
                            m.classType === '1CL' ? 'tag-blue' : 
                            m.classType === '2CL' ? 'tag-red' : 
                            m.classType === '3CL' ? 'tag-gold' : 
                            m.classType === '4CL' ? 'tag-green' : 'tag-orange'
                          }`} style={{ fontSize: '10px', padding: '2px 8px' }}>{m.classType}</span>
                        </td>
                        <td style={{ padding: '12px 8px', color: m.class1 > 0 ? 'var(--danger)' : 'var(--text-dim)' }}>{m.class1}</td>
                        <td style={{ padding: '12px 8px', color: m.class2 > 0 ? 'var(--danger)' : 'var(--text-dim)' }}>{m.class2}</td>
                        <td style={{ padding: '12px 8px', color: m.class3 > 0 ? 'var(--danger)' : 'var(--text-dim)' }}>{m.class3}</td>
                        <td style={{ padding: '12px 8px', color: m.class4 > 0 ? 'var(--danger)' : 'var(--text-dim)' }}>{m.class4}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: m.totalDemerits > 0 ? 'var(--danger)' : 'var(--text-main)' }}>{m.totalDemerits}</td>
                        <td style={{ padding: '12px 8px' }}>
                          {maxMerits > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '120px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span style={{ fontWeight: 'bold', color: isLow ? 'var(--danger)' : 'var(--text-main)' }}>{remaining.toFixed(1)}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{maxMerits.toFixed(1)} max</span>
                              </div>
                              <div style={{ height: '6px', background: 'var(--border-strong)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: gradient, borderRadius: '3px', transition: 'width 0.3s' }}></div>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)' }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
