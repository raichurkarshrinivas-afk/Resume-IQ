/**
 * Resume3DScene — Persistent, transforming 3D paper resume sculpture.
 * Implements Option A (CSS 3D perspective, preserve-3d, hardware-accelerated transforms).
 *
 * Features:
 * - 5 distinct chapter transformation states
 * - Warm-white paper (#FFFEF9) with offset backing sheet (#E5E2D9)
 * - Muted sage surfaces (#DDE1D4) and stone borders (#D4D2CA)
 * - Subtle bounded pointer tilt (disabled when reducedMotion = true)
 * - Thin orbital dashed ring and single decorative accent cube
 * - Fully accessible: marked aria-hidden="true" to isolate from screen readers
 */

import { useRef, useEffect, useState } from 'react';

export default function Resume3DScene({ activeChapter = 0, reducedMotion = false }) {
  const containerRef = useRef(null);
  const rigRef = useRef(null);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  // Chapter base rotations (degrees)
  const CHAPTER_RIG_TRANSFORMS = [
    { rx: 18, ry: -22, rz: 3, ty: 0 },    // 0: Potential (scattered, tilted)
    { rx: 12, ry: -10, rz: 0, ty: 0 },    // 1: Clarity (assembled, scanning)
    { rx: 24, ry: -26, rz: 2, ty: -10 },   // 2: Evidence (exploded depth planes)
    { rx: 8, ry: 16, rz: -1, ty: 0 },     // 3: Rewrite (viewing angle change + demo card)
    { rx: 4, ry: -4, rz: 0, ty: 0 },      // 4: Next Chapter (composed, front-facing)
  ];

  const currentTransform = CHAPTER_RIG_TRANSFORMS[activeChapter] || CHAPTER_RIG_TRANSFORMS[0];

  // Mouse move handler for bounded pointer tilt on hover-capable devices
  const handleMouseMove = (e) => {
    if (reducedMotion) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    // Bounded tilt between -5 and +5 degrees
    setPointerOffset({ x: nx * 8, y: -ny * 8 });
  };

  const handleMouseLeave = () => {
    setPointerOffset({ x: 0, y: 0 });
  };

  const finalRx = reducedMotion ? 0 : currentTransform.rx + pointerOffset.y;
  const finalRy = reducedMotion ? 0 : currentTransform.ry + pointerOffset.x;
  const finalRz = reducedMotion ? 0 : currentTransform.rz;

  // Chapter-specific layer offsets
  const isExploded = activeChapter === 2 && !reducedMotion;
  const isScattered = activeChapter === 0 && !reducedMotion;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="scene-viewport"
      aria-hidden="true"
    >
      {/* Orbital Ring Accent */}
      {!reducedMotion && (
        <div
          className="orbital-ring"
          style={{
            transform: `translateZ(-30px) rotateX(68deg) rotateZ(${activeChapter * 15}deg)`,
            transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      {/* Decorative Minimalist 22px Cube */}
      {!reducedMotion && (
        <div
          className="decorative-cube"
          style={{
            top: '40px',
            right: '28px',
            transform: `translateZ(${activeChapter === 2 ? 60 : 20}px) rotateX(${45 + activeChapter * 10}deg) rotateY(${45 + activeChapter * 20}deg)`,
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      {/* Main 3D Rig */}
      <div
        ref={rigRef}
        className="sculpture-rig"
        style={{
          transform: `rotateX(${finalRx}deg) rotateY(${finalRy}deg) rotateZ(${finalRz}deg) translateY(${currentTransform.ty}px)`,
        }}
      >
        {/* Offset Backing Sheet (Creates physical document depth) */}
        <div className="sculpture-backing" />

        {/* Main Document Paper Sheet */}
        <div className="sculpture-main-sheet">
          {/* Subtle Sage Scanning Line (Chapter 1 / Clarity) */}
          {activeChapter === 1 && !reducedMotion && (
            <div
              className="scan-line"
              style={{
                animation: 'scanMove 2.4s ease-in-out infinite alternate',
              }}
            />
          )}

          {/* Panel 1: Document Header */}
          <div
            className="resume-panel"
            style={{
              transform: isExploded
                ? 'translateZ(40px)'
                : isScattered
                ? 'translateZ(14px) rotateZ(-1.5deg)'
                : 'translateZ(0px)',
              background: activeChapter === 4 ? '#F4F6F1' : '#FFFFFF',
              borderLeft: activeChapter === 4 ? '3px solid #8E9185' : '1px solid var(--story-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ width: '110px', height: '10px', background: '#242523', borderRadius: '3px' }} />
              <div style={{ width: '45px', height: '6px', background: '#D4D2CA', borderRadius: '2px' }} />
            </div>
            <div style={{ width: '170px', height: '6px', background: '#8E9185', borderRadius: '2px', opacity: 0.75 }} />
          </div>

          {/* Panel 2: Experience (Lifts furthest in Evidence chapter) */}
          <div
            className="resume-panel"
            style={{
              transform: isExploded
                ? 'translateZ(85px)'
                : isScattered
                ? 'translateZ(26px) rotateZ(2deg)'
                : 'translateZ(0px)',
              boxShadow: isExploded ? '0 16px 28px -8px rgba(36, 37, 35, 0.16)' : 'none',
              background: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8E9185' }}>
                EXPERIENCE
              </span>
              {isExploded && (
                <span style={{ fontSize: '8px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: '#DDE1D4', color: '#242523' }}>
                  EVIDENCE LAYER
                </span>
              )}
            </div>
            <div style={{ width: '140px', height: '7px', background: '#242523', borderRadius: '2px', marginBottom: '6px' }} />
            <div style={{ width: '92%', height: '5px', background: '#696A65', borderRadius: '2px', marginBottom: '4px', opacity: 0.8 }} />
            <div style={{ width: '84%', height: '5px', background: '#696A65', borderRadius: '2px', opacity: 0.6 }} />
          </div>

          {/* Panel 3: Projects */}
          <div
            className="resume-panel"
            style={{
              transform: isExploded
                ? 'translateZ(55px)'
                : isScattered
                ? 'translateZ(10px) rotateZ(-1.8deg)'
                : 'translateZ(0px)',
              background: '#FFFFFF',
            }}
          >
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8E9185', display: 'block', marginBottom: '6px' }}>
              PROJECTS & ARCHITECTURE
            </span>
            <div style={{ width: '120px', height: '7px', background: '#242523', borderRadius: '2px', marginBottom: '5px' }} />
            <div style={{ width: '88%', height: '5px', background: '#696A65', borderRadius: '2px', opacity: 0.7 }} />
          </div>

          {/* Panel 4: Skills */}
          <div
            className="resume-panel"
            style={{
              transform: isExploded
                ? 'translateZ(25px)'
                : isScattered
                ? 'translateZ(18px) rotateZ(1.2deg)'
                : 'translateZ(0px)',
              background: '#FFFFFF',
            }}
          >
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8E9185', display: 'block', marginBottom: '6px' }}>
              SKILLS & COMPETENCIES
            </span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Distributed Systems'].map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    background: '#F0F3EC',
                    border: '1px solid #D4D2CA',
                    borderRadius: '4px',
                    color: '#242523',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Floating Labels per Chapter ── */}
        {activeChapter === 0 && (
          <div
            className="scene-pill"
            style={{
              top: '18px',
              right: '-18px',
              transform: 'translateZ(45px)',
            }}
          >
            Scattered potential.
          </div>
        )}

        {activeChapter === 1 && (
          <div
            className="scene-pill"
            style={{
              top: '28px',
              right: '-10px',
              transform: 'translateZ(35px)',
            }}
          >
            Review before analysis. (Illustrative)
          </div>
        )}

        {activeChapter === 2 && (
          <div
            className="scene-pill"
            style={{
              top: '120px',
              right: '-32px',
              transform: 'translateZ(110px)',
            }}
          >
            Evidence, not assumptions.
          </div>
        )}

        {activeChapter === 3 && (
          <>
            <div
              className="scene-pill"
              style={{
                top: '20px',
                left: '-20px',
                transform: 'translateZ(40px)',
              }}
            >
              Your facts. Better framed.
            </div>

            {/* Small Sample Alignment Card (Strictly labeled DEMO) */}
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                right: '-28px',
                background: '#FFFEF9',
                border: '1px solid #D4D2CA',
                borderRadius: '8px',
                padding: '10px 14px',
                boxShadow: '0 12px 24px -6px rgba(36, 37, 35, 0.12)',
                transform: 'translateZ(65px)',
                width: '160px',
              }}
            >
              <span style={{ fontSize: '10px', color: '#8E9185', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                Sample alignment
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '2px 0' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#242523' }}>82</span>
                <span style={{ fontSize: '11px', color: '#696A65' }}>/ 100</span>
              </div>
              <span
                style={{
                  fontSize: '8px',
                  fontWeight: 700,
                  color: '#B45309',
                  background: '#FFFBEB',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  display: 'inline-block',
                }}
              >
                DEMO — NOT A REAL RESULT
              </span>
            </div>
          </>
        )}

        {activeChapter === 4 && (
          <div
            className="scene-pill"
            style={{
              bottom: '40px',
              right: '-16px',
              transform: 'translateZ(35px)',
            }}
          >
            A story you can stand behind.
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanMove {
          0% { top: 10%; opacity: 0.2; }
          50% { opacity: 0.9; }
          100% { top: 88%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
