import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ───────────────────────────────────────────
   DATA — icon class strings, not JSX elements
   ─────────────────────────────────────────── */

const COMMAND = [
  { name: "CDT CPT 1CL DYLAN CLYVE E LUCERO", serial: 'C-27143', role: 'Company Commander', rank: 'CO', image: '/lucero.webp', icon: 'fa-solid fa-medal', tier: 'command' },
  { name: "CDT LT 1CL JOHN REYMAR L ADTOON", serial: 'C-27002', role: 'Executive Officer', rank: 'EX-O', image: '/adtoon.webp', icon: 'fa-solid fa-star', tier: 'senior' },
  { name: "CDT F/SGT 2CL JIAN DALE V ALIVEN", serial: 'C-28018', role: 'First Sergeant', rank: '1SGT', image: '/aliven.webp', icon: 'fa-solid fa-shield-halved', tier: 'senior' },
];

const STAFF = [
  { name: "CDT LT 1CL MA. LYN L BERTE", serial: 'C-26056', role: 'Personnel Officer', rank: 'S1', image: '/berte.webp', icon: 'fa-solid fa-user' },
  { name: "CDT LT 1CL CARLOS JOSE H REONAL", serial: 'C-27207', role: 'Intelligence Officer', rank: 'S2', image: '/reonal.webp', icon: 'fa-solid fa-magnifying-glass' },
  { name: "CDT LT 1CL JOHN RAILEY C COCOY", serial: 'C-27056', role: 'Operations Officer', rank: 'S3', image: '/cocoy.webp', icon: 'fa-solid fa-gear' },
  { name: "CDT LT 1CL LIAM CARLOS M TORRES", serial: 'C-26332', role: 'Logistics Officer', rank: 'S4', image: '/torres.webp', icon: 'fa-solid fa-box' },
  { name: "CDT LT 1CL ROCELLE N DE MESA", serial: 'C-27075', role: 'Plans & Programs Officer', rank: 'S5', image: '/demesa.webp', icon: 'fa-solid fa-chart-column' },
  { name: "CDT LT 1CL REGINA T ATIWEN", serial: 'C-26027', role: 'Signal Officer', rank: 'S6', image: '/atiwen.webp', icon: 'fa-solid fa-satellite-dish' },
  { name: "CDT LT 1CL JEANN AVERY KURT M GUPAAL", serial: 'C-27121', role: 'Civil-Military Officer', rank: 'S7', image: '/gupaal.webp', icon: 'fa-solid fa-handshake' },
  { name: "CDT LT 1CL BARON JOSEPH A. CASTRO", serial: 'C-27048', role: 'Education & Training Officer', rank: 'S8', image: '/castro.webp', icon: 'fa-solid fa-graduation-cap' },
  { name: "CDT LT 1CL ANGELICA D BACCAY", serial: 'C-27019', role: 'Finance Officer', rank: 'S10', image: '/baccay.webp', icon: 'fa-solid fa-coins' },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA", serial: 'C-27123', role: 'Responsible Supply Officer', rank: 'RSO', image: '/idulsa.webp', icon: 'fa-solid fa-boxes-stacked' },
  { name: "CDT LT 1CL JACKION A ENDINO", serial: 'C-27091', role: 'Mess Officer', rank: 'MESS-O', image: '/endino.webp', icon: 'fa-solid fa-utensils' },
  { name: "CDT LT 1CL MARK ANGELO TRUMATA", serial: 'C-27246', role: 'Acquisition Officer', rank: 'ACQ', image: '/trumata.webp', icon: 'fa-solid fa-chart-line' },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA", serial: 'C-27123', role: 'Athletic Officer', rank: 'ATH-O', image: '/idulsa.webp', icon: 'fa-solid fa-person-running' },
  { name: "CDT LT 1CL JOHN ISAIAH E MIGUEL", serial: 'C-27162', role: 'Military Training Officer', rank: 'MTO', image: '/miguel.webp', icon: 'fa-solid fa-person-military-rifle' },
  { name: "CDT LT 1CL ANGELICA D BACCAY", serial: 'C-27019', role: 'Spiritual Development Officer', rank: 'SPRTL', image: '/baccay.webp', icon: 'fa-solid fa-hands-praying' },
  { name: "CDT LT 1CL JERICHO B DECIERDO", serial: 'C-27078', role: 'Safety Officer', rank: 'SFTY-O', image: '/decierdo.webp', icon: 'fa-solid fa-triangle-exclamation' },
  { name: "CDT LT 1CL CARLOS JOSE H REONAL", serial: 'C-27207', role: 'Academic Officer', rank: 'ACAD-O', image: '/reonal.webp', icon: 'fa-solid fa-book' },
  { name: "CDT LT 1CL REGINA T ATIWEN", serial: 'C-26027', role: 'Gender & Development Officer', rank: 'GAD-O', image: '/atiwen.webp', icon: 'fa-solid fa-scale-balanced' },
  { name: "CDT LT 1CL JETHRO ZEUS R AMANGAN", serial: 'C-25020', role: 'VESO Officer', rank: 'VESO', icon: 'fa-solid fa-star-of-life' },
];

