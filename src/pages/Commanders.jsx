import React from 'react';

const CO = { name:'Cdt Col. [Name]', rank:'CO', role:'Company Commander', icon:'🎖️' };
const XO = { name:'Cdt Lt Col. [Name]', rank:'XO', role:'Executive Officer', icon:'⭐' };

const STAFF = [
  { name:'Cdt Maj. [Name]', rank:'S1-O', role:'Personnel Officer', icon:'👤' },
  { name:'Cdt Maj. [Name]', rank:'S2-O', role:'Intelligence Officer', icon:'🔍' },
  { name:'Cdt Maj. [Name]', rank:'S3-O', role:'Operations Officer', icon:'⚙️' },
  { name:'Cdt Maj. [Name]', rank:'S4-O', role:'Logistics Officer', icon:'📦' },
  { name:'Cdt Maj. [Name]', rank:'S5-O', role:'Plans & Programs Officer', icon:'📊' },
  { name:'Cdt Capt. [Name]', rank:'S6-O', role:'Signal Officer', icon:'📡' },
  { name:'Cdt Capt. [Name]', rank:'S7-O', role:'Civil-Military Officer', icon:'🤝' },
  { name:'Cdt Capt. [Name]', rank:'S8-O', role:'Education & Training Officer', icon:'🎓' },
  { name:'Cdt Capt. [Name]', rank:'S10-O', role:'Finance Officer', icon:'💰' },
  { name:'Cdt 1Lt. [Name]', rank:'ATH', role:'Athletic Director', icon:'🏃' },
  { name:'Cdt 1Lt. [Name]', rank:'ACA', role:'Academic Director', icon:'🎓' },
];

const PLATOONS = [
  { name:'Cdt 2Lt. [Name]', rank:'1PLT', role:'1st Platoon Leader', icon:'🪖' },
  { name:'Cdt 2Lt. [Name]', rank:'2PLT', role:'2nd Platoon Leader', icon:'🪖' },
  { name:'Cdt 2Lt. [Name]', rank:'3PLT', role:'3rd Platoon Leader', icon:'🪖' },
];

const CommanderCard = ({ c, className = '' }) => (
  <div className={`glass commander-card ${className}`}>
    <div className="commander-avatar">
      {c.icon}
      <div className="commander-rank">{c.rank}</div>
    </div>
    <h4>{c.name}</h4>
    <p>{c.role}</p>
    <div className="role"><span className="tag tag-green">{c.rank}</span></div>
  </div>
);

export default function Commanders() {
  return (
    <div className="page active" id="page-commanders">
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">⭐</div>
          <div><h2>COMPANY COMMANDERS</h2><p>ALFA COMPANY CHAIN OF COMMAND</p></div>
        </div>
      </div>
      
      <div className="hierarchy-container">
        <div className="hierarchy-tier">
          <CommanderCard c={CO} className="co-card glow-anim" />
        </div>
        
        <div className="hierarchy-tier">
          <CommanderCard c={XO} className="xo-card" />
        </div>
        
        <h3 className="tier-title">COMPANY STAFF & COUNCILS</h3>
        <div className="commanders-grid">
          {STAFF.map((c, i) => (
            <CommanderCard c={c} key={i} />
          ))}
        </div>
        
        <h3 className="tier-title">PLATOON LEADERS</h3>
        <div className="commanders-grid">
          {PLATOONS.map((c, i) => (
            <CommanderCard c={c} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
