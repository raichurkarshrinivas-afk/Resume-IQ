/**
 * ForgotPasswordPage — Request password reset email / instructions.
 * Minimalist palette: Warm off-white (#F3F1EC), Charcoal (#242523), Sage (#DDE1D4), Stone (#D4D2CA).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await client.post('/api/auth/forgot-password', { email: cleanEmail });
      setSubmitted(true);
      toast.success('Password reset instructions generated.');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit password reset request. Please try again.';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#242523',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Reset Password
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: '#696A65',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Enter your registered email address and we&apos;ll send instructions to reset your password.
        </p>
      </div>

      {submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F7F6F1',
              border: '1px solid #D4D2CA',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#343632',
              lineHeight: 1.5,
            }}
          >
            <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Check your inbox</p>
            <p style={{ margin: 0, color: '#696A65' }}>
              If an account with <strong>{email}</strong> exists, password reset instructions have been generated. Tokens expire after 1 hour.
            </p>
          </div>

          <Link
            to="/login"
            style={{
              display: 'inline-block',
              marginTop: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#242523',
              textDecoration: 'underline',
            }}
          >
            ← Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              disabled={loading}
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              style={{
                marginTop: '8px',
                backgroundColor: '#242523',
                color: '#FFFEF9',
                padding: '11px',
                fontWeight: 600,
              }}
            >
              Send Reset Instructions
            </Button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <Link
                to="/login"
                style={{
                  fontSize: '13px',
                  color: '#696A65',
                  textDecoration: 'none',
                }}
              >
                Remember your password?{' '}
                <span style={{ color: '#242523', fontWeight: 600, textDecoration: 'underline' }}>
                  Sign in
                </span>
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
