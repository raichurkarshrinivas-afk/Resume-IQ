/**
 * HistoryPage — Score-Over-Time Progression & Side-by-Side Version Comparison
 *
 * Requirements (Phase 5):
 * 1. List past analyses (paginated or complete scrollable list).
 * 2. Score-over-time line chart:
 *    - SVG line chart plotting chronological score progression with grid lines,
 *      interactive data dots, trend trajectory, and score tooltips.
 * 3. Side-by-side comparison of two versions:
 *    - Selector for Version A and Version B.
 *    - Score change delta badge (e.g. +14 points improvement).
 *    - Granular sub-scores delta (ATS, Keyword, Impact, Format).
 *    - Keywords gained (green chips: in B, not in A).
 *    - Keywords lost (red chips: in A, not in B).
 *    - Direct navigation to either analysis version.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ScoreGauge from '../components/ui/ScoreGauge';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Version comparison state
  const [versionAId, setVersionAId] = useState(null);
  const [versionBId, setVersionBId] = useState(null);

  // Chart hover dot tooltip
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setAnalyses([]);
    setVersionAId(null);
    setVersionBId(null);

    if (!user?.id) {
      setLoading(false);
      return;
    }

    client
      .get('/api/analysis/?limit=50')
      .then((res) => {
        if (!isMounted) return;
        const list = res.data || [];
        setAnalyses(list);
        if (list.length >= 2) {
          // Default: compare the second newest (A) with the newest (B)
          setVersionAId(list[1].id);
          setVersionBId(list[0].id);
        } else if (list.length === 1) {
          setVersionAId(list[0].id);
          setVersionBId(list[0].id);
        }
      })
      .catch((err) => {
        if (isMounted) console.error('History fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Chronological list for line chart (oldest to newest)
  const chronologicalAnalyses = useMemo(() => {
    return [...analyses].reverse();
  }, [analyses]);

  // Selected comparison objects
  const versionA = useMemo(() => {
    return analyses.find((a) => a.id === Number(versionAId)) || null;
  }, [analyses, versionAId]);

  const versionB = useMemo(() => {
    return analyses.find((a) => a.id === Number(versionBId)) || null;
  }, [analyses, versionBId]);

  // Compute keyword deltas (Gained & Lost)
  const comparisonKeywords = useMemo(() => {
    if (!versionA || !versionB) return { gained: [], lost: [], common: [] };

    const setA = new Set(versionA.matched_keywords || []);
    const setB = new Set(versionB.matched_keywords || []);

    const gained = [...setB].filter((k) => !setA.has(k));
    const lost = [...setA].filter((k) => !setB.has(k));
    const common = [...setB].filter((k) => setA.has(k));

    return { gained, lost, common };
  }, [versionA, versionB]);

  // Overall score improvement
  const scoreDelta = useMemo(() => {
    if (!versionA || !versionB) return 0;
    return Math.round((versionB.overall_score - versionA.overall_score) * 10) / 10;
  }, [versionA, versionB]);

  // Stats summary for chart header
  const stats = useMemo(() => {
    if (analyses.length === 0) return { latest: 0, highest: 0, growth: 0 };
    const latest = Math.round(analyses[0].overall_score);
    const highest = Math.round(Math.max(...analyses.map((a) => a.overall_score)));
    const oldest = Math.round(analyses[analyses.length - 1].overall_score);
    const growth = latest - oldest;
    return { latest, highest, growth };
  }, [analyses]);

  // ── SVG Chart Dimensions & Helpers ──
  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 45;
  const paddingY = 30;

  const points = useMemo(() => {
    if (chronologicalAnalyses.length === 0) return [];
    const count = chronologicalAnalyses.length;

    return chronologicalAnalyses.map((item, idx) => {
      const x = count === 1
        ? chartWidth / 2
        : paddingX + (idx / (count - 1)) * (chartWidth - paddingX * 2);
      const scoreClamped = Math.min(100, Math.max(0, item.overall_score));
      const y = chartHeight - paddingY - (scoreClamped / 100) * (chartHeight - paddingY * 2);
      return { x, y, score: item.overall_score, item, idx };
    });
  }, [chronologicalAnalyses]);

  // SVG Path generator
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    return points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  }, [points]);

  // SVG Area Fill Path
  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const bottom = chartHeight - paddingY;
    return `${pathD} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  }, [points, pathD]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '28px' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            📈 Resume Analysis History & Progression
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
            Track your ATS score evolution across revisions, inspect keyword gains, and compare two versions side by side.
          </p>
        </div>

        <Button onClick={() => navigate('/upload')}>
          📄 Upload & Analyze New Resume
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : analyses.length === 0 ? (
        <Card padding="48px">
          <EmptyState
            icon="📊"
            title="No analyses recorded yet"
            description="Upload your resume and analyze it against target job descriptions to begin tracking score progress."
            actionLabel="Run First Analysis"
            onAction={() => navigate('/upload')}
          />
        </Card>
      ) : (
        <>
          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 1: SCORE-OVER-TIME LINE CHART                         */}
          {/* ───────────────────────────────────────────────────────────── */}
          <Card padding="24px">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Score-Over-Time Trajectory
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Composite score performance across all {analyses.length} saved evaluations.
                </p>
              </div>

              {/* Stats badges */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ padding: '6px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Latest</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.latest}</span>
                </div>
                <div style={{ padding: '6px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Peak Score</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success-600)' }}>{stats.highest}</span>
                </div>
                <div style={{ padding: '6px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Total Delta</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: stats.growth >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)' }}>
                    {stats.growth >= 0 ? `+${stats.growth}` : stats.growth}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart Container */}
            <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                style={{ width: '100%', minWidth: '580px', height: '220px', display: 'block' }}
              >
                <defs>
                  {/* Gradient Area Fill */}
                  <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary-500, #3B82F6)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-primary-500, #3B82F6)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                {[25, 50, 75, 100].map((val) => {
                  const y = chartHeight - paddingY - (val / 100) * (chartHeight - paddingY * 2);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="var(--border-color)"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fontSize="10"
                        fill="var(--text-tertiary)"
                        textAnchor="end"
                        fontWeight="600"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Filled Area Under Line */}
                {areaD && (
                  <path d={areaD} fill="url(#scoreAreaGradient)" />
                )}

                {/* Score Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--color-primary-600, #2563EB)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points (Dots) */}
                {points.map((p) => {
                  const isHovered = hoveredPoint?.idx === p.idx;
                  return (
                    <g
                      key={p.idx}
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => navigate(`/analysis/${p.item.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 7 : 4.5}
                        fill={isHovered ? 'var(--color-primary-600)' : '#ffffff'}
                        stroke="var(--color-primary-600)"
                        strokeWidth="2.5"
                        style={{ transition: 'all 0.15s ease' }}
                      />
                      {/* X-axis date labels */}
                      <text
                        x={p.x}
                        y={chartHeight - 8}
                        fontSize="10"
                        fill="var(--text-tertiary)"
                        textAnchor="middle"
                        fontWeight="500"
                      >
                        {new Date(p.item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  style={{
                    position: 'absolute',
                    top: Math.max(10, hoveredPoint.y - 45),
                    left: Math.min(chartWidth - 140, Math.max(10, hoveredPoint.x - 70)),
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                >
                  <div>{hoveredPoint.item.job_title || 'General Resume'}</div>
                  <div style={{ color: 'var(--color-primary-400)', fontWeight: 800 }}>
                    Score: {Math.round(hoveredPoint.score)} / 100 • Click to view
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 2: SIDE-BY-SIDE VERSION COMPARISON                     */}
          {/* ───────────────────────────────────────────────────────────── */}
          <Card padding="24px" style={{ border: '2px solid var(--border-color)' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  🔄 Side-by-Side Version Comparison
                </h3>
                {versionA && versionB && (
                  <Badge variant={scoreDelta > 0 ? 'behavioral' : scoreDelta < 0 ? 'amber' : 'technical'}>
                    {scoreDelta > 0 ? `+${scoreDelta} Points Improvement` : scoreDelta < 0 ? `${scoreDelta} Points Change` : 'Equal Score'}
                  </Badge>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Select any two evaluations to compare overall score deltas and keywords gained or lost.
              </p>
            </div>

            {/* Version Selectors Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }} className="version-selector-grid">
              {/* Version A Selector */}
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '8px' }}>
                  Version A (Baseline)
                </label>
                <select
                  value={versionAId || ''}
                  onChange={(e) => setVersionAId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.id} — {a.job_title || 'General'} (Score: {Math.round(a.overall_score)}) — {new Date(a.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Version B Selector */}
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '8px' }}>
                  Version B (Comparison)
                </label>
                <select
                  value={versionBId || ''}
                  onChange={(e) => setVersionBId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.id} — {a.job_title || 'General'} (Score: {Math.round(a.overall_score)}) — {new Date(a.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Side-by-Side Detailed Metrics Card */}
            {versionA && versionB ? (
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Score Comparison Matrix */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px',
                    textAlign: 'center',
                  }}
                  className="metrics-matrix"
                >
                  {[
                    { label: 'Overall Score', a: versionA.overall_score, b: versionB.overall_score },
                    { label: 'ATS Score', a: versionA.ats_score, b: versionB.ats_score },
                    { label: 'Keyword Score', a: versionA.keyword_score, b: versionB.keyword_score },
                    { label: 'Impact Score', a: versionA.impact_score, b: versionB.impact_score },
                    { label: 'Format Score', a: versionA.format_score, b: versionB.format_score },
                  ].map((m, i) => {
                    const diff = Math.round((m.b - m.a) * 10) / 10;
                    return (
                      <div
                        key={i}
                        style={{
                          padding: '14px 10px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                          {m.label}
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '6px', margin: '6px 0 2px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {Math.round(m.a)}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>→</span>
                          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {Math.round(m.b)}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: diff > 0 ? 'var(--color-success-600)' : diff < 0 ? 'var(--color-danger-600)' : 'var(--text-tertiary)',
                          }}
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Keywords Gained & Keywords Lost Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="keywords-delta-grid">
                  {/* Keywords Gained (Green) */}
                  <div
                    style={{
                      padding: '18px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-success-500)33',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-success-700)' }}>
                        ✓ Keywords Gained in Version B ({comparisonKeywords.gained.length})
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success-600)', background: 'var(--color-success-50)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        Added Strengths
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {comparisonKeywords.gained.length > 0 ? (
                        comparisonKeywords.gained.map((kw) => (
                          <Chip key={kw} label={kw} variant="matched" />
                        ))
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
                          No new keywords gained compared to Version A.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Keywords Lost (Red) */}
                  <div
                    style={{
                      padding: '18px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-danger-500)33',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-danger-700)' }}>
                        ✕ Keywords Lost in Version B ({comparisonKeywords.lost.length})
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-danger-600)', background: 'var(--color-danger-50)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        Potential Gaps
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {comparisonKeywords.lost.length > 0 ? (
                        comparisonKeywords.lost.map((kw) => (
                          <Chip key={kw} label={kw} variant="missing" />
                        ))
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
                          Zero keywords lost! All competencies from Version A were retained.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/analysis/${versionA.id}`)}>
                    Open Version A (#{versionA.id}) →
                  </Button>
                  <Button size="sm" onClick={() => navigate(`/analysis/${versionB.id}`)}>
                    Open Version B (#{versionB.id}) →
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SECTION 3: ALL RECORDED ANALYSES LIST                         */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 14px', color: 'var(--text-primary)' }}>
              All Saved Evaluations ({analyses.length})
            </h3>

            <div style={{ display: 'grid', gap: '12px' }}>
              {analyses.map((a) => (
                <Card key={a.id} padding="16px" hover onClick={() => navigate(`/analysis/${a.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)' }}>
                          #{a.id}
                        </span>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          {a.job_title || 'General Resume Evaluation'}
                        </h4>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {new Date(a.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })} • {a.matched_keywords?.length || 0} matched keywords
                      </span>
                    </div>

                    {/* Sub-scores */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }} className="subscore-chips">
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>ATS</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>{Math.round(a.ats_score)}</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>Keywords</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>{Math.round(a.keyword_score)}</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>Impact</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>{Math.round(a.impact_score)}</span>
                      </div>
                    </div>

                    {/* Circular Score Gauge */}
                    <ScoreGauge score={a.overall_score} size={54} strokeWidth={5} label="" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 800px) {
          .version-selector-grid { grid-template-columns: 1fr !important; }
          .metrics-matrix { grid-template-columns: repeat(2, 1fr) !important; }
          .keywords-delta-grid { grid-template-columns: 1fr !important; }
          .subscore-chips { display: none !important; }
        }
      `}</style>
    </motion.div>
  );
}
