import React from 'react';
import { Star } from 'lucide-react';

const TrustRating = ({ rating, count }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star 
        key={i} 
        size={16} 
        fill={i <= Math.round(rating) ? '#F59E0B' : 'transparent'} 
        color={i <= Math.round(rating) ? '#F59E0B' : 'var(--border)'} 
      />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {stars}
      </div>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-accent)' }}>({count} reviews)</span>
      )}
    </div>
  );
};

export default TrustRating;
