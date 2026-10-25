/**
 * EmptyState — friendly empty state with icon, title, description, and optional action.
 */

import Button from './Button';

export default function EmptyState({ icon = '📄', title, description, actionLabel, onAction }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        gap: '16px',
      }}
    >
      <span style={{ fontSize: '48px', lineHeight: 1 }}>{icon}</span>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            maxWidth: '360px',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} style={{ marginTop: '8px' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
