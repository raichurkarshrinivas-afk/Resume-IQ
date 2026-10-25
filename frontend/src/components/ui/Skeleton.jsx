/**
 * Skeleton loader — pulsing placeholder shapes.
 */

export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  style = {},
}) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '0.5px solid var(--card-border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Skeleton width="40%" height="14px" />
      <Skeleton width="100%" height="12px" />
      <Skeleton width="75%" height="12px" />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <Skeleton width="60px" height="24px" borderRadius="var(--radius-full)" />
        <Skeleton width="80px" height="24px" borderRadius="var(--radius-full)" />
      </div>
    </div>
  );
}

export function SkeletonGauge() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <Skeleton width="140px" height="140px" borderRadius="50%" />
      <Skeleton width="60px" height="14px" />
    </div>
  );
}
