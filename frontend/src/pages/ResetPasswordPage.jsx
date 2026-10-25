/**
 * ResetPasswordPage — Set new password using single-use reset token.
 * Minimalist palette: Warm off-white (#F3F1EC), Charcoal (#242523), Sage (#DDE1D4), Stone (#D4D2CA).
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const urlToken = searchParams.get('token') || '';
  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!token.trim()) newErrors.token = 'Reset token is required';
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await client.post('/api/auth/reset-password', {
        token: token.trim(),
        new_password: newPassword,
      });
      setSuccess(true);
      toast.success(res.data.message || 'Password successfully updated.');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to reset password. The link may have expired.';
      toast.error(msg);
      setErrors({ form: msg });
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
          Choose New Password
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: '#696A65',
            margin: 0,
          }}
        >
          Enter your new password below to secure your account
        </p>
      </div>

      {success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#166534',
              lineHeight: 1.5,
            }}
          >
            <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Password Updated Successfully</p>
            <p style={{ margin: 0 }}>
              Your password has been changed. You can now log in with your new credentials.
            </p>
          </div>

          <Button
            fullWidth
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#242523',
              color: '#FFFEF9',
              padding: '11px',
              fontWeight: 600,
            }}
          >
            Sign In with New Password
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errors.form && (
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#B91C1C',
                }}
              >
                {errors.form}
              </div>
            )}

            {!urlToken && (
              <Input
                label="Reset Token"
                placeholder="Paste the reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                error={errors.token}
                disabled={loading}
                required
              />
            )}

            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              disabled={loading}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
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
              Update Password
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
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