const PLATOONS = [
  { name: "CDT LT 1CL JACKION A ENDINO", serial: 'C-27091', role: '1st Platoon Leader', rank: 'PL1', image: '/endino.webp', icon: 'fa-solid fa-shield' },
  { name: "CDT LT 1CL JOHN ISAIAH E MIGUEL", serial: 'C-27162', role: '2nd Platoon Leader', rank: 'PL2', image: '/miguel.webp', icon: 'fa-solid fa-shield' },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA", serial: 'C-27123', role: '3rd Platoon Leader', rank: 'PL3', image: '/idulsa.webp', icon: 'fa-solid fa-shield' },
  { name: "CDT LT 1CL JERICHO B DECIERDO", serial: 'C-27078', role: '4th Platoon Leader', rank: 'PL4', image: '/decierdo.webp', icon: 'fa-solid fa-shield' },
];

const CCPB = [
  { name: "CDT LT 1CL BARON JOSEPH A. CASTRO", serial: 'C-27048', role: 'CCPB Representative', rank: 'CCPB', image: '/castro.webp', icon: 'fa-solid fa-user-shield' },
  { name: "CDT LT 1CL JAY BRUCE D IDULSA", serial: 'C-27123', role: 'CCPB Representative', rank: 'CCPB', image: '/idulsa.webp', icon: 'fa-solid fa-user-shield' },
  { name: "CDT LT 1CL REGINA T ATIWEN", serial: 'C-26027', role: 'CCPB Representative', rank: 'CCPB', image: '/atiwen.webp', icon: 'fa-solid fa-user-shield' },
];

const HONOR_COMM = [
  { name: "CDT LT 1CL KRISTINE AIRA M FELIPE", serial: 'C-26151', role: 'Honor Committee Rep', rank: 'HONOR', icon: 'fa-solid fa-scale-balanced' },
  { name: "CDT LT 1CL MARK LESTER R GRATIL", serial: 'C-25154', role: 'Honor Committee Rep', rank: 'HONOR', icon: 'fa-solid fa-scale-balanced' },
  { name: "CDT LT 1CL JACKION A ENDINO", serial: 'C-27091', role: 'Honor Committee Rep', rank: 'HONOR', image: '/endino.webp', icon: 'fa-solid fa-scale-balanced' },
  { name: "CDT LT 1CL JAY MAR DC OPLE", serial: 'C-27178', role: 'Honor Committee Rep', rank: 'HONOR', icon: 'fa-solid fa-scale-balanced' },
];

/* ───────────────────────────────────────────
   LAZY IMAGE — IntersectionObserver + skeleton
   ─────────────────────────────────────────── */

function LazyImage({ src, alt }) {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="staff-card__image-wrap" ref={imgRef}>
      {/* Shimmer skeleton shown until image loads */}
      {!isLoaded && <div className="staff-card__skeleton" />}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          className={`staff-card__photo ${isLoaded ? 'loaded' : ''}`}
          onLoad={() => setIsLoaded(true)}
          decoding="async"
        />
      )}
    </div>
  );
}

