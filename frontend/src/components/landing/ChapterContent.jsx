/**
 * ChapterContent — Editorial left-column copy for the 5-chapter story.
 * Clean, calm typography with generous whitespace and accessible semantic markup.
 */

export default function ChapterContent({ onCtaClick, onScrollToChapter }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* CHAPTER 1 — POTENTIAL                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section
        id="chapter-1"
        data-chapter-index="0"
        style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBottom: '80px',
        }}
      >
        <span className="story-chapter-label">01 / POTENTIAL</span>
        <h1 className="story-chapter-title">
          Big potential.
          Wrong frame.
        </h1>
        <p className="story-chapter-desc">
          The projects. The late nights. The things you figured out. You have a story worth telling. Let’s give it a clearer shape.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => onScrollToChapter(1)}
            style={{
              background: 'var(--story-btn-primary, #292C27)',
              color: 'var(--story-btn-text, #FFFEF9)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Explore the story ↓
          </button>

          <button
            type="button"
            onClick={onCtaClick}
            style={{
              background: 'transparent',
              color: 'var(--story-text-primary, #242523)',
              border: '1px solid var(--story-border-stone, #D4D2CA)',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--story-text-primary, #242523)';
              e.currentTarget.style.background = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--story-border-stone, #D4D2CA)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Analyze my resume →
          </button>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CHAPTER 2 — CLARITY                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section
        id="chapter-2"
        data-chapter-index="1"
        style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBottom: '80px',
        }}
      >
        <span className="story-chapter-label">02 / CLARITY</span>
        <h2 className="story-chapter-title">
          Less noise.
          More you.
        </h2>
        <p className="story-chapter-desc">
          Start with what your resume actually says. Review the extracted text. Keep the details that matter. Correct what got lost in translation.
        </p>

        {/* Feature Context Box */}
        <div
          style={{
            maxWidth: '460px',
            background: 'rgba(255, 254, 249, 0.7)',
            border: '1px solid var(--story-border-stone, #D4D2CA)',
            borderRadius: '8px',
            padding: '16px 18px',
            fontSize: '13px',
            lineHeight: 1.5,
            color: 'var(--story-text-secondary, #696A65)',
          }}
        >
          <strong style={{ color: 'var(--story-text-primary, #242523)', display: 'block', marginBottom: '4px' }}>
            Two-Step Text Verification
          </strong>
          ResumeIQ lets you inspect, edit, and confirm your document’s extracted text before any analysis runs—eliminating parser errors and misread characters.
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CHAPTER 3 — EVIDENCE                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section
        id="chapter-3"
        data-chapter-index="2"
        style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBottom: '80px',
        }}
      >
        <span className="story-chapter-label">03 / EVIDENCE</span>
        <h2 className="story-chapter-title">
          Don’t guess.
          Show why.
        </h2>
        <p className="story-chapter-desc">
          Unpack the experience, projects, and skills behind the words. Connect recommendations to evidence—not just an unexplained number.
        </p>

        {/* Tri-State Evidence Breakdown Card */}
        <div
          style={{
            maxWidth: '460px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'rgba(255, 254, 249, 0.7)',
            border: '1px solid var(--story-border-stone, #D4D2CA)',
            borderRadius: '8px',
            padding: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#15803D', fontWeight: 700 }}>✓</span>
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--story-text-primary, #242523)' }}>
                Supported by an example
              </strong>
              <p style={{ fontSize: '12px', color: 'var(--story-text-secondary, #696A65)', margin: '2px 0 0' }}>
                Demonstrated in experience bullets with concrete scope or metrics.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#1D4ED8', fontWeight: 700 }}>ℹ</span>
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--story-text-primary, #242523)' }}>
                Mentioned without supporting detail
              </strong>
              <p style={{ fontSize: '12px', color: 'var(--story-text-secondary, #696A65)', margin: '2px 0 0' }}>
                Listed in skills or summary, but lacks supporting depth.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#B45309', fontWeight: 700 }}>○</span>
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--story-text-primary, #242523)' }}>
                Not found in supplied resume
              </strong>
              <p style={{ fontSize: '12px', color: 'var(--story-text-secondary, #696A65)', margin: '2px 0 0' }}>
                Does not imply lack of skill—only that it was not documented in the file.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CHAPTER 4 — REWRITE                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section
        id="chapter-4"
        data-chapter-index="3"
        style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBottom: '80px',
        }}
      >
        <span className="story-chapter-label">04 / REWRITE</span>
        <h2 className="story-chapter-title">
          Sharper words.
          Same truth.
        </h2>
        <p className="story-chapter-desc">
          Make your contribution easier to understand. Review, edit, and tailor each suggestion to your actual experience. Nothing invented. Nothing silently added.
        </p>

        {/* Sample Rewrite Card */}
        <div
          style={{
            maxWidth: '460px',
            background: 'rgba(255, 254, 249, 0.85)',
            border: '1px solid var(--story-border-stone, #D4D2CA)',
            borderRadius: '8px',
            padding: '18px',
            boxShadow: '0 4px 14px -4px rgba(36, 37, 35, 0.06)',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8E9185', fontWeight: 700 }}>
              Original phrasing
            </span>
            <p style={{ fontSize: '13px', color: '#696A65', margin: '3px 0 0', fontStyle: 'italic' }}>
              “Worked on a registration website.”
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--story-border-stone, #D4D2CA)', paddingTop: '10px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#15803D', fontWeight: 700 }}>
              Suggested accomplishment framing
            </span>
            <p style={{ fontSize: '13px', color: '#242523', margin: '3px 0 6px', fontWeight: 500 }}>
              “Built the event-registration interface using React, improving sign-up completion by [X%].”
            </p>
            <span style={{ fontSize: '11px', color: '#8E9185' }}>
              *Use this rewrite only if those details are true.
            </span>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CHAPTER 5 — NEXT CHAPTER                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section
        id="chapter-5"
        data-chapter-index="4"
        style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBottom: '60px',
        }}
      >
        <span className="story-chapter-label">05 / YOUR CHAPTER</span>
        <h2 className="story-chapter-title">
          Your story.
          Ready to go.
        </h2>
        <p className="story-chapter-desc">
          A clearer resume. A version you understand. A starting point for what comes next—not a promise of a hiring decision.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={onCtaClick}
            style={{
              background: 'var(--story-btn-primary, #292C27)',
              color: 'var(--story-btn-text, #FFFEF9)',
              border: 'none',
              borderRadius: '8px',
              padding: '13px 26px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Analyze my resume →
          </button>

          <button
            type="button"
            onClick={() => onScrollToChapter(0)}
            style={{
              background: 'transparent',
              color: 'var(--story-text-secondary, #696A65)',
              border: '1px solid var(--story-border-stone, #D4D2CA)',
              borderRadius: '8px',
              padding: '13px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--story-text-primary, #242523)';
              e.currentTarget.style.borderColor = 'var(--story-text-primary, #242523)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--story-text-secondary, #696A65)';
              e.currentTarget.style.borderColor = 'var(--story-border-stone, #D4D2CA)';
            }}
          >
            ↺ Replay the story
          </button>
        </div>

        {/* Mandatory limitation statement */}
        <p
          style={{
            fontSize: '12px',
            color: 'var(--story-text-accent, #8E9185)',
            margin: 0,
            maxWidth: '460px',
            lineHeight: 1.5,
          }}
        >
          ResumeIQ feedback helps present your documented achievements clearly; it does not predict or guarantee an employer’s hiring decision.
        </p>
      </section>
    </div>
  );
}
