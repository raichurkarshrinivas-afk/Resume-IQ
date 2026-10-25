/**
 * LoginPage — Sign in to individual or teacher account.
 * Minimalist palette: Warm off-white (#F3F1EC), Charcoal (#242523), Sage (#DDE1D4), Stone (#D4D2CA).
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrors({});

    const cleanEmail = email.trim().toLowerCase();
    const newErrors = {};
    if (!cleanEmail) newErrors.email = 'Email address is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(cleanEmail, password);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    }
  };

  const handleFillDemo = async () => {
    setEmail('demo@resumeiq.com');
    setPassword('Password123!');
    setErrors({});
    const result = await login('demo@resumeiq.com', 'Password123!');
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success('Signed in with Demo account!');
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
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
          Welcome Back
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: '#696A65',
            margin: 0,
          }}
        >
          Sign in to your private workspace and career reports
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Email Address"
          type="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={loading}
          required
        />

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '6px',
            }}
          >
            <label
              htmlFor="login-password"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary, #696A65)',
                letterSpacing: '-0.01em',
              }}
            >
              Password <span style={{ color: 'var(--color-danger-500, #EF4444)' }}>*</span>
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: '12px',
                color: '#4B4D47',
                textDecoration: 'underline',
              }}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
            required
          />
        </div>

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
          Sign In
        </Button>

        {/* Quick Demo Sign-in */}
        <div
          style={{
            margin: '12px 0 4px',
            padding: '12px',
            backgroundColor: '#F7F6F2',
            border: '1px dashed #D4D2CA',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: '#696A65', marginBottom: '8px' }}>
            Testing or reviewing the application?
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#242523',
              backgroundColor: '#FFFEF9',
              border: '1px solid #D4D2CA',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>⚡</span> One-Click Demo Sign In (demo@resumeiq.com)
          </button>
        </div>
      </div>

      {/* Account Creation Links */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #EAE8E1',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '13px',
          color: '#696A65',
        }}
      >
        <div>
          New here?{' '}
          <Link
            to="/register"
            style={{
              color: '#242523',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Create individual account
          </Link>
        </div>
        <div>
          Are you an educator?{' '}
          <Link
            to="/register/teacher"
            style={{
              color: '#242523',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Register as a teacher
          </Link>
        </div>
      </div>
    </form>
  );
}
