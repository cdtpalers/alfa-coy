import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Hook to measure a container's width
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

  const [allDetails, setAllDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filters & sorting
  const [activeClass, setActiveClass] = useState('ALL');
  const [activeCourse, setActiveCourse] = useState('ALL');
  const [sortBy, setSortBy] = useState('course');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchDeficiencies = async () => {
      try {
        const url = import.meta.env.BASE_URL + 'week3_deficiencies.csv';
        const res = await fetch(url);
        if (!res.ok) {
          setErrorMsg(`Failed to load CSV (HTTP ${res.status}). Ensure the file is deployed.`);
          setLoading(false);
          return;
        }
        const text = await res.text();
        if (text.trim().startsWith('<')) {
          setErrorMsg('Received HTML instead of CSV — check deployment settings.');
          setLoading(false);
          return;
        }

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data;
            if (!rows || rows.length === 0) {
              setErrorMsg('CSV parsed but contained no data rows.');
              setLoading(false);
              return;
            }

            const alfaRows = rows.filter(r => {
              const coyKey = Object.keys(r).find(k => k.trim().toLowerCase() === 'company');
              const coy = coyKey ? (r[coyKey] || '').trim().toUpperCase() : '';
              return coy === 'A' || coy === 'ALFA';
            });

            if (alfaRows.length === 0) {
              setErrorMsg(`No Alfa company cadets found in ${rows.length} total rows.`);
              setLoading(false);
              return;
            }

            setAllDetails(alfaRows);
            setLoading(false);
          }
        });
      } catch (err) {
        setErrorMsg(`Network error: ${err.message}`);
        setLoading(false);
      }
    };
    fetchDeficiencies();
  }, []);

  // Derived data
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
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const classCounts = useMemo(() => {
    const counts = { ALL: allDetails.length, '1CL': 0, '2CL': 0, '3CL': 0 };
    allDetails.forEach(r => {
      const cls = (r.class || '').toUpperCase();
      if (counts[cls] !== undefined) counts[cls]++;
    });
    return counts;
  }, [allDetails]);

  // Data for Area Chart (Sales Overview style -> Deficiencies Overview)
  const overviewData = useMemo(() => {
    const dataByCourse = {};
    filtered.forEach(r => {
      const c = r.course_name || r.course || 'Unknown';
      const cls = r.class || 'Unknown';
      if (!dataByCourse[c]) dataByCourse[c] = { name: c, '1CL': 0, '2CL': 0, '3CL': 0 };
      if (dataByCourse[c][cls] !== undefined) {
        dataByCourse[c][cls]++;
      }
    });
    // Return top 6 courses for readability in Area chart
    return Object.values(dataByCourse)
      .sort((a, b) => (b['1CL']+b['2CL']+b['3CL']) - (a['1CL']+a['2CL']+a['3CL']))
      .slice(0, 6);
  }, [filtered]);

  // Generative Insights Text
  const generativeInsight = useMemo(() => {
    if (filtered.length === 0) return "No data available for the current filters.";
    
    const topCourse = courseChartData[0]?.name;
    const topCourseCount = courseChartData[0]?.value;
    
    let classBreakdown = Object.entries(classCounts)
      .filter(([c, _]) => c !== 'ALL')
      .sort((a, b) => b[1] - a[1]);
    const topClass = classBreakdown[0];

    return `Analysis reveals that the highest concentration of deficiencies is in ${topCourse} (${topCourseCount} cases). ${topClass[0]} currently faces the most challenges across the board. The overall average grade for deficient cadets is ${avgGrade}. Targeted academic interventions in ${topCourse} could significantly improve overall company performance.`;
  }, [filtered, courseChartData, classCounts, avgGrade]);


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

  const gradeColor = (grade) => {
    const g = parseFloat(grade);
    if (g < 5.0) return '#eb5757';
    if (g < 6.0) return '#fb8c00';
    return '#fdd835';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return NEXUS_COLORS[Math.abs(hash) % NEXUS_COLORS.length];
  };

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
            <div className="nexus-metric-icon"><i className="fa-regular fa-file-lines"></i></div>
            Total Deficiencies
          </div>
          <div className="nexus-metric-value-row">
            <div className="nexus-metric-value">{filtered.length}</div>
            <div className="nexus-trend up">12.5% ↗</div>
          </div>
        </div>

        <div className="nexus-card">
          <div className="nexus-metric-title">
            <div className="nexus-metric-icon" style={{ color: '#1e88e5', background: 'rgba(30, 136, 229, 0.1)' }}><i className="fa-solid fa-users"></i></div>
            Affected Cadets
          </div>
          <div className="nexus-metric-value-row">
            <div className="nexus-metric-value">{uniqueCadets}</div>
            <div className="nexus-trend down">4.2% ↘</div>
          </div>
        </div>

        <div className="nexus-card">
          <div className="nexus-metric-title">
            <div className="nexus-metric-icon" style={{ color: '#00acc1', background: 'rgba(0, 172, 193, 0.1)' }}><i className="fa-solid fa-book-open"></i></div>
            Courses Affected
          </div>
          <div className="nexus-metric-value-row">
            <div className="nexus-metric-value">{courseChartData.length}</div>
            <div className="nexus-trend up">2.0% ↗</div>
          </div>
        </div>

        <div className="nexus-card">
          <div className="nexus-metric-title">
            <div className="nexus-metric-icon" style={{ color: '#fb8c00', background: 'rgba(251, 140, 0, 0.1)' }}><i className="fa-solid fa-chart-line"></i></div>
            Average Grade
          </div>
          <div className="nexus-metric-value-row">
            <div className="nexus-metric-value">{avgGrade}</div>
            <div className="nexus-trend down">0.5% ↘</div>
          </div>
        </div>

      </div>

      {/* ── CLASS TABS & FILTER BAR ── */}
      <div style={{
        display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center',
        background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '16px 20px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
      }}>
        
        {/* Class Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
          {CLASS_ORDER.map(cls => (
            <button
              key={cls}
              onClick={() => { setActiveClass(cls); setActiveCourse('ALL'); }}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                border: activeClass === cls ? '1px solid #5e35b1' : '1px solid transparent',
                background: activeClass === cls ? 'rgba(94, 53, 177, 0.1)' : 'transparent',
                color: activeClass === cls ? '#5e35b1' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {cls}
              <span style={{
                marginLeft: '8px',
                padding: '2px 6px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 700,
                background: activeClass === cls ? '#5e35b1' : 'var(--surface-active)',
                color: activeClass === cls ? '#fff' : 'var(--text-dim)',
              }}>
                {classCounts[cls]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>
          <input
            type="text"
            placeholder="Search cadet..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              flex: 1, padding: '8px', borderRadius: '6px',
              border: 'none', background: 'transparent',
              color: 'var(--text)', fontSize: '13px', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Sort & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={activeCourse}
            onChange={e => setActiveCourse(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '6px',
              border: '1px solid var(--border)', background: 'var(--surface-active)',
              color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
              outline: 'none',
            }}
          >
            {courses.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Courses' : c}</option>)}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '6px',
              border: '1px solid var(--border)', background: 'var(--surface-active)',
              color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="course">Sort: Course</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="grade-asc">Sort: Grade (Low-High)</option>
            <option value="grade-desc">Sort: Grade (High-Low)</option>
          </select>
        </div>
      </div>

      {/* ── CHARTS AREA ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Main Area Chart - Deficiencies Overview */}
        <div className="nexus-card" style={{ gridColumn: '1 / -1', minHeight: '380px' }} ref={areaRef}>
          <div className="nexus-chart-header">
            <div className="nexus-chart-title">
              <i className="fa-solid fa-chart-area" style={{ color: '#5e35b1' }}></i>
              Deficiencies Overview
            </div>
            <div className="nexus-chart-actions">
              <button className="nexus-btn-outline"><i className="fa-solid fa-filter"></i> Filter</button>
              <button className="nexus-btn-outline"><i className="fa-solid fa-arrow-up-right-dots"></i> Sort</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700 }}>{filtered.length}</span>
            <span className="nexus-trend up">12.5% ↗</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>+12 overall increased</span>
          </div>

          <div style={{ width: '100%', height: '250px' }}>
            {overviewData.length > 0 && areaWidth > 0 ? (
                <AreaChart width={areaWidth - 48} height={250} data={overviewData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="color1CL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5e35b1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#5e35b1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="color2CL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e88e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1e88e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="color3CL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00acc1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00acc1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(val) => val.substring(0, 10) + '...'} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    labelStyle={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}
                  />
                  <Area type="monotone" dataKey="1CL" stackId="1" stroke="#5e35b1" fill="url(#color1CL)" strokeWidth={2} />
                  <Area type="monotone" dataKey="2CL" stackId="1" stroke="#1e88e5" fill="url(#color2CL)" strokeWidth={2} />
                  <Area type="monotone" dataKey="3CL" stackId="1" stroke="#00acc1" fill="url(#color3CL)" strokeWidth={2} />
                </AreaChart>
            ) : (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
                 {areaWidth === 0 ? 'Loading chart...' : 'No data to display.'}
               </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#5e35b1', marginRight: '6px' }}></span>1CL</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#1e88e5', marginRight: '6px' }}></span>2CL</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#00acc1', marginRight: '6px' }}></span>3CL</div>
          </div>
        </div>

        {/* Secondary Charts */}
        <div className="nexus-card" ref={barRef}>
          <div className="nexus-chart-header">
            <div className="nexus-chart-title">
              Total Deficiencies per Course
            </div>
          </div>
          <div style={{ width: '100%', height: '250px' }}>
            {courseChartData.length > 0 && barWidth > 0 ? (
                <BarChart width={barWidth - 48} height={250} data={courseChartData.slice(0, 5)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(val) => val.substring(0, 6) + '...'} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--surface-active)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}
                    labelStyle={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                    {courseChartData.slice(0, 5).map((entry, index) => (
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

        <div className="nexus-card" ref={pieRef}>
          <div className="nexus-chart-header">
            <div className="nexus-chart-title">
              Deficiencies Distribution
            </div>
            <div className="nexus-chart-actions">
               <button className="nexus-btn-outline">Monthly <i className="fa-solid fa-chevron-down"></i></button>
            </div>
          </div>
          <div style={{ width: '100%', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {courseChartData.length > 0 && pieWidth > 0 ? (
              <>
                <div style={{ width: '100%', height: '80%' }}>
                  <PieChart width={pieWidth - 48} height={200}>
                    <Pie
                      data={courseChartData.slice(0, 4)}
                      cx={(pieWidth - 48) / 2}
                      cy={100}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {courseChartData.slice(0, 4).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={NEXUS_COLORS[index % NEXUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    />
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
            ) : (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
                 {pieWidth === 0 ? 'Loading chart...' : 'No data to display.'}
               </div>
            )}
          </div>
        </div>

      </div>

      {/* ── CADET TABLE ── */}
      <div className="nexus-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h3 className="nexus-chart-title">List of Deficient Cadets</h3>
          <button className="nexus-btn-outline" style={{ color: '#1e88e5', borderColor: 'transparent' }}>See All</button>
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
                    <div className="nexus-avatar" style={{ background: getAvatarColor(d.cadet) }}>
                      {getInitials(d.cadet)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{d.cadet}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.sec}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{d.course}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.course_name}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                      background: d.class === '3CL' ? 'rgba(0, 172, 193, 0.1)' : d.class === '2CL' ? 'rgba(30, 136, 229, 0.1)' : 'rgba(94, 53, 177, 0.1)',
                      color: d.class === '3CL' ? '#00acc1' : d.class === '2CL' ? '#1e88e5' : '#5e35b1',
                    }}>
                      {d.class}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '40px', height: '4px', background: 'var(--surface-active)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (parseFloat(d.grade) / 10) * 100)}%`, background: gradeColor(d.grade) }}></div>
                      </div>
                      <span style={{ fontWeight: 600, fontFamily: "'Share Tech Mono', monospace" }}>
                        {parseFloat(d.grade).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: "'Share Tech Mono', monospace", color: 'var(--text-muted)' }}>
                    {parseFloat(d.pts).toFixed(2)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No cadets match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
