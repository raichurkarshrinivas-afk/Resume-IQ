/**
 * TopBar — header with hamburger menu, page title, and theme toggle.
 */

import ThemeToggle from './ui/ThemeToggle';

export default function TopBar({ title, onMenuClick, collapsed }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'var(--bg-primary)',
        borderBottom: '0.5px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Hamburger / collapse toggle */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            border: '0.5px solid var(--border-color)',
            background: 'var(--bg-primary)',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'var(--text-secondary)',
            transition: 'all var(--transition-fast)',
          }}
        >
          ☰
        </button>

        <h1
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ThemeToggle />
      </div>
    </header>
  );
}
