/**
 * SettingsPage — Comprehensive Account Portal for ResumeIQ.
 * Supports:
 * - Profile details (Name, Email, Role badge, Join date)
 * - Academic Teacher Profile details (if role === 'teacher')
 * - Profile editing (Full Name update)
 * - Saved documents & application data metrics
 * - Theme preferences (Light / Dark mode)
 * - Danger Zone: Permanent account deletion with confirmation modal
 * - Sign out
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import client from '../api/client';

export default function SettingsPage() {
  const { user, updateProfile, deleteAccount, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  // Profile Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.full_name || '');
  const [savingName, setSavingName] = useState(false);

  // Account Data Metrics
  const [dataStats, setDataStats] = useState({
    resumesCount: 0,
    analysesCount: 0,
    loading: true,
  });

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Synchronize nameInput when user loads
  useEffect(() => {
    if (user?.full_name) {
      setNameInput(user.full_name);
    }
  }, [user?.full_name]);

  // Load user data counts for the Account Portal summary
  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const [resumesRes, analysesRes] = await Promise.all([
          client.get('/api/resumes/?limit=100'),
          client.get('/api/analysis/?limit=100'),
        ]);
        if (isMounted) {
          setDataStats({
            resumesCount: Array.isArray(resumesRes.data) ? resumesRes.data.length : 0,
            analysesCount: Array.isArray(analysesRes.data) ? analysesRes.data.length : 0,
            loading: false,
          });
        }
      } catch (err) {
        console.error('Failed to load user metrics:', err);
        if (isMounted) {
          setDataStats((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Handle Save Full Name
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }
    setSavingName(true);
    const result = await updateProfile(nameInput.trim());
    setSavingName(false);
    if (result.success) {
      toast.success('Profile name updated successfully');
      setIsEditingName(false);
    } else {
      toast.error(result.error || 'Failed to update name');
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please type DELETE to confirm account removal');
      return;
    }

    setDeletingAccount(true);
    const result = await deleteAccount();
    setDeletingAccount(false);

    if (result.success) {
      toast.success('Your account and all associated documents have been deleted');
      setIsDeleteModalOpen(false);
      navigate('/register');
    } else {
      toast.error(result.error || 'Failed to delete account');
    }
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <div style={{ display: 'grid', gap: '24px', maxWidth: '720px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Account Portal
          </h1>
          <Badge variant={isTeacher ? 'technical' : 'low'}>
            {isTeacher ? 'Educator Account' : 'Candidate Account'}
          </Badge>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Manage your personal profile, credentials, saved workspace data, and account security.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card padding="24px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              Personal Profile
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
              Primary contact information and account identity
            </p>
          </div>
          {!isEditingName && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setNameInput(user?.full_name || '');
                setIsEditingName(true);
              }}
            >
              Edit Name
            </Button>
          )}
        </div>

        {isEditingName ? (
          <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            <Input
              label="Full Name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your full name"
              disabled={savingName}
              required
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="submit" size="sm" loading={savingName}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={savingName}
                onClick={() => {
                  setNameInput(user?.full_name || '');
                  setIsEditingName(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Full Name
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                {user?.full_name || 'N/A'}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Email Address
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                {user?.email || 'N/A'}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Member Since
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Account Type
              </p>
              <div style={{ marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: isTeacher ? '#E8EFE9' : '#EDECE8',
                    color: '#242523',
                  }}
                >
                  {isTeacher ? '🎓 Educator / Faculty' : '👤 Candidate / Job Seeker'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Teacher Profile Card (Conditional for Educators) */}
      {isTeacher && user?.teacher_profile && (
        <Card padding="24px" style={{ borderLeft: '4px solid #8E9185' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                Academic & Institutional Affiliation
              </h2>
              <Badge variant="behavioral">
                {user.teacher_profile.status || 'Active'}
              </Badge>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
              Official educator records linked to your ResumeIQ institutional workspace
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Institution
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                {user.teacher_profile.institution_name}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Department
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                {user.teacher_profile.department}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Designation
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                {user.teacher_profile.designation || 'Faculty Member'}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-tertiary, #F7F6F2)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
            }}
          >
            <strong>Workspace Policy:</strong> Teacher accounts operate in a dedicated workspace for syllabi alignment and resume evaluation. Candidate and student documents remain strictly isolated.
          </div>
        </Card>
      )}

      {/* Workspace & Application Data Card */}
      <Card padding="24px">
        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Workspace Data & Saved Documents
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
          Overview of application materials stored persistently in your private account
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 6px', fontWeight: 500 }}>
              Saved Resumes
            </p>
            <p style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              {dataStats.loading ? '—' : dataStats.resumesCount}
            </p>
            <Link
              to="/upload"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-primary-600, #242523)',
                textDecoration: 'none',
              }}
            >
              Upload or manage resumes →
            </Link>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 6px', fontWeight: 500 }}>
              Completed Analyses
            </p>
            <p style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              {dataStats.loading ? '—' : dataStats.analysesCount}
            </p>
            <Link
              to="/history"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-primary-600, #242523)',
                textDecoration: 'none',
              }}
            >
              Review score history →
            </Link>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 6px', fontWeight: 500 }}>
              Cover Letters & Content
            </p>
            <p style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              AI Studio
            </p>
            <Link
              to="/generate"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-primary-600, #242523)',
                textDecoration: 'none',
              }}
            >
              Generate cover letters →
            </Link>
          </div>
        </div>
      </Card>

      {/* Interface & Preferences */}
      <Card padding="24px">
        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Preferences
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
          Customize your display interface and color appearance
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 2px', color: 'var(--text-primary)' }}>
              Interface Theme
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
              Currently set to <strong>{theme}</strong> mode
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={toggleTheme}>
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </div>
      </Card>

      {/* Session Management */}
      <Card padding="24px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              Session & Logout
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
              End your active session securely. All documents and history are saved to your account.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card padding="24px" style={{ borderColor: 'var(--color-danger-500, #EF4444)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px', color: 'var(--color-danger-600, #DC2626)' }}>
              Danger Zone: Delete Account
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px', maxWidth: '500px' }}>
              Permanently delete your account, credentials, and all uploaded resumes, evaluations, and generated content. This action is irreversible.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setDeleteConfirmationText('');
              setIsDeleteModalOpen(true);
            }}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deletingAccount && setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
            Are you sure you want to permanently delete your account for <strong>{user?.email}</strong>?
          </p>

          <div
            style={{
              padding: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#991B1B',
              lineHeight: 1.4,
            }}
          >
            <strong>Warning:</strong> All stored resumes ({dataStats.resumesCount}), analyses ({dataStats.analysesCount}), generated letters, and profiles will be wiped immediately from the database.
          </div>

          <div>
            <label
              htmlFor="confirm-delete-input"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              To confirm, type <strong>DELETE</strong> in the box below:
            </label>
            <input
              id="confirm-delete-input"
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              disabled={deletingAccount}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={deletingAccount}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deletingAccount}
              disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
