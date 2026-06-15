import React from 'react';

// SkeletonLine — a single shimmer line (configurable width)
export function SkeletonLine({ width = '100%', height = '14px', style }) {
  return (
    <div
      className="skeleton skeleton-line"
      style={{ width, height, ...style }}
    />
  );
}

// SkeletonCard — mimics an announcement card shape
export function SkeletonCard({ height = '220px' }) {
  return (
    <div className="skeleton skeleton-card glass" style={{ height }}>
      <div className="skeleton-card-inner">
        <SkeletonLine width="60px" height="22px" style={{ borderRadius: '30px' }} />
        <SkeletonLine width="80%" height="18px" style={{ marginTop: '16px' }} />
        <SkeletonLine width="60%" height="14px" style={{ marginTop: '10px' }} />
        <SkeletonLine width="100%" height="12px" style={{ marginTop: '16px' }} />
        <SkeletonLine width="90%" height="12px" style={{ marginTop: '8px' }} />
        <SkeletonLine width="70%" height="12px" style={{ marginTop: '8px' }} />
        <SkeletonLine width="40%" height="11px" style={{ marginTop: 'auto' }} />
      </div>
    </div>
  );
}

// SkeletonGrid — a grid of SkeletonCards (configurable count)
export function SkeletonGrid({ count = 3, cardHeight = '220px' }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={cardHeight} />
      ))}
    </div>
  );
}

// SkeletonEventItem — mimics an event list item
export function SkeletonEventItem() {
  return (
    <div className="skeleton skeleton-event-item">
      <div className="skeleton skeleton-line" style={{ width: '70px', height: '70px', borderRadius: '12px', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SkeletonLine width="65%" height="16px" />
        <SkeletonLine width="90%" height="12px" />
        <SkeletonLine width="80px" height="20px" style={{ borderRadius: '30px' }} />
      </div>
    </div>
  );
}
