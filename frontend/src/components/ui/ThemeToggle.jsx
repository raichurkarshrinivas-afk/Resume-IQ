/**
 * ThemeToggle — dark/light mode toggle button.
 */

import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
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
        color: 'var(--text-secondary)',
        fontSize: '18px',
        transition: 'all var(--transition-fast)',
      }}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </motion.span>
    </button>
  );
}
