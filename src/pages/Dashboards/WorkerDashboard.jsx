import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, CheckCircle, Clock, Briefcase, MapPin, Star, User } from 'lucide-react';
import Interactive3DWidget from '../../components/Interactive3DWidget';
import EndlessMarquee from '../../components/EndlessMarquee';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 60, damping: 20 } }
};

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apps = await api.applications.getMine();
        setApplications(apps);
        
        // Mocking chart data based on accepted applications for visual completeness
        const accepted = apps.filter(a => a.status === 'Accepted');
        const mockEarnings = [
            { name: 'Week 1', earnings: 0 },
            { name: 'Week 2', earnings: accepted.length > 0 ? accepted[0].job.budget : 0 },
            { name: 'Week 3', earnings: accepted.length > 1 ? accepted[1].job.budget : 0 },
            { name: 'Week 4', earnings: accepted.length > 2 ? accepted[2].job.budget : 0 },
        ];
        setEarningsData(mockEarnings);
      } catch (err) {
        console.error('Failed to fetch worker data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalEarnings = applications
    .filter(a => a.status === 'Accepted')
    .reduce((sum, a) => sum + (a.job?.budget || 0), 0);

  const activeApps = applications.filter(a => a.status === 'Pending').length;
  const completedContracts = applications.filter(a => a.status === 'Accepted').length;

  return (
    <motion.div className="worker-dashboard grid" style={{ gap: '2rem' }} variants={containerVariants} initial="hidden" animate="show">
      
      <motion.header style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }} variants={itemVariants}>
        <div>
          <h1 style={{ color: 'var(--primary-dark)' }}>Worker Dashboard</h1>
          <p>Welcome back, {user?.name}! Here is your activity and market insights for this month.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user?.ratingCount > 0 && (
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginBottom: '0.15rem' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={14} color={i < Math.round(user.rating) ? '#FBBF24' : 'rgba(255,255,255,0.2)'} fill={i < Math.round(user.rating) ? '#FBBF24' : 'none'} />
                ))}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-accent)' }}>{user.rating}/5 ({user.ratingCount})</div>
            </div>
          )}
          <button className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => window.location.href = '/profile'}>
            <User size={14} style={{ marginRight: '0.35rem' }} /> Profile
          </button>
        </div>
      </motion.header>

      {/* KPI Widgets */}
      <motion.div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }} variants={itemVariants}>
        <div className="glass-card text-center">
          <TrendingUp size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>₹{totalEarnings.toLocaleString('en-IN')}</h3>
          <p>Verified Earnings</p>
        </div>
        <div className="glass-card text-center">
          <CheckCircle size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>{completedContracts}</h3>
          <p>Accepted Contracts</p>
        </div>
        <div className="glass-card text-center">
          <Clock size={32} color="var(--text-accent)" style={{ margin: '0 auto 1rem' }} />
          <h3>{activeApps}</h3>
          <p>Pending Applications</p>
        </div>
        <div className="glass-card text-center">
          <Target size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>{user?.skills?.length || 0}</h3>
          <p>Listed Competencies</p>
        </div>
      </motion.div>

      <motion.div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '2rem' }} variants={itemVariants}>
        {/* Real Applications List */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>My Applications</h3>
          {loading ? (
            <p>Syncing with ledger...</p>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>You haven't applied for any jobs yet.</p>
                <button className="btn-primary" onClick={() => window.location.href = '/jobs'}>Browse Jobs</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map(app => (
                <div key={app._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.3)', borderRadius: '12px', border: '1px solid rgba(63, 81, 181, 0.1)' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--primary-dark)' }}>{app.job.title}</h4>
                    <p style={{ fontSize: '0.875rem', margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Briefcase size={12} /> {app.job.providerName} • <MapPin size={12} /> {app.job.location}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{app.job.budget.toLocaleString('en-IN')}</div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '999px', 
                      fontWeight: 700,
                      background: app.status === 'Accepted' ? '#E8F5E9' : app.status === 'Rejected' ? '#FFEBEE' : '#E3F2FD',
                      color: app.status === 'Accepted' ? '#2E7D32' : app.status === 'Rejected' ? '#C62828' : '#1565C0'
                    }}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3D Widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Matching Engine Core</h3>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', marginBottom: '1rem' }}>Calculating optimal pathways...</p>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <Interactive3DWidget />
          </div>
        </div>
      </motion.div>

      {/* Endless Marquee replacement */}
      <motion.div style={{ position: 'relative', width: '100%', margin: '1rem 0', overflow: 'hidden' }} variants={itemVariants}>
        <h3 style={{ marginBottom: '1rem' }}>High-Demand Competencies</h3>
        <EndlessMarquee />
      </motion.div>

    </motion.div>
  );
};

export default WorkerDashboard;
