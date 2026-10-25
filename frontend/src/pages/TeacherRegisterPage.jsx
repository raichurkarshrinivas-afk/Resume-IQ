/**
 * TeacherRegisterPage — Teacher & Educator registration integrated with
 * the same authentication system and database.
 * Minimalist palette: Warm off-white (#F3F1EC), Charcoal (#242523), Sage (#DDE1D4), Stone (#D4D2CA).
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function TeacherRegisterPage() {
  const navigate = useNavigate();
  const { registerTeacher, loading } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmAffiliation, setConfirmAffiliation] = useState(false);
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

    if (!institutionName.trim()) newErrors.institutionName = 'Institution name is required';
    if (!department.trim()) newErrors.department = 'Department is required';

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!confirmAffiliation) {
      newErrors.confirmAffiliation = 'Please confirm your institutional affiliation';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await registerTeacher({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      institutionName: institutionName.trim(),
      department: department.trim(),
      designation: designation.trim() || null,
    });

    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success('Teacher account registered successfully!');
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#DDE1D4',
            color: '#292C27',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          <span>🎓</span> Academic Registration
        </div>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#242523',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Teacher & Educator Account
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: '#696A65',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Integrated profile for institutional career mentorship, curriculum alignment, and resume review
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input
          label="Full Name"
          placeholder="e.g. Dr. Arthur Vance"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          disabled={loading}
          required
        />

        <Input
          label="Institutional Email"
          type="email"
          placeholder="e.g. a.vance@stanford.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={loading}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            label="Institution"
            placeholder="e.g. Stanford University"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            error={errors.institutionName}
            disabled={loading}
            required
          />

          <Input
            label="Department"
            placeholder="e.g. Computer Science"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            error={errors.department}
            disabled={loading}
            required
          />
        </div>

        <Input
          label="Designation / Title (Optional)"
          placeholder="e.g. Associate Professor / Career Advisor"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          error={errors.designation}
          disabled={loading}
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

        {/* Isolation and Privacy notice */}
        <div
          style={{
            backgroundColor: '#F7F6F1',
            border: '1px solid #D4D2CA',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '12px',
            color: '#4A4D45',
            lineHeight: 1.4,
          }}
        >
          <strong>Data Privacy Note:</strong> Educator accounts maintain private isolated workspaces. Student resumes and personal contact details remain strictly isolated.
        </div>

        {/* Affiliation Checkbox */}
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
              checked={confirmAffiliation}
              onChange={(e) => setConfirmAffiliation(e.target.checked)}
              disabled={loading}
              style={{
                marginTop: '2px',
                accentColor: '#242523',
                cursor: 'pointer',
              }}
            />
            <span>
              I confirm my affiliation with the stated educational institution.
            </span>
          </label>
          {errors.confirmAffiliation && (
            <p style={{ fontSize: '12px', color: 'var(--color-danger-500, #EF4444)', margin: '4px 0 0' }}>
              {errors.confirmAffiliation}
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
          Register as Educator
        </Button>
      </div>

      {/* Switch to Candidate Registration */}
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
          Looking for an individual candidate account?
        </p>
        <Link
          to="/register"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#242523',
            textDecoration: 'none',
          }}
        >
          Register as Candidate →
        </Link>
      </div>

      {/* Already have an account */}
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
