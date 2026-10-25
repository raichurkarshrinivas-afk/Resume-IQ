/**
 * StoryProgress — Fixed, minimalist progress indicator showing the active chapter position.
 * Represents document reading position, not application analysis progress.
 */

const CHAPTER_LABELS = [
  '01 / POTENTIAL',
  '02 / CLARITY',
  '03 / EVIDENCE',
  '04 / REWRITE',
  '05 / YOUR CHAPTER',
];

export default function StoryProgress({ activeChapter = 0 }) {
  return (
    <div
      aria-label="Story reading progress"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '28px',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255, 254, 249, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '6px 14px',
        borderRadius: '9999px',
        border: '1px solid var(--story-border-stone, #D4D2CA)',
        boxShadow: '0 4px 16px -4px rgba(36, 37, 35, 0.08)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Active Chapter Label */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--story-text-primary, #242523)',
        }}
      >
        {CHAPTER_LABELS[activeChapter] || CHAPTER_LABELS[0]}
      </span>

      {/* 5 Indicator Dots / Segments */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[0, 1, 2, 3, 4].map((idx) => {
          const isActive = idx === activeChapter;
          return (
            <div
              key={idx}
              style={{
                width: isActive ? '16px' : '5px',
                height: '4px',
                borderRadius: '2px',
                background: isActive ? 'var(--story-text-primary, #242523)' : 'var(--story-border-stone, #D4D2CA)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
