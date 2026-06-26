import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

function useContainerWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const measure = useCallback(() => {
    if (ref.current) setWidth(ref.current.offsetWidth);
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);
  const setRef = useCallback(node => {
    ref.current = node;
    if (node) setWidth(node.offsetWidth);
  }, []);
  return [setRef, width];
}

const NEXUS_COLORS = [
  '#5e35b1', '#1e88e5', '#00acc1', '#43a047', '#fdd835',
  '#fb8c00', '#e53935', '#8e24aa', '#3949ab'
];

const CLASS_ORDER = ['ALL', '1CL', '2CL', '3CL'];

export default function AcademicDeficiencies() {
  const [areaRef, areaWidth] = useContainerWidth();
  const [barRef, barWidth] = useContainerWidth();
  const [pieRef, pieWidth] = useContainerWidth();
  const [compBarRef, compBarWidth] = useContainerWidth();
  const [trendRef, trendWidth] = useContainerWidth();

  const [historicalData, setHistoricalData] = useState({});
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [activeView, setActiveView] = useState('compare'); // 'single', 'compare'
  const [activeWeek, setActiveWeek] = useState(null);

  // Filters & sorting for single-week view
  const [activeClass, setActiveClass] = useState('ALL');
  const [activeCourse, setActiveCourse] = useState('ALL');
  const [sortBy, setSortBy] = useState('course');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchCSV = async (weekNum) => {
      const filename = `week${weekNum}_deficiencies.csv`;
      const url = import.meta.env.BASE_URL + filename;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load ${filename} (HTTP ${res.status}).`);
      const text = await res.text();
      if (text.trim().startsWith('<')) throw new Error(`Received HTML instead of CSV for ${filename}.`);
      
      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data || [];
            const alfaRows = rows.filter(r => {
              const coyKey = Object.keys(r).find(k => k.trim().toLowerCase() === 'company');
              const coy = coyKey ? (r[coyKey] || '').trim().toUpperCase() : '';
              return coy === 'A' || coy === 'ALFA';
            });
            resolve({ week: weekNum, data: alfaRows });
          },
          error: (err) => reject(err)
        });
      });
    };

    const fetchAll = async () => {
      try {
        const promises = [];
        for (let i = 1; i <= 10; i++) {
          promises.push(fetchCSV(i));
        }
        const results = await Promise.allSettled(promises);
        const validData = {};
        const weeks = [];
        results.forEach(res => {
          if (res.status === 'fulfilled') {
            validData[res.value.week] = res.value.data;
            weeks.push(res.value.week);
          }
        });
        
        weeks.sort((a, b) => b - a); // Descending
        setHistoricalData(validData);
        setAvailableWeeks(weeks);
        if (weeks.length > 0) {
          setActiveWeek(weeks[0]);
        } else {
          setErrorMsg("No weekly deficiency data found. Please upload a weekX_deficiencies.csv file.");
        }
        setLoading(false);
      } catch (err) {
        setErrorMsg(`Network error: ${err.message}`);
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── DYNAMIC WEEK LOGIC ──
  const allDetails = activeWeek && historicalData[activeWeek] ? historicalData[activeWeek] : [];

  const courses = useMemo(() => {
    const set = new Set(allDetails.map(d => d.course_name || d.course || 'Unknown'));
    return ['ALL', ...Array.from(set).sort()];
  }, [allDetails]);

  const filtered = useMemo(() => {
    let rows = allDetails;
    if (activeClass !== 'ALL') rows = rows.filter(r => (r.class || '').toUpperCase() === activeClass);
    if (activeCourse !== 'ALL') rows = rows.filter(r => (r.course_name || r.course) === activeCourse);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      rows = rows.filter(r => (r.cadet || '').toLowerCase().includes(q));
    }
    const sorted = [...rows];
    if (sortBy === 'grade-asc') sorted.sort((a, b) => parseFloat(a.grade) - parseFloat(b.grade));
    else if (sortBy === 'grade-desc') sorted.sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade));
    else if (sortBy === 'name') sorted.sort((a, b) => (a.cadet || '').localeCompare(b.cadet || ''));
    else sorted.sort((a, b) => (a.course_name || '').localeCompare(b.course_name || ''));
    return sorted;
  }, [allDetails, activeClass, activeCourse, sortBy, searchText]);

  const uniqueCadets = useMemo(() => new Set(filtered.map(d => d.cadet)).size, [filtered]);
  const avgGrade = useMemo(() => filtered.length ? (filtered.reduce((s, r) => s + parseFloat(r.grade || 0), 0) / filtered.length).toFixed(2) : '—', [filtered]);
  
  const courseChartData = useMemo(() => {
    const counts = {};
    filtered.forEach(r => {
      const c = r.course_name || r.course || 'Unknown';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const classCounts = useMemo(() => {
    const counts = { ALL: allDetails.length, '1CL': 0, '2CL': 0, '3CL': 0 };
    allDetails.forEach(r => {
      const cls = (r.class || '').toUpperCase();
      if (counts[cls] !== undefined) counts[cls]++;
    });
    return counts;
  }, [allDetails]);

  const overviewData = useMemo(() => {
    const dataByCourse = {};
    filtered.forEach(r => {
      const c = r.course_name || r.course || 'Unknown';
      const cls = r.class || 'Unknown';
      if (!dataByCourse[c]) dataByCourse[c] = { name: c, '1CL': 0, '2CL': 0, '3CL': 0 };
      if (dataByCourse[c][cls] !== undefined) dataByCourse[c][cls]++;
    });
    return Object.values(dataByCourse)
      .sort((a, b) => (b['1CL']+b['2CL']+b['3CL']) - (a['1CL']+a['2CL']+a['3CL']))
      .slice(0, 6);
  }, [filtered]);

  const generativeInsight = useMemo(() => {
    if (filtered.length === 0) return "No data available for the current filters.";
    const topCourse = courseChartData[0]?.name;
    const topCourseCount = courseChartData[0]?.value;
    let classBreakdown = Object.entries(classCounts).filter(([c, _]) => c !== 'ALL').sort((a, b) => b[1] - a[1]);
    const topClass = classBreakdown[0];
    return `Analysis reveals that the highest concentration of deficiencies is in ${topCourse} (${topCourseCount} cases). ${topClass[0]} currently faces the most challenges across the board. The overall average grade for deficient cadets is ${avgGrade}. Targeted academic interventions in ${topCourse} could significantly improve overall company performance.`;
  }, [filtered, courseChartData, classCounts, avgGrade]);


  // ── COMPARATIVE & TREND LOGIC ──
  const trendChartData = useMemo(() => {
    const sortedWeeks = [...availableWeeks].sort((a, b) => a - b); // Ascending for X-axis
    return sortedWeeks.map(w => {
      const wData = historicalData[w];
      const unique = new Set(wData.map(d => d.cadet)).size;
      return {
        name: `Week ${w}`,
        'Affected Cadets': unique,
        'Total Deficiencies': wData.length
      };
    });
  }, [availableWeeks, historicalData]);

  const prevWeek = useMemo(() => {
    if (!activeWeek || availableWeeks.length === 0) return null;
    const idx = availableWeeks.indexOf(activeWeek); // availableWeeks is desc
    return idx >= 0 && idx + 1 < availableWeeks.length ? availableWeeks[idx + 1] : null;
  }, [activeWeek, availableWeeks]);

  const compStats = useMemo(() => {
    if (activeView !== 'compare' || !activeWeek || !prevWeek) return null;
    const wCurData = historicalData[activeWeek] || [];
    const wPrevData = historicalData[prevWeek] || [];

    const wPrevUnique = new Set(wPrevData.map(d => d.cadet)).size;
    const wCurUnique = new Set(wCurData.map(d => d.cadet)).size;
    const wPrevAvg = wPrevData.length ? (wPrevData.reduce((s, r) => s + parseFloat(r.grade || 0), 0) / wPrevData.length) : 0;
    const wCurAvg = wCurData.length ? (wCurData.reduce((s, r) => s + parseFloat(r.grade || 0), 0) / wCurData.length) : 0;
    
    return {
      wPrevTotal: wPrevData.length,
      wCurTotal: wCurData.length,
      totalDiff: wCurData.length - wPrevData.length,
      wPrevUnique,
      wCurUnique,
      uniqueDiff: wCurUnique - wPrevUnique,
      wPrevAvg: wPrevAvg.toFixed(2),
      wCurAvg: wCurAvg.toFixed(2),
      avgDiff: (wCurAvg - wPrevAvg).toFixed(2),
    };
  }, [historicalData, activeWeek, prevWeek, activeView]);

  const compChartData = useMemo(() => {
    if (activeView !== 'compare' || !activeWeek || !prevWeek) return [];
    const classes = ['1CL', '2CL', '3CL'];
    const wCurData = historicalData[activeWeek] || [];
    const wPrevData = historicalData[prevWeek] || [];

    return classes.map(cls => {
      const prev = wPrevData.filter(d => (d.class || '').toUpperCase() === cls).length;
      const cur = wCurData.filter(d => (d.class || '').toUpperCase() === cls).length;
      return { name: cls, [`Week ${prevWeek}`]: prev, [`Week ${activeWeek}`]: cur };
    });
  }, [historicalData, activeWeek, prevWeek, activeView]);

  const comparativeInsight = useMemo(() => {
    if (!compStats) return "Select a week that has previous week data to view comparative insights.";
    let insight = `ALFA Company saw `;
    if (compStats.totalDiff < 0) {
      insight += `an improvement with a decrease of ${Math.abs(compStats.totalDiff)} total deficiencies from Week ${prevWeek} to Week ${activeWeek}. `;
    } else if (compStats.totalDiff > 0) {
      insight += `an increase of ${compStats.totalDiff} total deficiencies from Week ${prevWeek} to Week ${activeWeek}, indicating a need for greater academic focus. `;
    } else {
      insight += `no change in the total number of deficiencies between Week ${prevWeek} and Week ${activeWeek}. `;
    }
    
    if (compStats.uniqueDiff < 0) {
      insight += `Encouragingly, ${Math.abs(compStats.uniqueDiff)} cadets managed to completely clear their deficient status. `;
    } else if (compStats.uniqueDiff > 0) {
      insight += `Unfortunately, ${compStats.uniqueDiff} additional cadets fell into deficiency status this week. `;
    }

    const avgDiffNum = parseFloat(compStats.avgDiff);
    if (avgDiffNum > 0) {
      insight += `The average grade among deficient cadets slightly improved by +${avgDiffNum}.`;
    } else if (avgDiffNum < 0) {
      insight += `The average grade among deficient cadets worsened by ${Math.abs(avgDiffNum)}.`;
    }
    
    return insight;
  }, [compStats, activeWeek, prevWeek]);

  const cadetProgress = useMemo(() => {
    if (activeView !== 'compare' || !activeWeek || !prevWeek) return [];
    const wCurData = historicalData[activeWeek] || [];
    const wPrevData = historicalData[prevWeek] || [];

    const wPrevCadets = new Set(wPrevData.map(d => d.cadet));
    const wCurCadets = new Set(wCurData.map(d => d.cadet));
    
    const progress = [];
    wPrevCadets.forEach(cadet => {
      if (!wCurCadets.has(cadet)) progress.push({ cadet, status: 'IMPROVED', class: wPrevData.find(d => d.cadet === cadet)?.class });
    });
    wCurCadets.forEach(cadet => {
      if (!wPrevCadets.has(cadet)) progress.push({ cadet, status: 'WORSENED', class: wCurData.find(d => d.cadet === cadet)?.class });
    });
    
    // Also find those who stayed deficient but improved/worsened their grade sum
    wCurCadets.forEach(cadet => {
      if (wPrevCadets.has(cadet)) {
        const prevGrades = wPrevData.filter(d => d.cadet === cadet).reduce((s, d) => s + parseFloat(d.grade), 0);
        const curGrades = wCurData.filter(d => d.cadet === cadet).reduce((s, d) => s + parseFloat(d.grade), 0);
        if (curGrades > prevGrades) progress.push({ cadet, status: 'SLIGHT_IMPROVEMENT', class: wCurData.find(d => d.cadet === cadet)?.class });
        else if (curGrades < prevGrades) progress.push({ cadet, status: 'SLIGHT_DECLINE', class: wCurData.find(d => d.cadet === cadet)?.class });
      }
    });

    return progress.sort((a, b) => {
      const rank = { 'IMPROVED': 1, 'SLIGHT_IMPROVEMENT': 2, 'SLIGHT_DECLINE': 3, 'WORSENED': 4 };
      return rank[a.status] - rank[b.status];
    });
  }, [historicalData, activeWeek, prevWeek, activeView]);

  // ── RENDER HELPERS ──
  const gradeColor = (grade) => {
    const g = parseFloat(grade);
    if (g < 5.0) return '#eb5757';
    if (g < 6.0) return '#fb8c00';
    return '#fdd835';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return NEXUS_COLORS[Math.abs(hash) % NEXUS_COLORS.length];
  };

  if (loading) {
    return (
      <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }}>📚</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading academic deficiencies...</p>
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
      
      {/* ── VIEW NAVIGATION ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', background: 'var(--card-bg)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
          <button 
            onClick={() => setActiveView('single')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeView === 'single' ? 'var(--surface-active)' : 'transparent', color: activeView === 'single' ? 'var(--text)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {activeWeek ? `Week ${activeWeek} Data` : 'Weekly Data'}
          </button>
          <button 
            onClick={() => setActiveView('compare')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: activeView === 'compare' ? '1px solid #5e35b1' : '1px solid transparent', background: activeView === 'compare' ? 'rgba(94, 53, 177, 0.1)' : 'transparent', color: activeView === 'compare' ? '#5e35b1' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <i className="fa-solid fa-code-compare" style={{ marginRight: '6px' }}></i> Comparative Insights
          </button>
        </div>

        {availableWeeks.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            {availableWeeks.map(w => (
              <button 
                key={w}
                onClick={() => setActiveWeek(w)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: activeWeek === w ? '1px solid #1e88e5' : '1px solid transparent', background: activeWeek === w ? '#1e88e5' : 'transparent', color: activeWeek === w ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fa-regular fa-calendar"></i> Week {w}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeView === 'compare' ? (
        // ==========================================
        //         COMPARATIVE INSIGHTS VIEW
        // ==========================================
        <div className="fade-in">

          {/* ── TREND CHART ── */}
          <div className="nexus-card" ref={trendRef} style={{ marginBottom: '24px' }}>
            <div className="nexus-chart-header">
              <div className="nexus-chart-title">
                <i className="fa-solid fa-chart-line" style={{ color: '#1e88e5' }}></i> Cadet Corps Deficiency Trend
              </div>
            </div>
            <div style={{ width: '100%', height: '300px', paddingTop: '16px' }}>
              {trendChartData.length > 0 && trendWidth > 0 ? (
                <LineChart width={trendWidth - 48} height={270} data={trendChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dx={-10} />
                  <RechartsTooltip cursor={{ stroke: 'var(--border)', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)', paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="Affected Cadets" stroke="#1e88e5" strokeWidth={3} dot={{ r: 4, fill: '#1e88e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Total Deficiencies" stroke="#00acc1" strokeWidth={3} dot={{ r: 4, fill: '#00acc1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>Loading trend...</div>}
            </div>
          </div>

          {compStats ? (
            <>
              <div className="nexus-insights-box">
                <div className="nexus-insights-icon"><i className="fa-solid fa-scale-balanced"></i></div>
                <div className="nexus-insights-content">
                  <div className="nexus-insights-title"><i className="fa-solid fa-sparkles"></i> AI Generated Comparison</div>
                  <div className="nexus-insights-text">{comparativeInsight}</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="nexus-card">
                  <div className="nexus-metric-title"><div className="nexus-metric-icon"><i className="fa-regular fa-file-lines"></i></div> Total Deficiencies</div>
                  <div className="nexus-metric-value-row">
                    <div className="nexus-metric-value">{compStats.wCurTotal}</div>
                    <div className={`nexus-trend ${compStats.totalDiff <= 0 ? 'down' : 'up'}`} style={{ color: compStats.totalDiff <= 0 ? '#43a047' : '#eb5757', background: compStats.totalDiff <= 0 ? 'rgba(67,160,71,0.1)' : 'rgba(235,87,87,0.1)' }}>
                      {compStats.totalDiff > 0 ? '+' : ''}{compStats.totalDiff} from W{prevWeek}
                    </div>
                  </div>
                </div>
                <div className="nexus-card">
                  <div className="nexus-metric-title"><div className="nexus-metric-icon" style={{ color: '#1e88e5', background: 'rgba(30, 136, 229, 0.1)' }}><i className="fa-solid fa-users"></i></div> Affected Cadets</div>
                  <div className="nexus-metric-value-row">
                    <div className="nexus-metric-value">{compStats.wCurUnique}</div>
                    <div className={`nexus-trend ${compStats.uniqueDiff <= 0 ? 'down' : 'up'}`} style={{ color: compStats.uniqueDiff <= 0 ? '#43a047' : '#eb5757', background: compStats.uniqueDiff <= 0 ? 'rgba(67,160,71,0.1)' : 'rgba(235,87,87,0.1)' }}>
                      {compStats.uniqueDiff > 0 ? '+' : ''}{compStats.uniqueDiff} from W{prevWeek}
                    </div>
                  </div>
                </div>
                <div className="nexus-card">
                  <div className="nexus-metric-title"><div className="nexus-metric-icon" style={{ color: '#fb8c00', background: 'rgba(251, 140, 0, 0.1)' }}><i className="fa-solid fa-chart-line"></i></div> Average Grade</div>
                  <div className="nexus-metric-value-row">
                    <div className="nexus-metric-value">{compStats.wCurAvg}</div>
                    <div className={`nexus-trend ${compStats.avgDiff >= 0 ? 'up' : 'down'}`} style={{ color: compStats.avgDiff >= 0 ? '#43a047' : '#eb5757', background: compStats.avgDiff >= 0 ? 'rgba(67,160,71,0.1)' : 'rgba(235,87,87,0.1)' }}>
                      {compStats.avgDiff > 0 ? '+' : ''}{compStats.avgDiff} pts
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="nexus-card" ref={compBarRef}>
                  <div className="nexus-chart-header">
                    <div className="nexus-chart-title"><i className="fa-solid fa-chart-simple" style={{ color: '#00acc1' }}></i> Deficiencies per Class (W{prevWeek} vs W{activeWeek})</div>
                  </div>
                  <div style={{ width: '100%', height: '280px', paddingTop: '16px' }}>
                    {compBarWidth > 0 ? (
                      <BarChart width={compBarWidth - 48} height={250} data={compChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                        <RechartsTooltip cursor={{ fill: 'var(--surface-active)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }} />
                        <Bar dataKey={`Week ${prevWeek}`} fill="#5e35b1" radius={[4, 4, 0, 0]} barSize={24} />
                        <Bar dataKey={`Week ${activeWeek}`} fill="#1e88e5" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>Loading chart...</div>}
                  </div>
                </div>

                <div className="nexus-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 className="nexus-chart-title"><i className="fa-solid fa-arrow-trend-up" style={{ color: '#43a047' }}></i> Cadet Progress Tracker</h3>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1, maxHeight: '300px' }}>
                    <table className="nexus-table" style={{ width: '100%' }}>
                      <tbody>
                        {cadetProgress.map((p, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 24px', fontWeight: 600, color: 'var(--text)' }}>
                              {p.cadet} <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.class}</div>
                            </td>
                            <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                              {p.status === 'IMPROVED' && <span className="nexus-badge" style={{ background: 'rgba(67,160,71,0.1)', color: '#43a047' }}>CLEARED (W{prevWeek} to W{activeWeek})</span>}
                              {p.status === 'WORSENED' && <span className="nexus-badge" style={{ background: 'rgba(235,87,87,0.1)', color: '#eb5757' }}>NEWLY DEFICIENT (W{activeWeek})</span>}
                              {p.status === 'SLIGHT_IMPROVEMENT' && <span className="nexus-badge" style={{ background: 'rgba(251,140,0,0.1)', color: '#fb8c00' }}>GRADE IMPROVED</span>}
                              {p.status === 'SLIGHT_DECLINE' && <span className="nexus-badge" style={{ background: 'rgba(235,87,87,0.1)', color: '#eb5757' }}>GRADE WORSENED</span>}
                            </td>
                          </tr>
                        ))}
                        {cadetProgress.length === 0 && <tr><td colSpan="2" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No significant changes between Week {prevWeek} and Week {activeWeek}.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
               You are currently viewing Week {activeWeek}, but there is no previous week's data to compare against. Upload another week's data to see comparisons!
             </div>
          )}
        </div>
      ) : (
        // ==========================================
        //         SINGLE WEEK VIEW
        // ==========================================
        <div className="fade-in">
          <div className="nexus-insights-box">
            <div className="nexus-insights-icon"><i className="fa-solid fa-lightbulb"></i></div>
            <div className="nexus-insights-content">
              <div className="nexus-insights-title"><i className="fa-solid fa-sparkles"></i> AI Generated Insights</div>
              <div className="nexus-insights-text">{generativeInsight}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="nexus-card">
              <div className="nexus-metric-title"><div className="nexus-metric-icon"><i className="fa-regular fa-file-lines"></i></div> Total Deficiencies</div>
              <div className="nexus-metric-value-row">
                <div className="nexus-metric-value">{filtered.length}</div>
              </div>
            </div>
            <div className="nexus-card">
              <div className="nexus-metric-title"><div className="nexus-metric-icon" style={{ color: '#1e88e5', background: 'rgba(30, 136, 229, 0.1)' }}><i className="fa-solid fa-users"></i></div> Affected Cadets</div>
              <div className="nexus-metric-value-row">
                <div className="nexus-metric-value">{uniqueCadets}</div>
              </div>
            </div>
            <div className="nexus-card">
              <div className="nexus-metric-title"><div className="nexus-metric-icon" style={{ color: '#00acc1', background: 'rgba(0, 172, 193, 0.1)' }}><i className="fa-solid fa-book-open"></i></div> Courses Affected</div>
              <div className="nexus-metric-value-row">
                <div className="nexus-metric-value">{courseChartData.length}</div>
              </div>
            </div>
            <div className="nexus-card">
              <div className="nexus-metric-title"><div className="nexus-metric-icon" style={{ color: '#fb8c00', background: 'rgba(251, 140, 0, 0.1)' }}><i className="fa-solid fa-chart-line"></i></div> Average Grade</div>
              <div className="nexus-metric-value-row">
                <div className="nexus-metric-value">{avgGrade}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
              {CLASS_ORDER.map(cls => (
                <button
                  key={cls}
                  onClick={() => { setActiveClass(cls); setActiveCourse('ALL'); }}
                  style={{
                    padding: '6px 16px', borderRadius: '8px',
                    border: activeClass === cls ? '1px solid #5e35b1' : '1px solid transparent',
                    background: activeClass === cls ? 'rgba(94, 53, 177, 0.1)' : 'transparent',
                    color: activeClass === cls ? '#5e35b1' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  {cls}
                  <span style={{
                    marginLeft: '8px', padding: '2px 6px', borderRadius: '12px', fontSize: '10px', fontWeight: 700,
                    background: activeClass === cls ? '#5e35b1' : 'var(--surface-active)',
                    color: activeClass === cls ? '#fff' : 'var(--text-dim)',
                  }}>{classCounts[cls]}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>
              <input
                type="text" placeholder="Search cadet..." value={searchText} onChange={e => setSearchText(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select value={activeCourse} onChange={e => setActiveCourse(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-active)', color: 'var(--text)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
                {courses.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Courses' : c}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-active)', color: 'var(--text)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
                <option value="course">Sort: Course</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="grade-asc">Sort: Grade (Low-High)</option>
                <option value="grade-desc">Sort: Grade (High-Low)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="nexus-card" ref={areaRef}>
              <div className="nexus-chart-header"><div className="nexus-chart-title">Class Distribution Trend</div></div>
              <div style={{ width: '100%', height: '250px' }}>
                {overviewData.length > 0 && areaWidth > 0 ? (
                    <AreaChart width={areaWidth - 48} height={250} data={overviewData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="color1CL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5e35b1" stopOpacity={0.3}/><stop offset="95%" stopColor="#5e35b1" stopOpacity={0}/></linearGradient>
                        <linearGradient id="color2CL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1e88e5" stopOpacity={0.3}/><stop offset="95%" stopColor="#1e88e5" stopOpacity={0}/></linearGradient>
                        <linearGradient id="color3CL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00acc1" stopOpacity={0.3}/><stop offset="95%" stopColor="#00acc1" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(val) => val.substring(0, 6) + '...'} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }} />
                      <Area type="monotone" dataKey="1CL" stackId="1" stroke="#5e35b1" fill="url(#color1CL)" />
                      <Area type="monotone" dataKey="2CL" stackId="1" stroke="#1e88e5" fill="url(#color2CL)" />
                      <Area type="monotone" dataKey="3CL" stackId="1" stroke="#00acc1" fill="url(#color3CL)" />
                    </AreaChart>
                ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>Loading chart...</div>}
              </div>
            </div>

            <div className="nexus-card" ref={barRef}>
              <div className="nexus-chart-header"><div className="nexus-chart-title">Total Deficiencies per Course</div></div>
              <div style={{ width: '100%', height: '250px' }}>
                {courseChartData.length > 0 && barWidth > 0 ? (
                    <BarChart width={barWidth - 48} height={250} data={courseChartData.slice(0, 5)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(val) => val.substring(0, 6) + '...'} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <RechartsTooltip cursor={{ fill: 'var(--surface-active)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                        {courseChartData.slice(0, 5).map((entry, index) => <Cell key={`cell-${index}`} fill={NEXUS_COLORS[index % NEXUS_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>Loading chart...</div>}
              </div>
            </div>

            <div className="nexus-card" ref={pieRef}>
              <div className="nexus-chart-header"><div className="nexus-chart-title">Deficiencies Distribution</div></div>
              <div style={{ width: '100%', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {courseChartData.length > 0 && pieWidth > 0 ? (
                  <>
                    <div style={{ width: '100%', height: '80%' }}>
                      <PieChart width={pieWidth - 48} height={200}>
                        <Pie data={courseChartData.slice(0, 4)} cx={(pieWidth - 48) / 2} cy={100} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {courseChartData.slice(0, 4).map((entry, index) => <Cell key={`cell-${index}`} fill={NEXUS_COLORS[index % NEXUS_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }} />
                      </PieChart>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                      {courseChartData.slice(0, 4).map((entry, index) => (
                        <div key={index} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                          <span style={{ display: 'inline-block', width: '3px', height: '12px', background: NEXUS_COLORS[index % NEXUS_COLORS.length], marginRight: '6px', borderRadius: '2px' }}></span>
                          {entry.name.substring(0, 8)}
                        </div>
                      ))}
                    </div>
                  </>
                ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>Loading chart...</div>}
              </div>
            </div>
          </div>

          <div className="nexus-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <h3 className="nexus-chart-title">List of Deficient Cadets</h3>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
              <table className="nexus-table">
                <thead>
                  <tr style={{ background: 'var(--surface-active)', position: 'sticky', top: 0, zIndex: 1 }}>
                    <th>Cadet</th>
                    <th>Course</th>
                    <th>Class</th>
                    <th>Grade</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? filtered.map((d, i) => (
                    <tr key={i}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="nexus-avatar" style={{ background: getAvatarColor(d.cadet) }}>{getInitials(d.cadet)}</div>
                        <div><div style={{ fontWeight: 600, color: 'var(--text)' }}>{d.cadet}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.sec}</div></div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{d.course}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.course_name}</div>
                      </td>
                      <td>
                        <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: d.class === '3CL' ? 'rgba(0, 172, 193, 0.1)' : d.class === '2CL' ? 'rgba(30, 136, 229, 0.1)' : 'rgba(94, 53, 177, 0.1)', color: d.class === '3CL' ? '#00acc1' : d.class === '2CL' ? '#1e88e5' : '#5e35b1' }}>
                          {d.class}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '40px', height: '4px', background: 'var(--surface-active)', borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(100, (parseFloat(d.grade) / 10) * 100)}%`, background: gradeColor(d.grade) }}></div></div>
                          <span style={{ fontWeight: 600, fontFamily: "'Share Tech Mono', monospace" }}>{parseFloat(d.grade).toFixed(2)}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, fontFamily: "'Share Tech Mono', monospace", color: 'var(--text-muted)' }}>{parseFloat(d.pts).toFixed(2)}</td>
                    </tr>
                  )) : <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No cadets match the current filters.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