/* ───────────────────────────────────────────
   STAFF CARD — unified, consistent sizing
   ─────────────────────────────────────────── */

function StaffCard({ person, index = 0, tier = 'staff' }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '50px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tierClass = `staff-card--${tier}`;
  const delay = `${index * 60}ms`;

  return (
    <div
      ref={cardRef}
      className={`staff-card ${tierClass} ${isVisible ? 'staff-card--visible' : ''}`}
      style={{ animationDelay: delay }}
    >
      {/* Image area */}
      {person.image ? (
        <LazyImage src={person.image} alt={person.name} />
      ) : (
        <div className="staff-card__avatar">
          <i className={person.icon} />
        </div>
      )}

      {/* Info area */}
      <div className="staff-card__info">
        <span className={`staff-card__rank-badge staff-card__rank-badge--${tier}`}>
          {person.rank}
        </span>
        <h4 className="staff-card__name">{person.name}</h4>
        {person.serial && (
          <span className="staff-card__serial">{person.serial}</span>
        )}
        <p className="staff-card__role">{person.role}</p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   SECTION DIVIDER — military-style header
   ─────────────────────────────────────────── */

function SectionDivider({ icon, title, count }) {
  return (
    <div className="staff-divider">
      <div className="staff-divider__line" />
      <div className="staff-divider__label">
        <i className={icon} />
        <span>{title}</span>
        {count != null && <span className="staff-divider__count">{count}</span>}
      </div>
      <div className="staff-divider__line" />
    </div>
  );
}

/* ───────────────────────────────────────────
   PAGE
   ─────────────────────────────────────────── */

export default function CompanyStaff() {
  return (
    <div className="staff-page" id="page-commanders">
      {/* Hero Banner */}
      <div className="staff-hero">
        <div className="staff-hero__badge">
          <i className="fa-solid fa-shield-halved" />
        </div>
        <div className="staff-hero__text">
          <h1>ALFA COMPANY</h1>
          <p>CORPS OF CADETS, ARMED FORCES OF THE PHILIPPINES</p>
          <span className="staff-hero__subtitle">Company Staff Organization</span>
        </div>
        <div className="staff-hero__accent" />
      </div>

      {/* ── COMMAND GROUP ── */}
      <SectionDivider icon="fa-solid fa-star" title="COMMAND GROUP" count={3} />

      <div className="staff-grid staff-grid--command">
        {COMMAND.map((p, i) => (
          <StaffCard key={`cmd-${i}`} person={p} index={i} tier={p.tier} />
        ))}
      </div>

      {/* ── STAFF OFFICERS ── */}
      <SectionDivider icon="fa-solid fa-briefcase" title="COMPANY STAFF OFFICERS" count={STAFF.length} />

      <div className="staff-grid">
        {STAFF.map((p, i) => (
          <StaffCard key={`staff-${i}`} person={p} index={i} tier="staff" />
        ))}
      </div>

      {/* ── PLATOON LEADERS ── */}
      <SectionDivider icon="fa-solid fa-people-group" title="PLATOON LEADERS" count={PLATOONS.length} />

      <div className="staff-grid">
        {PLATOONS.map((p, i) => (
          <StaffCard key={`plt-${i}`} person={p} index={i} tier="platoon" />
        ))}
      </div>

      {/* ── CCPB ── */}
      <SectionDivider icon="fa-solid fa-gavel" title="CADET CONDUCT POLICY BOARD" count={CCPB.length} />

      <div className="staff-grid">
        {CCPB.map((p, i) => (
          <StaffCard key={`ccpb-${i}`} person={p} index={i} tier="committee" />
        ))}
      </div>

      {/* ── HONOR COMMITTEE ── */}
      <SectionDivider icon="fa-solid fa-scale-balanced" title="HONOR COMMITTEE" count={HONOR_COMM.length} />

      <div className="staff-grid">
        {HONOR_COMM.map((p, i) => (
          <StaffCard key={`honor-${i}`} person={p} index={i} tier="committee" />
        ))}
      </div>
    </div>
  );
}
