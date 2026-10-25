/**
 * DashboardLayout — sidebar + top bar + main content area.
 * Protected: redirects to /login if not authenticated.
 */

import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/analyze': 'Analyze Resume',
  '/upload': 'Analyze Resume',
  '/history': 'History',
  '/generate': 'Generate Content',
  '/settings': 'Account Portal',
  '/account': 'Account Portal',
};

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const title =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/analysis') ? 'Analysis' : 'ResumeIQ');

  const sidebarWidth = collapsed ? 68 : 240;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <motion.div
        animate={{ marginLeft: `${sidebarWidth}px` }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ minHeight: '100vh' }}
        className="main-content-area"
      >
        <TopBar
          title={title}
          collapsed={collapsed}
          onMenuClick={() => {
            if (window.innerWidth < 768) {
              setMobileOpen(true);
            } else {
              setCollapsed(!collapsed);
            }
          }}
        />

        <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </motion.div>

      <style>{`
        @media (max-width: 767px) {
          .main-content-area { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
