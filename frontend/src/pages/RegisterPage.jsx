/**
 * RegisterPage — Candidate registration page.
 * Minimalist palette: Warm off-white (#F3F1EC), Charcoal (#242523), Sage (#DDE1D4), Stone (#D4D2CA).
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and privacy notice';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await register(email.trim(), password, fullName.trim());
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success('Candidate account created successfully!');
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
          Create Candidate Account
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: '#696A65',
            margin: 0,
          }}
        >
          Individual resume analysis, ATS verification, and tailored applications
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Full Name"
          placeholder="e.g. Jane Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          disabled={loading}
          required
        />

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

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={loading}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          disabled={loading}
          required
        />

        {/* Terms and Privacy Checkbox */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '12px',
              color: '#4B4D47',
              cursor: 'pointer',
              lineHeight: 1.4,
            }}
          >
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={loading}
              style={{
                marginTop: '2px',
                accentColor: '#242523',
                cursor: 'pointer',
              }}
            />
            <span>
              I agree to the terms of service and acknowledge that documents are securely stored in my isolated private workspace.
            </span>
          </label>
          {errors.agreeTerms && (
            <p style={{ fontSize: '12px', color: 'var(--color-danger-500, #EF4444)', margin: '4px 0 0' }}>
              {errors.agreeTerms}
            </p>
          )}
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
          Create Candidate Account
        </Button>
      </div>

      {/* Switch to Teacher Registration */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#F8F7F4',
          border: '1px solid #E5E3DC',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '12px', color: '#696A65', margin: '0 0 6px' }}>
          Are you an educator, professor, or career mentor?
        </p>
        <Link
          to="/register/teacher"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#242523',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Register as Teacher / Educator →
        </Link>
      </div>

      {/* Already have an account link */}
      <p
        style={{
          fontSize: '13px',
          color: '#696A65',
          textAlign: 'center',
          marginTop: '20px',
          marginBottom: 0,
        }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          style={{
            color: '#242523',
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
