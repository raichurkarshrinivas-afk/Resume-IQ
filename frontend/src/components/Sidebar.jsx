/**
 * Sidebar — collapsible navigation for desktop, drawer for mobile.
 */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/analyze', label: 'Analyze Resume', icon: '📤' },
  { path: '/history', label: 'History', icon: '📋' },
  { path: '/generate', label: 'Generate', icon: '✨' },
  { path: '/settings', label: 'Account Portal', icon: '👤' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? '68px' : '240px';

  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: collapsed ? '10px 0' : '10px 16px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--color-primary-600)' : 'var(--text-secondary)',
    background: isActive ? 'var(--color-primary-50)' : 'transparent',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
  });

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px 12px',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 8px 24px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <span style={{ fontSize: '24px' }}>🎯</span>
        {!collapsed && (
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            ResumeIQ
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            style={({ isActive }) => linkStyle(isActive)}
            title={collapsed ? item.label : undefined}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div
        style={{
          borderTop: '0.5px solid var(--border-color)',
          paddingTop: '16px',
          marginTop: '16px',
        }}
      >
        {!collapsed && user && (
          <div style={{ marginBottom: '12px', padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name}
              </p>
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: user.role === 'teacher' ? '#E8EFE9' : '#EDECE8',
                  color: '#242523',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {user.role === 'teacher' ? 'Educator' : 'Candidate'}
              </span>
            </div>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            ...linkStyle(false),
            width: '100%',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-danger-600)',
          }}
          title={collapsed ? 'Logout' : undefined}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          background: 'var(--sidebar-bg)',
          borderRight: '0.5px solid var(--border-color)',
          zIndex: 100,
          overflow: 'hidden',
          display: 'none',
        }}
        className="sidebar-desktop"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--overlay-bg)',
                zIndex: 200,
              }}
              className="sidebar-overlay"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '260px',
                background: 'var(--sidebar-bg)',
                borderRight: '0.5px solid var(--border-color)',
                zIndex: 201,
                overflow: 'hidden',
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) {
          .sidebar-desktop { display: flex !important; }
          .sidebar-overlay { display: none !important; }
        }
      `}</style>
    </>
  );
}
