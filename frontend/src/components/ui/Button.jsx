/**
 * Button component — primary, secondary, danger, ghost variants.
 */

import { motion } from 'framer-motion';

const variants = {
  primary: {
    background: 'var(--color-primary-600)',
    color: '#FFFFFF',
    border: 'none',
    hoverBg: 'var(--color-primary-700)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '0.5px solid var(--border-color)',
    hoverBg: 'var(--bg-tertiary)',
  },
  danger: {
    background: 'var(--color-danger-600)',
    color: '#FFFFFF',
    border: 'none',
    hoverBg: 'var(--color-danger-700)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    hoverBg: 'var(--bg-tertiary)',
  },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) {
  const v = variants[variant] || variants.primary;

  const sizes = {
    sm: { padding: '6px 14px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        borderRadius: 'var(--radius-md)',
        background: v.background,
        color: v.color,
        border: v.border,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: `all var(--transition-fast)`,
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) e.target.style.background = v.hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) e.target.style.background = v.background;
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.button>
  );
}
