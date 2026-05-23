import React from 'react';
import AnnCard from '../components/AnnCard';

const COUNCILS_META = {
  s1: { name:'S1 COUNCIL', sub:'Personnel & Administration', icon:'👤', color:'#39ff6e', mission:'Responsible for personnel records, administrative matters, cadet welfare, and human resource management of ALFA Company.', cols:['Name','Rank','Position','Status'] },
  s2: { name:'S2 COUNCIL', sub:'Intelligence & Security', icon:'🔍', color:'#44aaff', mission:'Handles intelligence reports, security assessments, threat analysis, and information management for the company.', cols:['Report','Classification','Date','Analyst'] },
  s3: { name:'S3 COUNCIL', sub:'Operations & Training', icon:'⚙️', color:'#ffd700', mission:'Plans and executes all training activities, operational schedules, drills, and military exercises for ALFA Company.', cols:['Activity','Schedule','Venue','Officer-in-Charge'] },
  s4: { name:'S4 COUNCIL', sub:'Logistics & Supply', icon:'📦', color:'#ff9944', mission:'Manages supply, equipment accountability, property management, and logistical support for all company operations.', cols:['Item','Quantity','Status','Custodian'] },
  s5: { name:'S5 COUNCIL', sub:'Plans & Programs', icon:'📊', color:'#aa88ff', mission:'Responsible for operational planning, program development, systems integration, and strategic scheduling of ALFA Company.', cols:['Plan','Program','Target Date','Status'] },
  s6: { name:'S6 COUNCIL', sub:'Signal & Communications', icon:'📡', color:'#44ffee', mission:'Manages communication systems, digital infrastructure, and information technology resources of the company.', cols:['System','Status','Operator','Remarks'] },
  s7: { name:'S7 COUNCIL', sub:'Civil-Military Operations', icon:'🤝', color:'#ff88aa', mission:'Coordinates civil-military relations, community engagement, and outreach programs on behalf of ALFA Company.', cols:['Program','Partner','Date','Status'] },
  s8: { name:'S8 COUNCIL', sub:'Education & Training', icon:'🎓', color:'#ffd700', mission:'Handles information dissemination, education and training programs, military schooling, media relations, and company publications.', cols:['Publication','Type','Release Date','Editor'] },
  s10: { name:'S10 COUNCIL', sub:'Finance & Budget', icon:'💰', color:'#ff6644', mission:'Oversees financial planning, budget management, fund accountability, company expense control, and financial reporting for the company.', cols:['Fund','Amount','Purpose','Status'] },
  athletic: { name:'ATHLETIC COUNCIL', sub:'Sports & Physical Fitness', icon:'🏃', color:'#44ff88', mission:'Develops and manages sports programs, physical fitness training, athletic competitions, and wellness initiatives.', cols:['Sport','Schedule','Venue','Coach'] },
  academic: { name:'ACADEMIC COUNCIL', sub:'Scholastic Affairs', icon:'🎓', color:'#88aaff', mission:'Oversees academic performance, study programs, tutorial sessions, and scholastic standards of company cadets.', cols:['Subject','Schedule','Tutor','Venue'] },
};

export default function CouncilPage({ councilId, sheetData, events }) {
  const c = COUNCILS_META[councilId];
  if (!c) return null;

  const items = sheetData.filter(d => d.Council && (d.Council.toLowerCase() === councilId || d.Council.toLowerCase() === 'all'));
  const tableData = items.slice(0, 10);
  
  const councilEvents = (events || []).filter(e => e.council && (e.council.toLowerCase() === councilId || e.council.toLowerCase() === 'all'))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="page active" id={`page-${councilId}`}>
      <div className="glass council-hero">
        <div className="council-crest">{c.icon}</div>
        <div className="council-info">
          <h2>{c.name}</h2>
          <p>{c.sub.toUpperCase()}</p>
          <div className="council-mission">{c.mission}</div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">📋</div>
          <div><h2>COUNCIL BULLETINS</h2><p>ANNOUNCEMENTS FOR {c.name}</p></div>
        </div>
      </div>
      
      {items.length ? (
        <div className="grid-3">
          {items.map((item, i) => <AnnCard key={i} item={item} />)}
        </div>
      ) : (
        <div className="glass empty-state" style={{padding: '40px', textAlign: 'center'}}>
          <i className="fa fa-inbox" style={{fontSize: '40px', opacity: 0.3, display: 'block', marginBottom: '10px'}}></i>
          <p style={{fontFamily: "'Share Tech Mono', monospace", color: 'var(--text-dim)'}}>
            No bulletins from {c.name}. Connect a Google Sheet to populate.
          </p>
        </div>
      )}

      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">🗓</div>
          <div><h2>COUNCIL EVENTS</h2><p>UPCOMING ACTIVITIES</p></div>
        </div>
      </div>
      <div className="event-list">
        {councilEvents.length ? councilEvents.map((e, i) => {
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
          <div className="glass empty-state" style={{padding: '40px'}}>
            <i className="fa fa-calendar-xmark"></i><p>No upcoming events for this council.</p>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <>
          <div className="section-header">
            <div className="section-title">
              <div className="section-icon">📊</div>
              <div><h2>SHEET DATA</h2><p>FROM CONNECTED GOOGLE SHEET</p></div>
            </div>
          </div>
          <div className="glass" style={{padding: 0, overflow: 'hidden'}}>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {c.cols.map((col, i) => <th key={i}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {tableData.length ? tableData.map((r, i) => (
                    <tr key={i}>
                      {c.cols.map((col, j) => <td key={j}>{r[col] || '—'}</td>)}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={c.cols.length} style={{textAlign: 'center', padding: '30px'}}>No data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
