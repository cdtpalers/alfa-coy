import React, { useState, useEffect, useMemo } from 'react';

export default function RosterPage() {
  const [rosterData, setRosterData] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 8, direction: 'asc' }); // Index 8 is Class

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

  const sortedRosterData = useMemo(() => {
    let sortableItems = [...rosterData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
        const bVal = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [rosterData, sortConfig]);

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
    <div className="page active" id="page-roster">
      <div className="glass council-hero" style={{borderLeftColor: 'var(--g1)'}}>
        <div className="council-crest">👥</div>
        <div className="council-info">
          <h2>ALFA COMPANY ROSTER</h2>
          <p>LIVE CADET DATASHEET</p>
          <div className="council-mission">Official master list and personnel records of ALFA Company cadets.</div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">📋</div>
          <div><h2>ROSTER DATA</h2><p>SORTABLE PERSONNEL LIST</p></div>
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
                {sortedRosterData.map((r, i) => (
                  <tr key={i}>
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
                {sortedRosterData.length === 0 && (
                  <tr>
                    <td colSpan={ROSTER_HEADERS.length} style={{textAlign: 'center', padding: '30px'}}>No roster data found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
