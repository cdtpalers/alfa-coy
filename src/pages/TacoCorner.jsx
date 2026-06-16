import React from 'react';
import AnnCard from '../components/AnnCard';
import { SkeletonGrid } from '../components/Skeleton';

export default function TacoCorner({ announcements, loading }) {
  // Filter announcements for the TAC-O's corner
  const tacoAnnouncements = announcements.filter(
    (d) => d.Council && d.Council.toLowerCase() === 'taco-corner'
  );

  return (
    <div className="page active" id="page-taco-corner">
      {/* Premium Hero Section */}
      <div 
        className="glass" 
        style={{
          position: 'relative',
          padding: '60px 40px',
          textAlign: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a0e0a 0%, #152217 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
          borderRadius: '24px'
        }}
      >
        {/* Subtle gold glow behind */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            color: '#d4af37',
            textShadow: '0 2px 10px rgba(212,175,55,0.4)'
          }}>
            <i className="fa fa-hands-holding"></i>
          </div>
          <h1 style={{ 
            fontFamily: '"Times New Roman", Times, serif', 
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
            fontWeight: '600',
            letterSpacing: '4px',
            color: '#fdfbf7',
            margin: '0 0 10px 0',
            textTransform: 'uppercase'
          }}>
            MAJ FEL SAGUIN
          </h1>
          <p style={{
            fontSize: '1.2rem',
            letterSpacing: '6px',
            color: '#d4af37',
            fontWeight: '500',
            margin: '0 0 24px 0',
            textTransform: 'uppercase'
          }}>
            Company Tactical Officer
          </p>
          
          <div style={{
            width: '60px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
            margin: '0 auto 24px auto'
          }}></div>

          <p style={{
            maxWidth: '600px',
            margin: '0 auto',
            color: '#a0b0a2',
            fontSize: '1rem',
            lineHeight: '1.6',
            fontStyle: 'italic'
          }}>
            "Discipline is the bridge between goals and accomplishment. Excellence is not an act, but a habit."
          </p>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: '40px' }}>
        <div className="section-title">
          <div className="section-icon" style={{ background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}>
            <i className="fa fa-scroll"></i>
          </div>
          <div>
            <h2 style={{ color: 'var(--text)' }}>OFFICIAL DIRECTIVES</h2>
            <p>ANNOUNCEMENTS FROM THE TAC-O</p>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : tacoAnnouncements.length ? (
        <div className="grid-3">
          {tacoAnnouncements.map((item, i) => (
            <div key={i} style={{
              position: 'relative',
              borderRadius: 'var(--border-radius)',
              overflow: 'hidden'
            }}>
              {/* Optional: Add a subtle gold accent to these specific cards to tie into the theme */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #d4af37, #f3e5ab)',
                zIndex: 10
              }}></div>
              <AnnCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass empty-state" style={{
          gridColumn: '1/-1',
          border: '1px dashed rgba(212, 175, 55, 0.4)',
          background: 'rgba(212, 175, 55, 0.02)'
        }}>
          <i className="fa fa-scroll" style={{ color: '#d4af37' }}></i>
          <p style={{ color: 'var(--text-muted)' }}>
            No official directives posted at this time.
          </p>
        </div>
      )}
    </div>
  );
}
