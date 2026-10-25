/**
 * Chip — keyword chips: green = matched, red = missing.
 * Supports importance badge for high-priority missing keywords.
 */

import { motion } from 'framer-motion';

export default function Chip({ label, variant = 'matched', importance, subtitle }) {
  const isMatched = variant === 'matched' || variant === 'supported';
  const isMentioned = variant === 'mentioned';
  const isNotFound = variant === 'not_found';
  const isMissing = variant === 'missing';

  let bg = 'var(--color-success-50)';
  let color = 'var(--color-success-700)';
  let border = 'var(--color-success-500)';
  let icon = '✓';

  if (isMentioned) {
    bg = '#EFF6FF';
    color = '#1D4ED8';
    border = '#60A5FA';
    icon = 'ℹ';
  } else if (isNotFound) {
    bg = '#FFFBEB';
    color = '#B45309';
    border = '#F59E0B';
    icon = '○';
  } else if (isMissing) {
    bg = 'var(--color-danger-50)';
    color = 'var(--color-danger-700)';
    border = 'var(--color-danger-500)';
    icon = '✕';
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        background: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.4,
      }}
    >
      <span style={{ fontSize: '11px', fontWeight: 700 }}>{icon}</span>
      <span>{label}</span>
      {subtitle && (
        <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 400 }}>
          ({subtitle})
        </span>
      )}
      {importance && (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '1px 6px',
            borderRadius: 'var(--radius-full)',
            background: isMatched
              ? 'rgba(34, 197, 94, 0.2)'
              : isMentioned
              ? 'rgba(59, 130, 246, 0.2)'
              : isNotFound
              ? 'rgba(245, 158, 11, 0.2)'
              : 'rgba(239, 68, 68, 0.2)',
            color: color,
            letterSpacing: '0.03em',
          }}
        >
          {importance}
        </span>
      )}
    </motion.span>
  );
}
