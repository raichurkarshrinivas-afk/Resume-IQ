/**
 * Badge — priority and category badges:
 * High (red), Medium (amber), Low (gray),
 * Technical (blue), Behavioral (green), Weak spot (amber).
 */

const BADGE_STYLES = {
  high: {
    bg: 'var(--color-danger-50, #FEF2F2)',
    color: 'var(--color-danger-700, #B91C1C)',
    border: 'var(--color-danger-500, #EF4444)',
  },
  medium: {
    bg: 'var(--color-warning-50, #FFFBEB)',
    color: 'var(--color-warning-700, #B45309)',
    border: 'var(--color-warning-500, #F59E0B)',
  },
  low: {
    bg: 'var(--color-gray-100, #F3F4F6)',
    color: 'var(--color-gray-600, #4B5563)',
    border: 'var(--color-gray-300, #D1D5DB)',
  },
  technical: {
    bg: '#EFF6FF',
    color: '#1D4ED8',
    border: '#3B82F6',
  },
  behavioral: {
    bg: '#F0FDF4',
    color: '#15803D',
    border: '#22C55E',
  },
  'weak spot': {
    bg: '#FFFBEB',
    color: '#B45309',
    border: '#F59E0B',
  },
  weak_spot: {
    bg: '#FFFBEB',
    color: '#B45309',
    border: '#F59E0B',
  },
  amber: {
    bg: '#FFFBEB',
    color: '#B45309',
    border: '#F59E0B',
  },
  blue: {
    bg: '#EFF6FF',
    color: '#1D4ED8',
    border: '#3B82F6',
  },
  green: {
    bg: '#F0FDF4',
    color: '#15803D',
    border: '#22C55E',
  },
};

export default function Badge({ priority = 'low', variant, children, style = {} }) {
  const key = (variant || priority || 'low').toLowerCase();
  const s = BADGE_STYLES[key] || BADGE_STYLES.low;
  const label = children || key.charAt(0).toUpperCase() + key.slice(1);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        borderRadius: 'var(--radius-full, 9999px)',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}33`,
        lineHeight: 1.5,
        ...style,
      }}
    >
      {label}
    </span>
  );
}
