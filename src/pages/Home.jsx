import React, { useState, useEffect } from 'react';
import AnnCard from '../components/AnnCard';
import { SkeletonGrid, SkeletonEventItem } from '../components/Skeleton';

// Animated count-up hook for stat numbers
function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const COUNCIL_FILTERS = ['All', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S10'];
const TAG_FILTERS = ['All', 'Urgent', 'Important', 'Info', 'Training', 'Activity'];

export default function Home({ sheetData, events, onSheetConnect, onSheetClear, feedStatus, isAdmin, loading }) {
  const [search, setSearch] = useState('');
  const [councilFilter, setCouncilFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  
  const filteredData = sheetData.filter(r => {
    // Search filter
    if (search && !JSON.stringify(r).toLowerCase().includes(search.toLowerCase())) return false;
    // Council filter
    if (councilFilter !== 'All' && (r.Council || '').toLowerCase() !== councilFilter.toLowerCase()) return false;
    // Tag filter
    if (tagFilter !== 'All' && (r.Tag || '').toLowerCase() !== tagFilter.toLowerCase()) return false;
    return true;
  });

  const priorityAnn = filteredData.filter(d => d.Priority === 'high');
  const allAnn = filteredData;

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem('alfa_sheet_url') || '');

  // Animated stat counters
  const annCount = useCountUp(allAnn.length);
  const eventsCount = useCountUp(upcomingEvents.length);
  const councilsCount = useCountUp(12);

  return (
    <div className="page active" id="page-home">
      <div className="glass hero glow-anim">
        <div className="hero-content">
          <h1>ALFA <span>COMPANY</span></h1>
          <p>▸ CADET CORPS ARMED FORCES OF THE PHILIPPINES • BULLETIN BOARD SYSTEM</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="num">{annCount || '—'}</span>
              <span className="lbl">ANNOUNCEMENTS</span>
            </div>
            <div className="divider-v"></div>
            <div className="hero-stat">
              <span className="num">{eventsCount || '—'}</span>
              <span className="lbl">UPCOMING EVENTS</span>
            </div>
            <div className="divider-v"></div>
            <div className="hero-stat">
              <span className="num">{councilsCount || '—'}</span>
              <span className="lbl">COUNCILS</span>
            </div>
            <div className="divider-v"></div>
            <div className="hero-stat">
              <span className="num">{new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
              <span className="lbl">TODAY</span>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="glass sheets-config">
          <h3><i className="fa-brands fa-google" style={{color: '#4CAF50'}}></i> GOOGLE SHEETS INTEGRATION</h3>
          <div className="input-row">
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Paste Google Sheets CSV publish URL (File → Share → Publish to web → CSV)…" 
              value={sheetUrl}
              onChange={e => setSheetUrl(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => onSheetConnect(sheetUrl)}>
              <i className="fa fa-link"></i> CONNECT
            </button>
            <button className="btn" onClick={() => { setSheetUrl(''); onSheetClear(); }}>
              <i className="fa fa-xmark"></i> CLEAR
            </button>
          </div>
          {feedStatus && (
            <div className={`feed-status ${feedStatus.type}`}>
              <i className={feedStatus.type === 'ok' ? 'fa fa-circle-check' : feedStatus.type === 'err' ? 'fa fa-circle-xmark' : 'fa fa-circle-info'}></i> {feedStatus.msg}
            </div>
          )}
          <div style={{marginTop: '10px', fontSize: '11px', color: 'var(--text-dim)', fontFamily: "'Share Tech Mono', monospace"}}>
            ⓘ Sheet must have columns: <strong style={{color: 'var(--g1)'}}>Title | Body | Date | Tag | Council | Priority</strong> — Changes reflect after page refresh or manual reload.
          </div>
        </div>
      )}

      {/* Priority Bulletins */}
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">📌</div>
          <div><h2>PRIORITY BULLETINS</h2><p>HIGH-PRIORITY ANNOUNCEMENTS</p></div>
        </div>
        <div className="refresh-time">
          <i className="fa fa-rotate" style={{color: 'var(--g1)'}}></i>
          <span>Updated {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      {loading ? (
        <SkeletonGrid count={3} />
      ) : (
        <div className="grid-3">
          {priorityAnn.length ? priorityAnn.map((item, i) => <AnnCard key={i} item={item} />) : (
            <div className="glass empty-state" style={{gridColumn: '1/-1'}}>
              <i className="fa fa-bullhorn"></i><p>No priority bulletins</p>
            </div>
          )}
        </div>
      )}

      {/* All Announcements */}
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">📋</div>
          <div><h2>ALL ANNOUNCEMENTS</h2><p>COMPANY-WIDE BULLETINS</p></div>
        </div>
        <input 
          id="home-search-input"
          type="text" 
          className="glass-input" 
          style={{width: '220px'}} 
          placeholder="Search announcements…" 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Council Filter Pills */}
      <div className="filter-bar">
        {COUNCIL_FILTERS.map(c => (
          <button
            key={c}
            className={`filter-pill${councilFilter === c ? ' active' : ''}`}
            onClick={() => setCouncilFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tag Filter Pills */}
      <div className="filter-bar">
        {TAG_FILTERS.map(t => (
          <button
            key={t}
            className={`filter-pill${tagFilter === t ? ' active' : ''}`}
            onClick={() => setTagFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Result Count */}
      <div className="filter-result-count">
        Showing {allAnn.length} of {sheetData.length} announcements
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className="grid-3">
          {allAnn.length ? allAnn.map((item, i) => (
            <div className="filter-card-anim" key={item.id || item.Title || i}>
              <AnnCard item={item} />
            </div>
          )) : (
            <div className="glass empty-state" style={{gridColumn: '1/-1'}}>
              <i className="fa fa-inbox"></i><p>No announcements match your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Events */}
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">🗓</div>
          <div><h2>UPCOMING EVENTS</h2><p>NEXT 30 DAYS</p></div>
        </div>
      </div>
      {loading ? (
        <div className="event-list">
          <SkeletonEventItem />
          <SkeletonEventItem />
          <SkeletonEventItem />
        </div>
      ) : (
        <div className="event-list">
          {upcomingEvents.length ? upcomingEvents.map((e, i) => {
            const [y,m,d]=e.date.split('-');
            const mon=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1];
            const CAT_COLORS = { training:'tag-green', formation:'tag-gold', academic:'tag-blue', athletic:'tag-green', ceremony:'tag-gold', activity:'tag-blue', other:'tag-green' };
            return (
              <div className="event-item" key={i}>
                <div className="event-date-badge"><div className="d">{d}</div><div className="m">{mon} {y}</div></div>
                <div className="event-info">
                  <h4>{e.title}</h4>
                  <p>{e.time||''} {e.desc||''}</p>
                  <div className="event-tags">
                    <span className={`tag ${CAT_COLORS[e.cat]||'tag-green'}`}>{(e.cat||'event').toUpperCase()}</span>
                    {e.council&&e.council!=='all'&&<span className="tag tag-blue">{e.council}</span>}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="glass empty-state">
              <i className="fa fa-calendar-xmark"></i>
              <p>No upcoming events. Add some!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

