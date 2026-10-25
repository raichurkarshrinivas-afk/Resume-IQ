/**
 * MobileChapterCard — Compact, static chapter illustration card for mobile viewports (< 960px).
 * Eliminates large WebGL / heavy 3D canvases on mobile while preserving the same warm-white,
 * sage, and stone visual language.
 */

export default function MobileChapterCard({ chapterIndex = 0 }) {
  return (
    <div
      style={{
        background: '#FFFEF9',
        border: '1px solid #D4D2CA',
        borderRadius: '10px',
        padding: '20px',
        margin: '20px 0 32px',
        boxShadow: '0 8px 24px -6px rgba(36, 37, 35, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Chapter 0: Scattered Potential */}
      {chapterIndex === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#8E9185', textTransform: 'uppercase' }}>
              SCATTERED SECTIONS
            </span>
            <span style={{ fontSize: '10px', background: '#DDE1D4', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600, color: '#242523' }}>
              Potential
            </span>
          </div>
          <div style={{ height: '8px', width: '120px', background: '#242523', borderRadius: '3px' }} />
          <div style={{ height: '32px', background: '#FFFFFF', border: '1px solid #D4D2CA', borderRadius: '6px', padding: '6px 10px', transform: 'rotate(-1deg)' }}>
            <div style={{ height: '6px', width: '80%', background: '#696A65', borderRadius: '2px' }} />
          </div>
          <div style={{ height: '32px', background: '#FFFFFF', border: '1px solid #D4D2CA', borderRadius: '6px', padding: '6px 10px', transform: 'rotate(1.5deg)' }}>
            <div style={{ height: '6px', width: '65%', background: '#696A65', borderRadius: '2px' }} />
          </div>
        </div>
      )}

      {/* Chapter 1: Unified Document with Scanning Line */}
      {chapterIndex === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#8E9185', textTransform: 'uppercase' }}>
              VERIFIED TEXT EXTRACTION
            </span>
            <span style={{ fontSize: '10px', background: '#DDE1D4', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600, color: '#242523' }}>
              Clarity
            </span>
          </div>
          <div style={{ height: '2px', background: '#8E9185', width: '100%', margin: '4px 0' }} />
          <div style={{ padding: '8px 10px', background: '#F0F3EC', border: '1px solid #D4D2CA', borderRadius: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#242523', display: 'block' }}>
              ✓ Structured Header & Sections Cleaned
            </span>
            <span style={{ fontSize: '10px', color: '#696A65' }}>OCR errors and garbled symbols resolved</span>
          </div>
        </div>
      )}

      {/* Chapter 2: Exploded Evidence Planes */}
      {chapterIndex === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#8E9185', textTransform: 'uppercase' }}>
              EVIDENCE-LINKED EVALUATION
            </span>
            <span style={{ fontSize: '10px', background: '#DDE1D4', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600, color: '#242523' }}>
              Evidence
            </span>
          </div>
          <div style={{ padding: '8px 10px', background: '#FFFFFF', borderLeft: '3px solid #15803D', border: '1px solid #D4D2CA', borderRadius: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D' }}>✓ Supported with metrics</span>
            <div style={{ height: '5px', width: '90%', background: '#696A65', borderRadius: '2px', marginTop: '4px', opacity: 0.6 }} />
          </div>
          <div style={{ padding: '8px 10px', background: '#FFFFFF', borderLeft: '3px solid #B45309', border: '1px solid #D4D2CA', borderRadius: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309' }}>○ Not detected in resume</span>
            <div style={{ height: '5px', width: '70%', background: '#696A65', borderRadius: '2px', marginTop: '4px', opacity: 0.6 }} />
          </div>
        </div>
      )}

      {/* Chapter 3: Rewrite Demo Card */}
      {chapterIndex === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#8E9185', textTransform: 'uppercase' }}>
              METRIC INTEGRITY REWRITE
            </span>
            <span style={{ fontSize: '9px', background: '#FFFBEB', color: '#B45309', border: '1px solid #F59E0B', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              DEMO — NOT A REAL RESULT
            </span>
          </div>
          <div style={{ padding: '8px 10px', background: '#F0F3EC', border: '1px solid #D4D2CA', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px', color: '#696A65', display: 'block' }}>Before: “Worked on database queries.”</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#242523', display: 'block', marginTop: '2px' }}>
              After: “Refactored queries, slashing latency by [X%].”
            </span>
          </div>
        </div>
      )}

      {/* Chapter 4: Composed Final Resume */}
      {chapterIndex === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#8E9185', textTransform: 'uppercase' }}>
              COMPOSED DOCUMENT
            </span>
            <span style={{ fontSize: '10px', background: '#DDE1D4', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600, color: '#242523' }}>
              Ready to Go
            </span>
          </div>
          <div style={{ padding: '10px', background: '#F4F6F1', border: '1px solid #D4D2CA', borderRadius: '6px' }}>
            <div style={{ height: '8px', width: '130px', background: '#242523', borderRadius: '2px', marginBottom: '6px' }} />
            <div style={{ height: '5px', width: '100%', background: '#8E9185', borderRadius: '2px', opacity: 0.6 }} />
          </div>
        </div>
      )}
    </div>
  );
}
