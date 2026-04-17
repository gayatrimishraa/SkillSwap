import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Heart, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 60, damping: 20, mass: 1 } }
};

const textVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 25, mass: 1 } }
};

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEnterSpace = () => {
    if (user) {
      // Logged-in users go to their role-based dashboard
      navigate(user.role === 'provider' ? '/dashboard/provider' : '/dashboard/worker');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-page" style={{ position: 'relative' }}>
      
      {/* Massive Typographical Impact Hero */}
      <motion.section 
        className="hero" 
        style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '10rem 0 8rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} 
        variants={containerVariants}
        initial="hidden" 
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
           <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'transparent' }}>
             <span style={{ fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--text-accent)' }}>Global Reach • Local Impact</span>
           </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Radial glow behind hero text for depth */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80vw',
            maxWidth: '600px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(197, 202, 233, 0.12) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: -1
          }} />
          <h2 className="impact-heading-sub" style={{ opacity: 0.9 }}>EMPOWER YOUR LOCAL</h2>
          <h1 className="impact-heading">WORKFORCE</h1>
        </motion.div>
        
        <motion.div variants={itemVariants} style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
          <button onClick={handleEnterSpace} className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 3rem', cursor: 'pointer' }}>
            {user ? 'Go to Dashboard' : 'Enter The Space'} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </button>
        </motion.div>
      </motion.section>

      {/* Typographic Features Section (Uniform aesthetic) */}
      <motion.section 
        style={{ position: 'relative', zIndex: 1, padding: '8rem 1.5rem', maxWidth: '1440px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)' }} 
        variants={containerVariants} 
        initial="hidden" 
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div variants={textVariants} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '6rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px', textAlign: 'center', lineHeight: 1.1 }}>
            ARCHITECTING THE NEW <br/> <span style={{ color: 'var(--text-accent)' }}>JOB ECOSYSTEM</span>
          </h2>
        </motion.div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
          <motion.div style={{ padding: '2rem', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} variants={itemVariants}>
            <Briefcase size={40} color="var(--primary-light)" />
            <h3 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1 }}>Hyper-Local <br/> Opportunities</h3>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-accent)', fontWeight: 500, maxWidth: '300px' }}>
              Discover immediate contracts in your community radius instantly. Avoid the noise of global boards.
            </p>
          </motion.div>
          
          <motion.div style={{ padding: '2rem', borderLeft: '4px solid #E040FB', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} variants={itemVariants}>
            <Heart size={40} color="#E040FB" />
            <h3 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1 }}>Verified <br/> Reputation</h3>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-accent)', fontWeight: 500, maxWidth: '300px' }}>
              Secure your pipeline using our highly-vetted meritocratic dual-rating architecture.
            </p>
          </motion.div>

          <motion.div style={{ padding: '2rem', borderLeft: '4px solid var(--primary-light)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} variants={itemVariants}>
            <LineChart size={40} color="var(--primary-light)" />
            <h3 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1 }}>SDG 8 <br/> Metrics</h3>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-accent)', fontWeight: 500, maxWidth: '300px' }}>
              Quantify your tangible contribution to inclusive, sustainable economic growth.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Analytics Data Section - Pure Typography & Content Focus */}
      <motion.section 
        style={{ position: 'relative', zIndex: 1, padding: '8rem 1.5rem 12rem', margin: '0 auto', maxWidth: '1440px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div variants={itemVariants} style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: '999px', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-accent)' }}>Intelligence Hub</span>
          </motion.div>
          
          <motion.h2 variants={textVariants} style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '-2px', lineHeight: 0.9 }}>
            DEEP MARKET <br/> <span style={{ color: 'var(--primary-light)' }}>ANALYTICS</span>
          </motion.h2>
          
          <motion.p variants={itemVariants} style={{ fontSize: '1.5rem', color: 'var(--text-accent)', marginBottom: '4rem', fontWeight: 500, maxWidth: '800px' }}>
            Identify localized demand trends with our proprietary insight engines. 
            Harness real-time geographical needs to optimize your skillset dynamically.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
             <div style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', minWidth: '280px' }}>
               <h4 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Compensation Flow</h4>
               <p style={{ color: 'var(--text-accent)' }}>Real-time wage tracking arrays.</p>
             </div>
             <div style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', minWidth: '280px' }}>
               <h4 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Demand Horizons</h4>
               <p style={{ color: 'var(--text-accent)' }}>Automated skill-gap projections.</p>
             </div>
             <div style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', minWidth: '280px' }}>
               <h4 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Node Ecosystems</h4>
               <p style={{ color: 'var(--text-accent)' }}>Intelligent pairing correlations.</p>
             </div>
          </motion.div>
        </div>
      </motion.section>
      
    </div>
  );
};

export default LandingPage;
