/**
 * SkillLearningResources component
 * Displays learning recommendations and verified external resources for a missing skill.
 */

import { motion } from 'framer-motion';
import { getSkillLearningResource } from '../data/learningResources';

/**
 * Single skill recommendation card component.
 * Usage: <SkillLearningResources skill="JavaScript" />
 */
export default function SkillLearningResources({ skill, style = {} }) {
  const data = getSkillLearningResource(skill);
  const { found, recommendation, resources } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderLeft: found ? '4px solid var(--color-primary-500, #3b82f6)' : '4px solid var(--text-tertiary, #94a3b8)',
        borderRadius: 'var(--radius-md, 8px)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.05))',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {/* Header: Skill Name & Verification Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>{found ? '💡' : '🔍'}</span>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            Missing Skill: <span style={{ color: found ? 'var(--color-primary-600, #2563eb)' : 'inherit' }}>{skill}</span>
          </h4>
        </div>
        {found ? (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'var(--color-primary-50, #eff6ff)',
              color: 'var(--color-primary-700, #1d4ed8)',
              border: '1px solid var(--color-primary-200, #bfdbfe)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ✓ Verified Guides
          </span>
        ) : (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'var(--bg-secondary, #f8fafc)',
              color: 'var(--text-tertiary, #64748b)',
              border: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            Resource Pending
          </span>
        )}
      </div>

      {/* Recommendation */}
      <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary, #475569)' }}>
        <strong style={{ color: 'var(--text-primary, #1e293b)' }}>Recommendation: </strong>
        <span style={{ fontStyle: found ? 'normal' : 'italic' }}>{recommendation}</span>
      </div>

      {/* Verified Resource Links */}
      {found && resources && resources.length > 0 && (
        <div style={{ marginTop: '2px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary, #64748b)', marginBottom: '6px' }}>
            Trusted Learning Resources:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--color-primary-700, #1d4ed8)',
                  background: 'var(--color-primary-50, #eff6ff)',
                  border: '1px solid var(--color-primary-200, #bfdbfe)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-primary-100, #dbeafe)';
                  e.currentTarget.style.borderColor = 'var(--color-primary-300, #93c5fd)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-primary-50, #eff6ff)';
                  e.currentTarget.style.borderColor = 'var(--color-primary-200, #bfdbfe)';
                  e.currentTarget.style.transform = 'none';
                }}
                title={`Open ${res.title} in new tab`}
              >
                <span>{res.title}</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Container list for multiple missing skills with search & filter.
 * Usage: <SkillRecommendations missingSkills={sortedMissingKeywords} />
 */
export function SkillRecommendations({ missingSkills = [] }) {
  if (!missingSkills || missingSkills.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          borderRadius: 'var(--radius-md, 8px)',
          background: 'var(--bg-secondary, #f8fafc)',
          border: '1px dashed var(--border-color, #cbd5e1)',
          color: 'var(--text-tertiary, #64748b)',
          fontSize: '13px',
        }}
      >
        🎉 Great job! No missing skills were detected in this analysis.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {missingSkills.map((skill) => (
        <SkillLearningResources key={skill} skill={skill} />
      ))}
    </div>
  );
}
