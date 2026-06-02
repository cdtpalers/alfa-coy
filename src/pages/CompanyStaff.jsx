import React from 'react';

const CO = { name: "CDT CPT 1CL DYLAN CLYVE E LUCERO C-27143 'A' CO CCAFP", rank: 'CO', role: 'Company Commander', image: '/lucero.jpg', icon: <i className="fa-solid fa-medal" style={{color: '#FFD700'}}></i> };
const XO = { name: "CDT LT 1CL JOHN REYMAR L ADTOON C-27002 'A' CO CCAFP", rank: 'EX-O', role: 'Executive Officer', image: '/adtoon.jpg', icon: <i className="fa-solid fa-star" style={{color: '#FFD700'}}></i> };
const SGT = { name: "CDT F/SGT 2CL JIAN DALE V ALIVEN C-28018 'A' CO CCAFP", rank: '1SGT', role: 'First Sergeant', icon: <i className="fa-solid fa-shield-halved" style={{color: '#4CAF50'}}></i> };

const STAFF = [
  { name: "CDT LT 1CL MA. LYN L BERTE C-26056 'A' CO CCAFP", rank: 'S1', role: 'Personnel Officer', image: '/berte.jpg', icon: <i className="fa-solid fa-user"></i> },
  { name: "CDT LT 1CL CARLOS JOSE H REONAL C-27207 'A' CO CCAFP", rank: 'S2', role: 'Intelligence Officer', image: '/reonal.jpg', icon: <i className="fa-solid fa-magnifying-glass"></i> },
  { name: "CDT LT 1CL JOHN RAILEY C COCOY C-27056 'A' CO CCAFP", rank: 'S3', role: 'Operations Officer', image: '/cocoy.jpg', icon: <i className="fa-solid fa-gear"></i> },
  { name: "CDT LT 1CL LIAM CARLOS M TORRES C-26332 'A' CO CCAFP", rank: 'S4', role: 'Logistics Officer', image: '/torres.jpg', icon: <i className="fa-solid fa-box"></i> },
  { name: "CDT LT 1CL ROCELLE N DE MESA C-27075 'A' CO CCAFP", rank: 'S5', role: 'Plans & Programs Officer', image: '/demesa.jpg', icon: <i className="fa-solid fa-chart-column"></i> },
  { name: "CDT LT 1CL REGINA T ATIWEN C-26027 'A' CO CCAFP", rank: 'S6', role: 'Signal Officer', image: '/atiwen.jpg', icon: <i className="fa-solid fa-satellite-dish"></i> },
  { name: "CDT LT 1CL JEANN AVERY KURT M GUPAAL C-27121 'A' CO CCAFP", rank: 'S7', role: 'Civil-Military Officer', icon: <i className="fa-solid fa-handshake"></i> },
  { name: "CDT LT 1CL BARON JOSEPH A. CASTRO C-27048 'A' CO CCAFP", rank: 'S8', role: 'Education & Training Officer', icon: <i className="fa-solid fa-graduation-cap"></i> },
  { name: "CDT LT 1CL ANGELICA D BACCAY C-27019 'A' CO CCAFP", rank: 'S10', role: 'Finance Officer', icon: <i className="fa-solid fa-coins"></i> },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA C-27123 'A' CO CCAFP", rank: 'RSO', role: 'Research & Studies Officer', icon: <i className="fa-solid fa-microscope"></i> },
  { name: "CDT LT 1CL JACKION A ENDINO C-27091 'A' CO CCAFP", rank: 'MESS-O', role: 'Mess Officer', icon: <i className="fa-solid fa-utensils"></i> },
  { name: "CDT LT 1CL MARK ANGELO TRUMATA C-27246 'A' CO CCAFP", rank: 'ACQUISITION', role: 'Acquisition Officer', icon: <i className="fa-solid fa-chart-line"></i> },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA C-27123 'A' CO CCAFP", rank: 'ATHLETIC-O', role: 'Athletic Officer', icon: <i className="fa-solid fa-person-running"></i> },
  { name: "CDT LT 1CL JOHN ISAIAH E MIGUEL C-27162 'A' CO CCAFP", rank: 'MTO', role: 'Motor Transport Officer', icon: <i className="fa-solid fa-truck"></i> },
  { name: "CDT LT 1CL ANGELICA D BACCAY C-27019 'A' CO CCAFP", rank: 'SPIRITUAL', role: 'Spiritual Development Officer', icon: <i className="fa-solid fa-hands-praying"></i> },
  { name: "CDT LT 1CL JERICHO B DECIERDO C-27078 'A' CO CCAFP", rank: 'SAFETY-O', role: 'Safety Officer', icon: <i className="fa-solid fa-triangle-exclamation"></i> },
  { name: "CDT LT 1CL CARLOS JOSE H REONAL C-27207 'A' CO CCAFP", rank: 'ACAD-O', role: 'Academic Officer', icon: <i className="fa-solid fa-book"></i> },
  { name: "CDT LT 1CL REGINA T ATIWEN C-26027 'A' CO CCAFP", rank: 'GAD-O', role: 'Gender & Development Officer', icon: <i className="fa-solid fa-scale-balanced"></i> },
  { name: "CDT LT 1CL JETHRO ZEUS R AMANGAN C-25020 'A' CO CCAFP", rank: 'VESO', role: 'VESO Officer', icon: <i className="fa-solid fa-star-of-life"></i> },
];

