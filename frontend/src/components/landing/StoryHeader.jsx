/**
 * StoryHeader — Minimalist, calm navigation header for the storytelling landing page.
 * Features:
 * - ResumeIQ Logo
 * - "The story" anchor link
 * - Accessible [Motion: On/Off] toggle
 * - "Your next chapter" primary CTA
 */

import { Link } from 'react-router-dom';

export default function StoryHeader({ motionEnabled, onToggleMotion, onCtaClick }) {
  const scrollToStory = (e) => {
    e.preventDefault();
    const target = document.getElementById('chapter-1');
    if (target) {
      target.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'auto' });
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(243, 241, 236, 0.85)',
        borderBottom: '1px solid var(--story-border-subtle, rgba(212, 210, 202, 0.6))',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'var(--story-text-primary, #242523)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--story-btn-primary, #292C27)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFEF9',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '-0.02em',
            }}
          >
            IQ
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            ResumeIQ
          </span>
        </Link>

        {/* Center / Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* "The story" Anchor */}
          <a
            href="#chapter-1"
            onClick={scrollToStory}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--story-text-secondary, #696A65)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--story-text-primary, #242523)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--story-text-secondary, #696A65)')}
          >
            The story
          </a>

          {/* Accessible Motion Toggle */}
          <button
            type="button"
            onClick={onToggleMotion}
            aria-pressed={motionEnabled}
            aria-label={`Toggle decorative motion. Currently ${motionEnabled ? 'enabled' : 'disabled'}`}
            style={{
              background: 'transparent',
              border: '1px solid var(--story-border-stone, #D4D2CA)',
              borderRadius: '9999px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--story-text-secondary, #696A65)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--story-text-primary, #242523)';
              e.currentTarget.style.color = 'var(--story-text-primary, #242523)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--story-border-stone, #D4D2CA)';
              e.currentTarget.style.color = 'var(--story-text-secondary, #696A65)';
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: motionEnabled ? '#15803D' : '#8E9185',
              }}
            />
            <span>Motion: {motionEnabled ? 'On' : 'Off'}</span>
          </button>

          {/* CTA Button */}
          <button
            type="button"
            onClick={onCtaClick}
            style={{
              background: 'var(--story-btn-primary, #292C27)',
              color: 'var(--story-btn-text, #FFFEF9)',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Your next chapter →
          </button>
        </div>
      </div>
    </header>
  );
}
