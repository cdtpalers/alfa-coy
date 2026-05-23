import React from 'react';

const CO = { name: "CDT CPT 1CL DYLAN CLYVE E LUCERO C-27143 'A' CO CCAFP", rank: 'CO', role: 'Company Commander', icon: '🎖️' };
const XO = { name: "CDT LT 1CL JOHN REYMAR L ADTOON C-27002 'A' CO CCAFP", rank: 'EX-O', role: 'Executive Officer', icon: '⭐' };
const SGT = { name: "CDT F/SGT 2CL JIAN DALE V ALIVEN C-28018 'A' CO CCAFP", rank: '1SGT', role: 'First Sergeant', icon: '🛡️' };

const STAFF = [
  { name: "CDT LT 1CL MA. LYN L BERTE C-26056 'A' CO CCAFP", rank: 'S1', role: 'Personnel Officer', icon: '👤' },
  { name: "CDT LT 1CL CARLOS JOSE H REONAL C-27207 'A' CO CCAFP", rank: 'S2', role: 'Intelligence Officer', icon: '🔍' },
  { name: "CDT LT 1CL JOHN RAILEY C COCOY C-27056 'A' CO CCAFP", rank: 'S3', role: 'Operations Officer', icon: '⚙️' },
  { name: "CDT LT 1CL LIAM CARLOS M TORRES C-26332 'A' CO CCAFP", rank: 'S4', role: 'Logistics Officer', icon: '📦' },
  { name: "CDT LT 1CL ROCELLE N DE MESA C-27075 'A' CO CCAFP", rank: 'S5', role: 'Plans & Programs Officer', icon: '📊' },
  { name: "CDT LT 1CL REGINA T ATIWEN C-26027 'A' CO CCAFP", rank: 'S6', role: 'Signal Officer', icon: '📡' },
  { name: "CDT LT 1CL JEANN AVERY KURT M GUPAAL C-27121 'A' CO CCAFP", rank: 'S7', role: 'Civil-Military Officer', icon: '🤝' },
  { name: "CDT LT 1CL BARON JOSEPH A. CASTRO C-27048 'A' CO CCAFP", rank: 'S8', role: 'Education & Training Officer', icon: '🎓' },
  { name: "CDT LT 1CL ANGELICA D BACCAY C-27019 'A' CO CCAFP", rank: 'S10', role: 'Finance Officer', icon: '💰' },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA C-27123 'A' CO CCAFP", rank: 'RSO', role: 'Research & Studies Officer', icon: '🔬' },
  { name: "CDT LT 1CL JACKION A ENDINO C-27091 'A' CO CCAFP", rank: 'MESS-O', role: 'Mess Officer', icon: '🍽️' },
  { name: "CDT LT 1CL MARK ANGELO TRUMATA C-27246 'A' CO CCAFP", rank: 'ACQUISITION', role: 'Acquisition Officer', icon: '📈' },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA C-27123 'A' CO CCAFP", rank: 'ATHLETIC-O', role: 'Athletic Officer', icon: '🏃' },
  { name: "CDT LT 1CL JOHN ISAIAH E MIGUEL C-27162 'A' CO CCAFP", rank: 'MTO', role: 'Motor Transport Officer', icon: '🚛' },
  { name: "CDT LT 1CL ANGELICA D BACCAY C-27019 'A' CO CCAFP", rank: 'SPIRITUAL', role: 'Spiritual Development Officer', icon: '🙏' },
  { name: "CDT LT 1CL JERICHO B DECIERDO C-27078 'A' CO CCAFP", rank: 'SAFETY-O', role: 'Safety Officer', icon: '⚠️' },
  { name: "CDT LT 1CL CARLOS JOSE H REONAL C-27207 'A' CO CCAFP", rank: 'ACAD-O', role: 'Academic Officer', icon: '📚' },
  { name: "CDT LT 1CL REGINA T ATIWEN C-26027 'A' CO CCAFP", rank: 'GAD-O', role: 'Gender & Development Officer', icon: '⚖️' },
  { name: "CDT LT 1CL JETHRO ZEUS R AMANGAN C-25020 'A' CO CCAFP", rank: 'VESO', role: 'VESO Officer', icon: '🌟' },
];

const PLATOONS = [
  { name: "CDT LT 1CL JACKION A ENDINO C-27091 'A' CO CCAFP", rank: 'PL1', role: '1st Platoon Leader', icon: '🪖' },
  { name: "CDT LT 1CL JOHN ISAIAH E MIGUEL C-27162 'A' CO CCAFP", rank: 'PL2', role: '2nd Platoon Leader', icon: '🪖' },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA C-27123 'A' CO CCAFP", rank: 'PL3', role: '3rd Platoon Leader', icon: '🪖' },
  { name: "CDT LT 1CL JERICHO B DECIERDO C-27078 'A' CO CCAFP", rank: 'PL4', role: '4th Platoon Leader', icon: '🪖' },
];

const CCPB = [
  { name: "CDT LT 1CL BARON JOSEPH A. CASTRO C-27048 'A' CO CCAFP", rank: 'CCPB', role: 'CCPB Representative', icon: '👮' },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA C-27123 'A' CO CCAFP", rank: 'CCPB', role: 'CCPB Representative', icon: '👮' },
  { name: "CDT LT 1CL REGINA T ATIWEN C-26027 'A' CO CCAFP", rank: 'CCPB', role: 'CCPB Representative', icon: '👮' },
];

const HONOR_COMM = [
  { name: "CDT LT 1CL KRISTINE AIRA M FELIPE C-26151 'A' CO CCAFP", rank: 'HONOR', role: 'Honor Committee Rep', icon: '⚖️' },
  { name: "CDT LT 1CL MARK LESTER R GRATIL C-25154 'A' CO CCAFP", rank: 'HONOR', role: 'Honor Committee Rep', icon: '⚖️' },
  { name: "CDT LT 1CL JACKION A ENDINO C-27091 'A' CO CCAFP", rank: 'HONOR', role: 'Honor Committee Rep', icon: '⚖️' },
  { name: "CDT LT 1CL JAY MAR DC OPLE C-27178 'A' CO CCAFP", rank: 'HONOR', role: 'Honor Committee Rep', icon: '⚖️' },
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
          <CommanderCard c={SGT} className="sgt-card" />
        </div>
        
        <h3 className="tier-title">COMPANY STAFF OFFICERS</h3>
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

        <h3 className="tier-title">CADET CORPS POLICE BULLETIN (CCPB)</h3>
        <div className="commanders-grid">
          {CCPB.map((c, i) => (
            <CommanderCard c={c} key={i} />
          ))}
        </div>

        <h3 className="tier-title">HONOR COMMITTEE</h3>
        <div className="commanders-grid">
          {HONOR_COMM.map((c, i) => (
            <CommanderCard c={c} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