const PLATOONS = [
  { name: "CDT LT 1CL JACKION A ENDINO C-27091 'A' CO CCAFP", rank: 'PL1', role: '1st Platoon Leader', icon: <i className="fa-solid fa-shield"></i> },
  { name: "CDT LT 1CL JOHN ISAIAH E MIGUEL C-27162 'A' CO CCAFP", rank: 'PL2', role: '2nd Platoon Leader', icon: <i className="fa-solid fa-shield"></i> },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA C-27123 'A' CO CCAFP", rank: 'PL3', role: '3rd Platoon Leader', icon: <i className="fa-solid fa-shield"></i> },
  { name: "CDT LT 1CL JERICHO B DECIERDO C-27078 'A' CO CCAFP", rank: 'PL4', role: '4th Platoon Leader', icon: <i className="fa-solid fa-shield"></i> },
];

const CCPB = [
  { name: "CDT LT 1CL BARON JOSEPH A. CASTRO C-27048 'A' CO CCAFP", rank: 'CCPB', role: 'CCPB Representative', icon: <i className="fa-solid fa-user-shield"></i> },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA C-27123 'A' CO CCAFP", rank: 'CCPB', role: 'CCPB Representative', icon: <i className="fa-solid fa-user-shield"></i> },
  { name: "CDT LT 1CL REGINA T ATIWEN C-26027 'A' CO CCAFP", rank: 'CCPB', role: 'CCPB Representative', icon: <i className="fa-solid fa-user-shield"></i> },
];

const HONOR_COMM = [
  { name: "CDT LT 1CL KRISTINE AIRA M FELIPE C-26151 'A' CO CCAFP", rank: 'HONOR', role: 'Honor Committee Rep', icon: <i className="fa-solid fa-scale-balanced"></i> },
  { name: "CDT LT 1CL MARK LESTER R GRATIL C-25154 'A' CO CCAFP", rank: 'HONOR', role: 'Honor Committee Rep', icon: <i className="fa-solid fa-scale-balanced"></i> },
  { name: "CDT LT 1CL JACKION A ENDINO C-27091 'A' CO CCAFP", rank: 'HONOR', role: 'Honor Committee Rep', icon: <i className="fa-solid fa-scale-balanced"></i> },
  { name: "CDT LT 1CL JAY MAR DC OPLE C-27178 'A' CO CCAFP", rank: 'HONOR', role: 'Honor Committee Rep', icon: <i className="fa-solid fa-scale-balanced"></i> },
];

const CommanderCard = ({ c, className = '' }) => (
  <div className={`glass commander-card ${className}`}>
    <div className="commander-avatar">
      {c.image ? (
        <img src={c.image} alt={c.name} className="commander-img" />
      ) : (
        c.icon
      )}
      <div className="commander-rank">{c.rank}</div>
    </div>
    <h4>{c.name}</h4>
    <p>{c.role}</p>
    <div className="role"><span className="tag tag-green">{c.rank}</span></div>
  </div>
);

export default function CompanyStaff() {
  return (
    <div className="page active" id="page-commanders">
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">⭐</div>
          <div><h2>COMPANY STAFF</h2><p>ALFA COMPANY STAFF & PLATOON LEADERS</p></div>
        </div>
      </div>
      
      <div className="hierarchy-container">
        <div className="hierarchy-tier" style={{ marginBottom: 0 }}>
          <CommanderCard c={CO} className="co-card glow-anim" />
        </div>
        
        <div className="tree-line"></div>
        <div className="tree-horizontal-branch"></div>
        
        <div className="hierarchy-tier" style={{ marginTop: '20px' }}>
          <CommanderCard c={XO} className="xo-card" />
          <CommanderCard c={SGT} className="sgt-card" />
        </div>
        
        <div className="tree-line"></div>
        
        <h3 className="tier-title" style={{ width: '100%', marginTop: 0 }}>COMPANY STAFF OFFICERS</h3>
        <div className="commanders-grid" style={{ width: '100%' }}>
          {STAFF.map((c, i) => (
            <CommanderCard c={c} key={i} />
          ))}
        </div>
        
        <div className="tree-line"></div>
        
        <h3 className="tier-title" style={{ width: '100%', marginTop: 0 }}>PLATOON LEADERS</h3>
        <div className="commanders-grid" style={{ width: '100%' }}>
          {PLATOONS.map((c, i) => (
            <CommanderCard c={c} key={i} />
          ))}
        </div>

        <div className="tree-line"></div>

        <h3 className="tier-title" style={{ width: '100%', marginTop: 0 }}>CADET CORPS POLICE BULLETIN (CCPB)</h3>
        <div className="commanders-grid" style={{ width: '100%' }}>
          {CCPB.map((c, i) => (
            <CommanderCard c={c} key={i} />
          ))}
        </div>

        <div className="tree-line"></div>

        <h3 className="tier-title" style={{ width: '100%', marginTop: 0 }}>HONOR COMMITTEE</h3>
        <div className="commanders-grid" style={{ width: '100%' }}>
          {HONOR_COMM.map((c, i) => (
            <CommanderCard c={c} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
