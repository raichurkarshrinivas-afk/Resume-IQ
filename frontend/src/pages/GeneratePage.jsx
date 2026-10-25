/**
 * GeneratePage — content generation hub with tabs for each content type.
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const TABS = [
  { key: 'cover_letter', label: 'Cover Letter', icon: '📝', endpoint: '/api/generate/cover-letter' },
  { key: 'interview', label: 'Interview Prep', icon: '🎤', endpoint: '/api/generate/interview-prep' },
  { key: 'roadmap', label: 'Career Roadmap', icon: '🗺️', endpoint: '/api/generate/career-roadmap' },
  { key: 'linkedin', label: 'LinkedIn Summary', icon: '💼', endpoint: '/api/generate/linkedin-summary' },
  { key: 'bullets', label: 'Bullet Points', icon: '🎯', endpoint: '/api/generate/bullet-points' },
];

export default function GeneratePage() {
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const analysisId = searchParams.get('analysis_id');

  const [activeTab, setActiveTab] = useState('cover_letter');
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(analysisId || '');
  const [tone, setTone] = useState('professional');
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/api/analysis/?limit=50')
      .then((res) => {
        setAnalyses(res.data);
        if (!selectedAnalysis && res.data.length > 0) {
          setSelectedAnalysis(String(res.data[0].id));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedAnalysis) {
      toast.warning('Please select an analysis first');
      return;
    }

    const tab = TABS.find((t) => t.key === activeTab);
    setGenerating(true);
    setResult(null);

    try {
      const body = { analysis_id: parseInt(selectedAnalysis) };
      if (activeTab === 'cover_letter') {
        body.tone = tone;
        body.company_name = companyName || undefined;
      }
      if (activeTab === 'roadmap') body.target_role = targetRole || undefined;
      if (activeTab === 'linkedin') body.tone = tone;

      const { data } = await client.post(tab.endpoint, body);
      setResult(data);
      toast.success('Content generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      toast.success('Copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: '16px' }}>
        <Skeleton height="40px" />
        <Skeleton height="200px" />
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="✨"
          title="No analyses available"
          description="Run a resume analysis first to generate tailored content."
          actionLabel="Upload Resume"
          onAction={() => (window.location.href = '/upload')}
        />
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
        Generate Content
      </h2>

      {/* Analysis Selector */}
      <Card padding="16px">
        <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
          Select Analysis
        </label>
        <select
          value={selectedAnalysis}
          onChange={(e) => setSelectedAnalysis(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)',
            background: 'var(--bg-primary)',
            border: '0.5px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
          }}
        >
          {analyses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.job_title || 'General Analysis'} — Score: {a.overall_score} ({new Date(a.created_at).toLocaleDateString()})
            </option>
          ))}
        </select>
      </Card>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          overflow: 'auto',
          padding: '4px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setResult(null); }}
            style={{
              flex: '1 0 auto',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontFamily: 'var(--font-sans)',
              color: activeTab === tab.key ? 'var(--color-primary-700)' : 'var(--text-secondary)',
              background: activeTab === tab.key ? 'var(--card-bg)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.key ? 'var(--shadow-xs)' : 'none',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Options */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(activeTab === 'cover_letter' || activeTab === 'linkedin') && (
            <Input
              label="Tone"
              placeholder="e.g. professional, friendly, enthusiastic"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />
          )}
          {activeTab === 'cover_letter' && (
            <Input
              label="Company Name"
              placeholder="e.g. Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          )}
          {activeTab === 'roadmap' && (
            <Input
              label="Target Role"
              placeholder="e.g. Engineering Manager"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          )}

          <Button onClick={handleGenerate} loading={generating} fullWidth>
            {generating ? 'Generating...' : '✨ Generate'}
          </Button>
        </div>
      </Card>

      {/* Result */}
      <AnimatePresence mode="wait">
        {generating && (
          <Card>
            <div style={{ display: 'grid', gap: '12px' }}>
              <Skeleton height="16px" width="80%" />
              <Skeleton height="16px" width="100%" />
              <Skeleton height="16px" width="90%" />
              <Skeleton height="16px" width="70%" />
              <Skeleton height="16px" width="95%" />
            </div>
          </Card>
        )}

        {result && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                  Generated Content
                </h3>
                <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                  📋 Copy
                </Button>
              </div>
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '0.5px solid var(--border-color)',
                }}
              >
                {result.content}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
