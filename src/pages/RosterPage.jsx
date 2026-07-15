import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

export default function RosterPage() {
  const [rosterData, setRosterData] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 8, direction: 'asc' }); // Index 8 is Class
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // SOI Modal state
  const [selectedCadet, setSelectedCadet] = useState(null);

  const ROSTER_HEADERS = [
    'Seq', 'ID', 'Last Name', 'First Name', 'Middle Name', 'Extension', 'Branch', 'AFPSN', 'Class', 'Company', 
    'Sex', 'Birthdate', 'Age', 'Height', 'Weight', 'Contact Number', 'Blood Type', 'Religion', 'Tribe', 
    'Educational Attainment', 'Degree/Course', 'Home Address', 'Region', 'Honors', 'College Name', 
    'High School Name', 'Special Skills', 'Extracurricular', 'Affiliation', 'Emergency Contact Name', 'Relationship', 
    'Emergency Address', 'Emergency Contact No', 'Father Name', 'Father Occupation', 'Father Contact', 
    'Mother Name', 'Mother Occupation', 'Mother Contact', 'Living w/ Parents', 'Sibling in AFP', 'Family Income'
  ];

  const handleSort = (keyIndex) => {
    let direction = 'asc';
    if (sortConfig.key === keyIndex && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: keyIndex, direction });
  };

  const filteredAndSortedRoster = useMemo(() => {
    let items = [...rosterData];

    // Filter by search query (Last Name [2], First Name [3], AFPSN [7])
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(r => {
        const lastName = (r[2] || '').toLowerCase();
        const firstName = (r[3] || '').toLowerCase();
        const afpsn = (r[7] || '').toLowerCase();
        return lastName.includes(q) || firstName.includes(q) || afpsn.includes(q);
      });
    }

    if (sortConfig !== null) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
        const bVal = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [rosterData, sortConfig, searchQuery]);

  useEffect(() => {
    setLoadingRoster(true);
    fetch('/roster.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const parsed = lines.map(line => {
          const vals = [];
          let cur='', inQ=false;
          for (let ch of line) {
            if (ch==='"' ) { inQ=!inQ; }
            else if (ch===',' && !inQ) { vals.push(cur.trim()); cur=''; }
            else cur+=ch;
          }
          vals.push(cur.trim());
          return vals;
        }).filter(row => row.length > 10);
        setRosterData(parsed);
        setLoadingRoster(false);
      })
      .catch(err => {
        console.error('Failed to load roster:', err);
        setLoadingRoster(false);
      });
  }, []);

  return (
    <div className="roster-widget fade-in" id="page-roster">

      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div className="section-title" style={{ margin: 0 }}>
          <div className="section-icon">📋</div>
          <div><h2>ROSTER DATA & SOI</h2><p>SUMMARY OF INFORMATION GENERATOR</p></div>
        </div>

        <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
          <i className="fa-solid fa-search" style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }}></i>
          <input 
            type="text" 
            placeholder="Search Surname, First Name, or AFPSN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--glass-bg)', color: 'var(--text)', fontSize: '14px', outline: 'none', backdropFilter: 'blur(10px)' }}
          />
        </div>
      </div>

      <div className="glass" style={{padding: 0, overflow: 'hidden', height: 'calc(100vh - 260px)', display: 'flex', flexDirection: 'column'}}>
        {loadingRoster ? (
          <div style={{padding: '40px', textAlign: 'center'}}>
            <i className="fa fa-spinner fa-spin" style={{marginRight: '10px'}}></i>
            Loading Roster Data...
          </div>
        ) : (
          <div className="data-table-wrap" style={{ flex: 1, maxHeight: 'none', borderRadius: 0, border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {ROSTER_HEADERS.map((header, idx) => (
                    <th 
                      key={idx} 
                      onClick={() => handleSort(idx)}
                      className={sortConfig.key === idx ? 'sorted-col' : ''}
                      style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span>{header}</span>
                        <i 
                          className={`fa-solid ${sortConfig.key === idx ? (sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} 
                          style={{ opacity: sortConfig.key === idx ? 1 : 0.3 }}
                        ></i>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRoster.map((r, i) => (
                  <tr 
                    key={i} 
                    onClick={() => setSelectedCadet(r)}
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-active)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    title="Click to view full SOI Profile"
                  >
                    {ROSTER_HEADERS.map((_, idx) => {
                      let val = r[idx] || '—';
                      let content = val;
                      if (idx === 6 && val !== '—') content = <span className="tag tag-gold">{val}</span>;
                      else if (idx === 8 && val !== '—') {
                        let classColor = 'tag-green';
                        if (val === '1CL' || val === '2024') classColor = 'tag-gold';
                        else if (val === '2CL' || val === '2025') classColor = 'tag-blue';
                        else if (val === '3CL' || val === '2026') classColor = 'tag-green';
                        else if (val === '4CL' || val === '2027') classColor = 'tag-red';
                        content = <span className={`tag ${classColor}`}>{val}</span>;
                      }
                      else if (idx === 10 && val !== '—') content = <span className={`tag ${val.toUpperCase() === 'MALE' ? 'tag-blue' : 'tag-red'}`}>{val}</span>;
                      else if (idx === 2) content = <strong>{val}</strong>;
                      
                      return (
                        <td key={idx} style={{ whiteSpace: 'nowrap' }}>
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {filteredAndSortedRoster.length === 0 && (
                  <tr>
                    <td colSpan={ROSTER_HEADERS.length} style={{textAlign: 'center', padding: '30px', color: 'var(--text-muted)'}}>
                      No cadets found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── SOI MODAL OVERLAY ─── */}
      {selectedCadet && typeof document !== 'undefined' && createPortal(
        <div 
          className="fade-in"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}
          onClick={() => setSelectedCadet(null)}
        >
          <div 
            className="glass" 
            style={{ width: '100%', maxWidth: '900px', padding: 0, overflow: 'hidden', position: 'relative', cursor: 'default' }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-active)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-solid fa-id-card" style={{ fontSize: '24px', color: 'var(--accent-base)' }}></i>
                <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '1px' }}>SUMMARY OF INFORMATION</h2>
              </div>
              <button 
                onClick={() => setSelectedCadet(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px', maxHeight: '75vh', overflowY: 'auto' }}>
              
              <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <img 
                  src={`/${(selectedCadet[2] || '').toLowerCase().replace(/\s/g, '')}.webp`} 
                  alt="Cadet Portrait"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/logo.webp'; }}
                  style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface-active)' }}
                />
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {selectedCadet[2]}, {selectedCadet[3]} {selectedCadet[4] ? selectedCadet[4][0] + '.' : ''} {selectedCadet[5] || ''}
                    </h1>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <span className="tag tag-gold" style={{ fontSize: '14px', padding: '6px 12px' }}><i className="fa-solid fa-fingerprint" style={{marginRight:'6px'}}></i>{selectedCadet[7] || 'NO AFPSN'}</span>
                    <span className="tag tag-blue" style={{ fontSize: '14px', padding: '6px 12px' }}><i className="fa-solid fa-star" style={{marginRight:'6px'}}></i>{selectedCadet[8] || 'NO CLASS'}</span>
                    <span className="tag tag-green" style={{ fontSize: '14px', padding: '6px 12px' }}><i className="fa-solid fa-shield" style={{marginRight:'6px'}}></i>{selectedCadet[9] || 'NO COY'} COY</span>
                    <span className="tag" style={{ background: 'var(--surface-active)', color: 'var(--text)', fontSize: '14px', padding: '6px 12px' }}>{selectedCadet[6] || 'NO BRANCH'}</span>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                
                {/* Personal Information */}
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--accent-base)' }}><i className="fa-solid fa-user" style={{marginRight:'8px'}}></i>Personal Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Sex</span> <strong style={{ textTransform: 'uppercase' }}>{selectedCadet[10]}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Birthdate (Age)</span> <strong>{selectedCadet[11]} ({selectedCadet[12]} yrs)</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Height / Weight</span> <strong>{selectedCadet[13]} cm / {selectedCadet[14]} kg</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Blood Type</span> <strong>{selectedCadet[16]}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Religion</span> <strong>{selectedCadet[17]}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Tribe</span> <strong>{selectedCadet[18]}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Contact Number</span> <strong style={{ fontFamily: "'Share Tech Mono', monospace" }}>{selectedCadet[15]}</strong></div>
                  </div>
                </div>

                {/* Educational Background */}
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--accent-base)' }}><i className="fa-solid fa-graduation-cap" style={{marginRight:'8px'}}></i>Educational Background</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Highest Attainment</span> <strong>{selectedCadet[19]}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Degree / Course</span> <strong style={{ textAlign: 'right', maxWidth: '200px' }}>{selectedCadet[20]}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>College Name</span> <strong style={{ textAlign: 'right', maxWidth: '200px' }}>{selectedCadet[24]}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>High School</span> <strong style={{ textAlign: 'right', maxWidth: '200px' }}>{selectedCadet[25]}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Academic Honors</span> <strong style={{ textAlign: 'right', maxWidth: '200px' }}>{selectedCadet[23] || 'N/A'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Special Skills</span> <strong style={{ textAlign: 'right', maxWidth: '200px' }}>{selectedCadet[26] || 'N/A'}</strong></div>
                  </div>
                </div>

                {/* Family Data */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--accent-base)' }}><i className="fa-solid fa-house-user" style={{marginRight:'8px'}}></i>Family & Background</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Home Address</span> <strong style={{ textAlign: 'right', maxWidth: '250px' }}>{selectedCadet[21]}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Region</span> <strong>{selectedCadet[22]}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Living with Parents?</span> <strong>{selectedCadet[39]}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Family Income</span> <strong>{selectedCadet[41]}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Sibling in AFP?</span> <strong>{selectedCadet[40] || 'No'}</strong></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Father</span> <strong style={{ textAlign: 'right' }}>{selectedCadet[33]}<br/><span style={{fontSize:'12px', color:'var(--text-muted)', fontWeight:400}}>{selectedCadet[34]} • {selectedCadet[35]}</span></strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Mother</span> <strong style={{ textAlign: 'right' }}>{selectedCadet[36]}<br/><span style={{fontSize:'12px', color:'var(--text-muted)', fontWeight:400}}>{selectedCadet[37]} • {selectedCadet[38]}</span></strong></div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ background: 'rgba(235, 87, 87, 0.05)', border: '1px solid rgba(235, 87, 87, 0.2)', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#eb5757', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-truck-medical"></i> Emergency Contact
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Name</div>
                        <div style={{ fontWeight: 600 }}>{selectedCadet[29]}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Relationship</div>
                        <div style={{ fontWeight: 600 }}>{selectedCadet[30]}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact Number</div>
                        <div style={{ fontWeight: 600, fontFamily: "'Share Tech Mono', monospace" }}>{selectedCadet[32]}</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</div>
                        <div style={{ fontWeight: 600 }}>{selectedCadet[31]}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      , document.body)}

    </div>
  );
}
