import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function AcademicDeficiencies() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const fetchDeficiencies = async () => {
      try {
        const url = import.meta.env.BASE_URL + 'week3_deficiencies.csv';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        
        if (text.trim().startsWith('<')) {
          console.error("Fetched HTML instead of CSV! Check your base URL or file path.");
          setLoading(false);
          return;
        }

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data;
            
            // Filter alfa company (usually 'A' or 'ALFA')
            const alfaRows = rows.filter(r => {
              const coyKey = Object.keys(r).find(k => k.trim().toLowerCase() === 'company');
              const coy = coyKey ? (r[coyKey] || '').trim().toUpperCase() : '';
              return coy === 'A' || coy === 'ALFA';
            });
            
            // Sort out per course
            const courseCounts = {};
            alfaRows.forEach(r => {
              const course = r.course_name || r.course || 'Unknown';
              if (!courseCounts[course]) courseCounts[course] = 0;
              courseCounts[course]++;
            });
            
            const chartData = Object.keys(courseCounts).map(key => ({
              name: key,
              value: courseCounts[key]
            })).sort((a, b) => b.value - a.value);
            
            // details per cadet
            const sortedDetails = [...alfaRows].sort((a, b) => {
              const cA = a.course_name || a.course || '';
              const cB = b.course_name || b.course || '';
              return cA.localeCompare(cB);
            });
            
            setData(chartData);
            setDetails(sortedDetails);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to fetch academic data:", err);
        setLoading(false);
      }
    };
    fetchDeficiencies();
  }, []);

  if (loading) {
    return <div className="glass" style={{padding: '40px', textAlign: 'center'}}>Loading academic deficiencies...</div>;
  }

  const COLORS = ['#1A301E', '#39ff6e', '#44aaff', '#ffd700', '#ff9944', '#aa88ff', '#ff88aa', '#dc3545'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text)' }}>{payload[0].name}</p>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Deficiencies: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="finance-dashboard" style={{ marginTop: '20px' }}>
      <div className="finance-metrics-grid" style={{ marginBottom: '20px' }}>
        <div className="finance-metric-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h4>Total Deficiencies</h4>
          <p>{details.length}</p>
        </div>
        <div className="finance-metric-card" style={{ borderLeft: '4px solid var(--accent-base)' }}>
          <h4>Affected Cadets</h4>
          <p>{new Set(details.map(d => d.cadet)).size}</p>
        </div>
        <div className="finance-metric-card" style={{ borderLeft: '4px solid var(--accent-light)' }}>
          <h4>Courses Affected</h4>
          <p>{data.length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <div className="finance-chart-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--text)', width: '100%' }}>Deficiencies by Course</h3>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', padding: '40px 0' }}>No deficiencies found for Alfa Company.</p>
          )}
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
            {data.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: COLORS[index % COLORS.length], borderRadius: '50%', marginRight: '6px' }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: '20px', maxHeight: '500px', overflowY: 'auto', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: 'var(--text)' }}>Cadet Roster (Sorted by Course)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {details.length > 0 ? details.map((d, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--surface-active)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text)' }}>{d.cadet}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{d.course} - {d.course_name}</div>
                </div>
                <div style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--danger)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                  Grade: {parseFloat(d.grade).toFixed(2)}
                </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', padding: '20px 0' }}>All clear! No deficient cadets.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
