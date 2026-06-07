import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinanceDashboard() {
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({ reserve: '', balance: '', emergencyPct: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const res = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQIKQFrBgVcm0eZJJEKqdu_wengdLW9fo4fmaZiJyq4DBDCWCgM8nHfPyBVbSkZMVQdy85Tb6gDriQV/pub?gid=1306784777&single=true&output=csv');
        const text = await res.text();
        
        Papa.parse(text, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data;
            let parsedMetrics = { reserve: '', balance: '', emergencyPct: '' };
            let parsedData = [];

            if (rows.length >= 5) {
              parsedMetrics.reserve = rows[2][3] || '';
              parsedMetrics.balance = rows[3][3] || '';
              parsedMetrics.emergencyPct = rows[4][3] || '';

              for (let i = 3; i < rows.length; i++) {
                const cat = rows[i][0];
                const amtStr = rows[i][1];
                if (cat && amtStr !== undefined && amtStr !== '') {
                  const amt = Math.abs(parseInt(amtStr.replace(/,/g, ''), 10));
                  if (!isNaN(amt) && amt > 0) {
                    parsedData.push({ name: cat, value: amt });
                  }
                }
              }
            }
            setMetrics(parsedMetrics);
            setData(parsedData);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to fetch finance data:", err);
        setLoading(false);
      }
    };
    fetchFinanceData();
  }, []);

  if (loading) {
    return <div className="glass" style={{padding: '40px', textAlign: 'center'}}>Loading finance data...</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text)' }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Amount: ₱{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="finance-dashboard">
      <div className="finance-metrics-grid">
        <div className="finance-metric-card">
          <h4>Reserve Fund</h4>
          <p>{metrics.reserve || '—'}</p>
        </div>
        <div className="finance-metric-card" style={{ borderLeft: '4px solid var(--accent-base)' }}>
          <h4>Current Balance</h4>
          <p>{metrics.balance || '—'}</p>
        </div>
        <div className="finance-metric-card">
          <h4>Emergency %</h4>
          <p>{metrics.emergencyPct || '—'}</p>
        </div>
      </div>

      <div className="finance-chart-container">
        <h3 style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--text)' }}>Fund Category Usage</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} tickMargin={10} />
            <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} tickFormatter={(val) => `₱${val/1000}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border)', opacity: 0.2 }} />
            <Bar dataKey="value" fill="var(--accent-base)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
