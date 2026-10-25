/**
 * DashboardPage — overview with recent resumes, quick stats, and empty states.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ScoreGauge from '../components/ui/ScoreGauge';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setResumes([]);
    setAnalyses([]);

    const fetchData = async () => {
      try {
        const [resumeRes, analysisRes] = await Promise.all([
          client.get('/api/resumes/?limit=3'),
          client.get('/api/analysis/?limit=5'),
        ]);
        if (isMounted) {
          setResumes(Array.isArray(resumeRes.data) ? resumeRes.data : []);
          setAnalyses(Array.isArray(analysisRes.data) ? analysisRes.data : []);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const avgScore =
    analyses.length > 0
      ? Math.round(analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length)
      : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div variants={itemVariants} style={{ marginBottom: '28px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: '0 0 4px',
            letterSpacing: '-0.02em',
          }}
        >
          Welcome back, {user?.full_name?.split(' ')[0]} 👋
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Here&apos;s an overview of your resume analysis journey.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <Card padding="20px">
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            Total Resumes
          </p>
          <p style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {loading ? '—' : resumes.length}
          </p>
        </Card>
        <Card padding="20px">
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            Analyses Run
          </p>
          <p style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {loading ? '—' : analyses.length}
          </p>
        </Card>
        <Card padding="20px">
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            Average Score
          </p>
          <p style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: avgScore >= 70 ? 'var(--color-success-600)' : avgScore >= 50 ? 'var(--color-warning-600)' : 'var(--color-danger-600)' }}>
            {loading ? '—' : analyses.length > 0 ? `${avgScore}/100` : 'N/A'}
          </p>
        </Card>
      </motion.div>

      {/* Recent Resumes */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Recent Resumes</h3>
          {resumes.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
              View All →
            </Button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : resumes.length === 0 ? (
          <Card>
            <EmptyState
              icon="📤"
              title="No resumes yet"
              description="Upload your first resume to get started with AI-powered analysis."
              actionLabel="Upload Resume"
              onAction={() => navigate('/upload')}
            />
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {resumes.map((resume) => (
              <Card key={resume.id} hover onClick={() => navigate(`/upload`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                      {resume.filename}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
                      {new Date(resume.uploaded_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-primary-50)',
                      color: 'var(--color-primary-600)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {resume.file_type}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Analyses */}
      {analyses.length > 0 && (
        <motion.div variants={itemVariants} style={{ marginTop: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>Recent Analyses</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {analyses.slice(0, 3).map((analysis) => (
              <Card key={analysis.id} hover onClick={() => navigate(`/analysis/${analysis.id}`)} padding="20px" style={{ textAlign: 'center' }}>
                <ScoreGauge score={analysis.overall_score} size={90} strokeWidth={8} label="" />
                <p style={{ fontSize: '13px', fontWeight: 600, margin: '12px 0 2px', color: 'var(--text-primary)' }}>
                  {analysis.job_title || 'General Analysis'}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                  {new Date(analysis.created_at).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
