import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Custom hook to measure container width to prevent Recharts layout bugs
function useContainerWidth() {
  const ref = React.useRef(null);
  const [width, setWidth] = useState(0);
  const measure = React.useCallback(() => {
    if (ref.current) setWidth(ref.current.offsetWidth);
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);
  const setRef = React.useCallback(node => {
    ref.current = node;
    if (node) setWidth(node.offsetWidth);
  }, []);
  return [setRef, width];
}

const NEXUS_COLORS = ['#5e35b1', '#1e88e5', '#00acc1', '#fb8c00', '#eb5757', '#43a047'];

const PFT_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSrOXovW06ybPTXk2aowRa0WM7mH1_KmrmbRGbRTD1LFIuos2jWhSoW-5A6CkY4VQt1XQfghwphgjHf/pub?gid=0&single=true&output=csv';

export default function PFTTracker() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [barRef, barWidth] = useContainerWidth();
  const [rawBarRef, rawBarWidth] = useContainerWidth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeClass, setActiveClass] = useState('ALL');
  
  useEffect(() => {
    Papa.parse(PFT_CSV_URL, {
      download: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data;
          const parsedData = [];
          let currentClass = 'Unknown';
          
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            const name = r[0]?.trim();

            if (name && name.match(/^[1-4]CL$/i)) {
              currentClass = name.toUpperCase();
              continue;
            }

            const remarks = r[10]?.trim()?.toUpperCase() || '';
            const avgScoreStr = r[9]?.trim() || '0';
            const avgScore = parseFloat(avgScoreStr);
            
            // Skip headers, empty names
            if (!name || name === 'NAME') continue;
            // Additional check: valid rows usually have a numerical score or a pass/fail remark
            if (isNaN(avgScore) && remarks !== 'PASSED' && remarks !== 'FAILED') continue;
            
            parsedData.push({
              name,
              cls: currentClass,
              pushupCount: r[1]?.trim() || '-',
              pushupScore: parseFloat(r[2]) || 0,
              situpCount: r[3]?.trim() || '-',
              situpScore: parseFloat(r[4]) || 0,
              pullupCount: r[5]?.trim() || '-',
              pullupScore: parseFloat(r[6]) || 0,
              runTime: r[7]?.trim() || '-',
              runScore: parseFloat(r[8]) || 0,
              avgScore: avgScore || 0,
              remarks: remarks === 'PASSED' || remarks === 'FAILED' ? remarks : 'PENDING'
            });
          }
          setData(parsedData);
          setLoading(false);
        } catch (e) {
          console.error(e);
          setErrorMsg("Failed to parse PFT data.");
          setLoading(false);
        }
      },
      error: (error) => {
        console.error("PapaParse error:", error);
        setErrorMsg("Failed to fetch PFT data. Check your connection or the Google Sheets link.");
        setLoading(false);
      }
    });
  }, []);

  const stats = useMemo(() => {
    let passed = 0;
    let failed = 0;
    let above85 = 0;
    
    let sumPushup = 0, sumSitup = 0, sumPullup = 0, sumRun = 0;
    let countPushup = 0, countSitup = 0, countPullup = 0, countRun = 0;
    
    let sumPCount = 0, sumSCount = 0, sumPlCount = 0, sumRSec = 0;
    let numPCount = 0, numSCount = 0, numPlCount = 0, numRSec = 0;

    const parseTime = (str) => {
      if (!str || str === '-') return 0;
      const c = str.replace(/[^0-9]/g, '');
      if (c.length === 4) return parseInt(c.substring(0, 2)) * 60 + parseInt(c.substring(2));
      if (c.length === 3) return parseInt(c.substring(0, 1)) * 60 + parseInt(c.substring(1));
      return parseInt(c) || 0;
    };

    data.forEach(d => {
      if (d.remarks === 'PASSED') passed++;
      if (d.remarks === 'FAILED') failed++;
      if (d.avgScore >= 8.5) above85++;
      
      if (d.pushupScore > 0) { sumPushup += d.pushupScore; countPushup++; }
      if (d.situpScore > 0) { sumSitup += d.situpScore; countSitup++; }
      if (d.pullupScore > 0) { sumPullup += d.pullupScore; countPullup++; }
      if (d.runScore > 0) { sumRun += d.runScore; countRun++; }
      
      const p = parseInt(d.pushupCount); if (!isNaN(p)) { sumPCount += p; numPCount++; }
      const s = parseInt(d.situpCount); if (!isNaN(s)) { sumSCount += s; numSCount++; }
      const pl = parseInt(d.pullupCount); if (!isNaN(pl)) { sumPlCount += pl; numPlCount++; }
      const r = parseTime(d.runTime); if (r > 0) { sumRSec += r; numRSec++; }
    });

    return {
      total: data.length,
      passed,
      failed,
      above85,
      passRate: data.length > 0 ? ((passed / data.length) * 100).toFixed(1) : 0,
      avgPushup: countPushup > 0 ? (sumPushup / countPushup).toFixed(1) : 0,
      avgSitup: countSitup > 0 ? (sumSitup / countSitup).toFixed(1) : 0,
      avgPullup: countPullup > 0 ? (sumPullup / countPullup).toFixed(1) : 0,
      avgRun: countRun > 0 ? (sumRun / countRun).toFixed(1) : 0,
      rawPushup: numPCount > 0 ? (sumPCount / numPCount).toFixed(1) : 0,
      rawSitup: numSCount > 0 ? (sumSCount / numSCount).toFixed(1) : 0,
      rawPullup: numPlCount > 0 ? (sumPlCount / numPlCount).toFixed(1) : 0,
      rawRunSec: numRSec > 0 ? sumRSec / numRSec : 0,
    };
  }, [data]);

  const chartData = useMemo(() => {
    return [
      { name: 'Push Up', value: parseFloat(stats.avgPushup) || 0 },
      { name: 'Sit Up', value: parseFloat(stats.avgSitup) || 0 },
      { name: 'Pull Up', value: parseFloat(stats.avgPullup) || 0 },
      { name: '3.2km Run', value: parseFloat(stats.avgRun) || 0 }
    ];
  }, [stats]);

  const rawChartData = useMemo(() => {
    const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };
    return [
      { name: 'Push Up', value: parseFloat(stats.rawPushup) || 0, displayVal: `${stats.rawPushup} reps` },
      { name: 'Sit Up', value: parseFloat(stats.rawSitup) || 0, displayVal: `${stats.rawSitup} reps` },
      { name: 'Pull Up', value: parseFloat(stats.rawPullup) || 0, displayVal: `${stats.rawPullup} reps` },
      { name: '3.2km Run', value: parseFloat((stats.rawRunSec / 60).toFixed(2)) || 0, displayVal: formatTime(stats.rawRunSec) }
    ];
  }, [stats]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', margin: 0 }}>{label}</p>
          <p style={{ fontSize: '12px', fontWeight: 600, color: payload[0].fill, margin: 0 }}>
            {payload[0].payload.displayVal || payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const generativeInsight = useMemo(() => {
    if (data.length === 0) return "No data available.";
    
    // Find strongest and weakest events
    const events = [...chartData].sort((a, b) => b.value - a.value);
    const strongest = events[0]?.name;
    const weakest = events[events.length - 1]?.name;
    
    let text = `ALFA Company has a ${stats.passRate}% pass rate for the current Physical Fitness Test. `;
    if (stats.above85 > 0) {
      text += `${stats.above85} cadets achieved an outstanding grade of 8.5 or higher. `;
    }
    if (strongest && weakest && events[0].value > 0) {
      text += `The company's strongest event is the ${strongest} (avg ${events[0].value}), while the ${weakest} (avg ${events[events.length - 1].value}) requires more focused training. `;
    }
    if (stats.failed > 0) {
      text += `Targeted remedial training is recommended for the ${stats.failed} cadets who failed to meet the passing standards.`;
    } else {
      text += `Excellent overall performance with zero failures currently recorded.`;
    }
    return text;
  }, [data, stats, chartData]);

  const filteredData = useMemo(() => {
    let result = data;
    if (activeClass !== 'ALL') {
      result = result.filter(d => d.cls === activeClass);
    }
    if (searchTerm) {
      result = result.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return result;
  }, [data, searchTerm, activeClass]);

  if (loading) {
    return (
      <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }}>🏃</div>
        <p style={{ color: 'var(--text-muted)' }}>Fetching PFT data from records...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚠️</div>
        <p style={{ color: 'var(--danger)', fontWeight: 500 }}>{errorMsg}</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px' }}>
      
      {/* ── GENERATIVE INSIGHTS ── */}
      <div className="nexus-insights-box">
        <div className="nexus-insights-icon">
          <i className="fa-solid fa-lightbulb"></i>
        </div>
        <div className="nexus-insights-content">
          <div className="nexus-insights-title">
            <i className="fa-solid fa-sparkles"></i> AI Generated Insights
          </div>
          <div className="nexus-insights-text">
            {generativeInsight}
          </div>
        </div>
      </div>

      {/* ── METRICS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        <div className="nexus-card">
          <div className="nexus-metric-title">
            <div className="nexus-metric-icon"><i className="fa-solid fa-users"></i></div>
            Total Cadets
          </div>
          <div className="nexus-metric-value-row">
            <div className="nexus-metric-value">{stats.total}</div>
          </div>
        </div>

        <div className="nexus-card">
          <div className="nexus-metric-title">
            <div className="nexus-metric-icon" style={{ color: '#43a047', background: 'rgba(67, 160, 71, 0.1)' }}><i className="fa-solid fa-check"></i></div>
            Passed
          </div>
          <div className="nexus-metric-value-row">
            <div className="nexus-metric-value">{stats.passed}</div>
            <div className="nexus-trend up">{stats.passRate}%</div>
          </div>
        </div>

        <div className="nexus-card">
          <div className="nexus-metric-title">
            <div className="nexus-metric-icon" style={{ color: '#eb5757', background: 'rgba(235, 87, 87, 0.1)' }}><i className="fa-solid fa-xmark"></i></div>
            Failed
          </div>
          <div className="nexus-metric-value-row">
            <div className="nexus-metric-value">{stats.failed}</div>
          </div>
        </div>

        <div className="nexus-card">
          <div className="nexus-metric-title">
            <div className="nexus-metric-icon" style={{ color: '#fb8c00', background: 'rgba(251, 140, 0, 0.1)' }}><i className="fa-solid fa-star"></i></div>
            Outstanding (≥8.5)
          </div>
          <div className="nexus-metric-value-row">
            <div className="nexus-metric-value">{stats.above85}</div>
          </div>
        </div>

      </div>

      {/* ── EVENT AVERAGES CHART ── */}
      <div className="nexus-card" style={{ marginBottom: '24px' }} ref={barRef}>
        <div className="nexus-chart-header">
          <div className="nexus-chart-title">
            <i className="fa-solid fa-chart-column" style={{ color: '#1e88e5' }}></i>
            Average Scores per Event
          </div>
        </div>
        <div style={{ width: '100%', height: '280px', paddingTop: '16px' }}>
           {chartData.length > 0 && barWidth > 0 ? (
              <BarChart width={barWidth - 48} height={250} data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} domain={[0, 10]} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--surface-active)' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}
                  labelStyle={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={NEXUS_COLORS[index % NEXUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
           ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
                {barWidth === 0 ? 'Loading chart...' : 'No data to display.'}
              </div>
           )}
        </div>
      </div>

      {/* ── RAW PERFORMANCE AVERAGES CHART ── */}
      <div className="nexus-card" style={{ marginBottom: '24px' }} ref={rawBarRef}>
        <div className="nexus-chart-header">
          <div className="nexus-chart-title">
            <i className="fa-solid fa-dumbbell" style={{ color: '#43a047' }}></i>
            Average Performance (Repetitions / Time)
          </div>
        </div>
        <div style={{ width: '100%', height: '280px', paddingTop: '16px' }}>
           {rawChartData.length > 0 && rawBarWidth > 0 ? (
              <BarChart width={rawBarWidth - 48} height={250} data={rawChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-active)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {rawChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={NEXUS_COLORS[index % NEXUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
           ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
                {rawBarWidth === 0 ? 'Loading chart...' : 'No data to display.'}
              </div>
           )}
        </div>
      </div>

      {/* ── CADET DATA TABLE ── */}
      <div className="nexus-card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-active)', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Detailed PFT Results</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', '1CL', '2CL', '3CL', '4CL'].map(cls => (
                <button
                  key={cls}
                  onClick={() => setActiveClass(cls)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: activeClass === cls ? '1px solid #1e88e5' : '1px solid var(--border)',
                    background: activeClass === cls ? 'rgba(30, 136, 229, 0.1)' : 'transparent',
                    color: activeClass === cls ? '#1e88e5' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
          <div className="search-bar" style={{ width: '250px' }}>
             <i className="fa fa-search"></i>
             <input 
               type="text" 
               placeholder="Search cadet name..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="glass-input"
               style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px' }}
             />
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="nexus-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 24px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Cadet Name</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Push Up</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sit Up</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pull Up</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>3.2km</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Average</th>
                <th style={{ padding: '12px 24px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', ':hover': { background: 'var(--surface-active)' } }}>
                  <td style={{ padding: '12px 24px', fontWeight: 600, color: 'var(--text)' }}>
                    {d.name}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>{d.cls}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text)' }}>{d.pushupCount}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scr: {d.pushupScore}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text)' }}>{d.situpCount}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scr: {d.situpScore}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text)' }}>{d.pullupCount}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scr: {d.pullupScore}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text)' }}>{d.runTime}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scr: {d.runScore}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold', color: d.avgScore >= 8.5 ? '#fb8c00' : 'var(--text)' }}>
                    {d.avgScore.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 24px' }}>
                    {d.remarks === 'PASSED' ? (
                      <span className="nexus-badge" style={{ background: 'rgba(67, 160, 71, 0.1)', color: '#43a047', border: '1px solid rgba(67,160,71,0.2)' }}>PASSED</span>
                    ) : d.remarks === 'FAILED' ? (
                      <span className="nexus-badge" style={{ background: 'rgba(235, 87, 87, 0.1)', color: '#eb5757', border: '1px solid rgba(235,87,87,0.2)' }}>FAILED</span>
                    ) : (
                      <span className="nexus-badge" style={{ background: 'rgba(100, 100, 100, 0.1)', color: 'var(--text-muted)' }}>PENDING</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No cadets found matching search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
