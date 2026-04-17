import React from 'react';
import { motion } from 'framer-motion';

const SKILLS = [
  "Advanced JavaScript", "React Three Fiber", "Plumbing", "Carpentry Level 2", "SEO Optimization", "Graphic Design", "Electrical Wiring", "Data Analysis", "Project Management"
];

const marqueeVariants = {
  animate: {
    x: [0, -1000],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 20,
        ease: "linear",
      },
    },
  },
};

export default function EndlessMarquee() {
  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', padding: '1rem 0', display: 'flex' }}>
      <motion.div 
        className="marquee-track" 
        variants={marqueeVariants} 
        animate="animate" 
        style={{ display: 'flex', gap: '2rem' }}
      >
        {/* Double the array to ensure smooth seamless looping */}
        {[...SKILLS, ...SKILLS, ...SKILLS].map((skill, index) => (
          <span 
            key={index} 
            style={{ 
              padding: '0.5rem 1.5rem', 
              background: 'rgba(63, 81, 181, 0.1)', 
              color: 'var(--primary-dark)', 
              borderRadius: '999px',
              border: '1px solid rgba(63, 81, 181, 0.2)',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {skill}
          </span>
        ))}
      </motion.div>
      
      {/* Edge Gradients for fading effect */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to right, #F8FAFC, transparent)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to left, #F8FAFC, transparent)', zIndex: 1, pointerEvents: 'none' }} />
    </div>
  );
}
