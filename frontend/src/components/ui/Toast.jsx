/**
 * Toast notification system.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

const TOAST_STYLES = {
  success: {
    bg: 'var(--color-success-50)',
    border: 'var(--color-success-500)',
    color: 'var(--color-success-700)',
    icon: '✓',
  },
  error: {
    bg: 'var(--color-danger-50)',
    border: 'var(--color-danger-500)',
    color: 'var(--color-danger-700)',
    icon: '✕',
  },
  warning: {
    bg: 'var(--color-warning-50)',
    border: 'var(--color-warning-500)',
    color: 'var(--color-warning-700)',
    icon: '⚠',
  },
  info: {
    bg: 'var(--color-primary-50)',
    border: 'var(--color-primary-500)',
    color: 'var(--color-primary-700)',
    icon: 'ℹ',
  },
};

function Toast({ id, type, message, onDismiss }) {
  const s = TOAST_STYLES[type] || TOAST_STYLES.info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: s.bg,
        border: `0.5px solid ${s.border}`,
        borderRadius: 'var(--radius-md)',
        fontSize: '13px',
        fontWeight: 500,
        color: s.color,
        boxShadow: 'var(--shadow-md)',
        cursor: 'pointer',
        maxWidth: '380px',
        minWidth: '280px',
      }}
      onClick={() => onDismiss(id)}
    >
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{s.icon}</span>
      <span style={{ lineHeight: 1.4 }}>{message}</span>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    warning: (msg) => addToast('warning', msg),
    info: (msg) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
