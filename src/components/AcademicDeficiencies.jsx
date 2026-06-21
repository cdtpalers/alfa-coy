import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Hook to measure a container's width, re-measuring on resize
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
  // also re-measure when ref attaches
  const setRef = useCallback(node => {
    ref.current = node;
    if (node) setWidth(node.offsetWidth);
  }, []);
  return [setRef, width];
}

const COLORS = [
  '#e63946', '#457b9d', '#f4a261', '#2a9d8f', '#e76f51',
  '#264653', '#a8dadc', '#d4a373', '#6d6875'
];

const CLASS_ORDER = ['ALL', '1CL', '2CL', '3CL'];

const chartCardStyle = {
  background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px',
  padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden',
};
const chartHeadingStyle = {
  fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: '16px', fontWeight: 600,
};

function ChartRow({ courseChartData, activeCourse, setActiveCourse }) {
  const [pieRef, pieWidth] = useContainerWidth();
  const [barRef, barWidth] = useContainerWidth();

  const pieH = 280;
  const barH = Math.max(courseChartData.length * 40 + 40, 200);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '20px' }}>
      {/* Donut Chart */}
      <div ref={pieRef} style={chartCardStyle}>
        <h3 style={chartHeadingStyle}>Deficiencies by Course</h3>
        {courseChartData.length > 0 && pieWidth > 0 ? (
          <>
            <PieChart width={pieWidth - 48} height={pieH}>
              <Pie
                data={courseChartData}
                cx={(pieWidth - 48) / 2}
                cy={pieH / 2}
                innerRadius={Math.min(pieH, pieWidth - 48) * 0.22}
                outerRadius={Math.min(pieH, pieWidth - 48) * 0.36}
                paddingAngle={3}
                dataKey="value"
                stroke="var(--card-bg)"
                strokeWidth={2}
              >
                {courseChartData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)', fontSize: '13px' }}>{payload[0].name}</p>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>{payload[0].value} deficiencies ({(payload[0].percent * 100).toFixed(1)}%)</p>
                    </div>
                  );
                }}
              />
            </PieChart>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: '12px', justifyContent: 'center' }}>
              {courseChartData.map((entry, i) => (
                <div
                  key={i}
                  onClick={() => setActiveCourse(activeCourse === entry.name ? 'ALL' : entry.name)}
                  style={{
                    display: 'flex', alignItems: 'center', fontSize: '12px',
                    color: activeCourse === entry.name ? 'var(--text)' : 'var(--text-muted)',
                    cursor: 'pointer', fontWeight: activeCourse === entry.name ? 700 : 400,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{
                    display: 'inline-block', width: '10px', height: '10px',
                    backgroundColor: COLORS[i % COLORS.length], borderRadius: '3px',
                    marginRight: '6px',
                  }} />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: pieH, color: 'var(--text-dim)' }}>
            {pieWidth === 0 ? 'Measuring...' : 'No data for current filters.'}
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div ref={barRef} style={chartCardStyle}>
        <h3 style={chartHeadingStyle}>Cadets per Course</h3>
        {courseChartData.length > 0 && barWidth > 0 ? (
          <BarChart
            data={courseChartData}
            layout="vertical"
            width={barWidth - 48}
            height={barH}
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" stroke="var(--text-dim)" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} allowDecimals={false} />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              stroke="none"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)', fontSize: '13px' }}>{label}</p>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>{payload[0].value} cadets</p>
                  </div>
                );
              }}
              cursor={{ fill: 'var(--surface-active)' }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
              {courseChartData.map((_, i) => (
                <Cell key={`bar-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-dim)' }}>
            {barWidth === 0 ? 'Measuring...' : 'No data for current filters.'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcademicDeficiencies() {
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

  const uniqueCadets = useMemo(() => new Set(filtered.map(d => d.cadet)).size, [filtered]);

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
    if (g < 5.0) return '#e63946';
    if (g < 6.0) return '#f4a261';
    return '#e9c46a';
  };

  return (
    <div style={{ marginTop: '16px' }}>
      {/* ── METRICS ROW ── */}
      <div className="finance-metrics-grid" style={{ marginBottom: '20px' }}>
        <div className="finance-metric-card" style={{ borderLeft: '4px solid #e63946' }}>
          <h4>Total Deficiencies</h4>
          <p>{filtered.length}</p>
        </div>
        <div className="finance-metric-card" style={{ borderLeft: '4px solid #457b9d' }}>
          <h4>Affected Cadets</h4>
          <p>{uniqueCadets}</p>
        </div>
        <div className="finance-metric-card" style={{ borderLeft: '4px solid #2a9d8f' }}>
          <h4>Courses Affected</h4>
          <p>{courseChartData.length}</p>
        </div>
        <div className="finance-metric-card" style={{ borderLeft: '4px solid #f4a261' }}>
          <h4>Avg Grade</h4>
          <p>{filtered.length ? (filtered.reduce((s, r) => s + parseFloat(r.grade || 0), 0) / filtered.length).toFixed(2) : '—'}</p>
        </div>
      </div>

      {/* ── CLASS TABS ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {CLASS_ORDER.map(cls => (
          <button
            key={cls}
            onClick={() => { setActiveClass(cls); setActiveCourse('ALL'); }}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              border: activeClass === cls ? '2px solid var(--accent-base)' : '1px solid var(--border)',
              background: activeClass === cls ? 'var(--accent-base)' : 'var(--card-bg)',
              color: activeClass === cls ? '#fff' : 'var(--text)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
          >
            {cls === 'ALL' ? '🎯 ALL CLASSES' : `🎖️ ${cls}`}
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              background: activeClass === cls ? 'rgba(255,255,255,0.2)' : 'var(--surface-active)',
              color: activeClass === cls ? '#fff' : 'var(--text-muted)',
            }}>
              {classCounts[cls]}
            </span>
          </button>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center',
        background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
          <span style={{ fontSize: '14px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search cadet name..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'var(--surface-active)',
              color: 'var(--text)', fontSize: '13px', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course:</span>
          <select
            value={activeCourse}
            onChange={e => setActiveCourse(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'var(--surface-active)',
              color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {courses.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Courses' : c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'var(--surface-active)',
              color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <option value="course">By Course</option>
            <option value="name">By Name (A–Z)</option>
            <option value="grade-asc">Grade: Low → High</option>
            <option value="grade-desc">Grade: High → Low</option>
          </select>
        </div>
      </div>

      {/* ── CHARTS ROW ── */}
      <ChartRow courseChartData={courseChartData} activeCourse={activeCourse} setActiveCourse={setActiveCourse} />

      {/* ── CADET TABLE ── */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, margin: 0 }}>
            Deficient Cadets ({filtered.length})
          </h3>
        </div>
        <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
                {['Cadet', 'Class', 'Section', 'Course', 'Grade', 'Points'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: '11px',
                    color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((d, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.15s ease',
                }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>{d.cadet}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                      background: d.class === '3CL' ? 'rgba(42,157,143,0.12)' : d.class === '2CL' ? 'rgba(69,123,157,0.12)' : 'rgba(230,57,70,0.12)',
                      color: d.class === '3CL' ? '#2a9d8f' : d.class === '2CL' ? '#457b9d' : '#e63946',
                    }}>
                      {d.class}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{d.sec}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', maxWidth: '220px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '2px' }}>{d.course}</div>
                    {d.course_name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '8px',
                      fontWeight: 700, fontSize: '13px', fontFamily: "'Share Tech Mono', monospace",
                      background: `${gradeColor(d.grade)}18`, color: gradeColor(d.grade),
                    }}>
                      {parseFloat(d.grade).toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--danger)', fontWeight: 600, fontFamily: "'Share Tech Mono', monospace" }}>
                    {parseFloat(d.pts).toFixed(2)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
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
