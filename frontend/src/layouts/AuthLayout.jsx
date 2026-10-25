/**
 * AuthLayout — Centred card layout styled with ResumeIQ's signature minimalist palette:
 * Warm off-white (#F3F1EC), Charcoal (#242523), Sage (#DDE1D4), Stone (#D4D2CA).
 */

import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--story-bg-1, #F3F1EC)',
        color: 'var(--story-text-primary, #242523)',
        fontFamily: "var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif)",
        padding: '32px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#292C27',
                color: '#FFFEF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                boxShadow: '0 2px 8px rgba(36, 37, 35, 0.12)',
              }}
            >
              IQ
            </div>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#242523',
                letterSpacing: '-0.03em',
                marginTop: '4px',
              }}
            >
              ResumeIQ
            </span>
          </Link>
          <p
            style={{
              fontSize: '13px',
              color: '#696A65',
              margin: '4px 0 0',
              fontWeight: 400,
            }}
          >
            Minimalist, evidence-backed career intelligence
          </p>
        </div>

        {/* Auth card */}
        <div
          style={{
            backgroundColor: '#FFFEF9',
            border: '1px solid #D4D2CA',
            borderRadius: '12px',
            padding: '32px 28px',
            boxShadow: '0 4px 20px rgba(36, 37, 35, 0.04)',
          }}
        >
          <Outlet />
        </div>

        {/* Minimal Footer */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#8E9185',
          }}
        >
          <span>© 2026 ResumeIQ. Documents processed securely.</span>
        </div>
      </div>
    </div>
  );
}
