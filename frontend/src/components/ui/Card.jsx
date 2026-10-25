/**
 * Card component — flat white card with subtle border.
 * Design: 0.5px border, 12px radius, no heavy shadows.
 */

import { motion } from 'framer-motion';

export default function Card({
  children,
  padding = '24px',
  hover = false,
  onClick,
  style = {},
  ...props
}) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? {
        whileHover: { y: -2, boxShadow: 'var(--shadow-md)' },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      style={{
        background: 'var(--card-bg)',
        border: '0.5px solid var(--card-border)',
        borderRadius: 'var(--radius-md)',
        padding,
        boxShadow: 'var(--shadow-xs)',
        transition: 'all var(--transition-base)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}
