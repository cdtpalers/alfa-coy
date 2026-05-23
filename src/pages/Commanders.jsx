import React from 'react';

const COMMANDERS = [
  { name:'Cdt Col. [Name]', rank:'CO', role:'Company Commander', icon:'🎖️' },
  { name:'Cdt Lt Col. [Name]', rank:'XO', role:'Executive Officer', icon:'⭐' },
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
  { name:'Cdt 2Lt. [Name]', rank:'1PLT', role:'1st Platoon Leader', icon:'🪖' },
  { name:'Cdt 2Lt. [Name]', rank:'2PLT', role:'2nd Platoon Leader', icon:'🪖' },
  { name:'Cdt 2Lt. [Name]', rank:'3PLT', role:'3rd Platoon Leader', icon:'🪖' },
];

export default function Commanders() {
  return (
    <div className="page active" id="page-commanders">
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">⭐</div>
          <div><h2>COMPANY COMMANDERS</h2><p>ALFA COMPANY CHAIN OF COMMAND</p></div>
        </div>
      </div>
      <div className="commanders-grid">
        {COMMANDERS.map((c, i) => (
          <div className="glass commander-card" key={i}>
            <div className="commander-avatar">
              {c.icon}
              <div className="commander-rank">{c.rank}</div>
            </div>
            <h4>{c.name}</h4>
            <p>{c.role}</p>
            <div className="role"><span className="tag tag-green">{c.rank}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
