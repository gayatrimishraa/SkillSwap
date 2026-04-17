import React, { useState, useEffect } from 'react';
import { PlusCircle, Target, Users, MapPin, X, Check, Trash2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 60, damping: 20 } }
};

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', budget: '', location: '', skillsRequired: '' });
  const [submitting, setSubmitting] = useState(false);
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null); // { workerId, workerName, jobId, jobTitle }
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsData, appsData] = await Promise.all([
        api.jobs.getMine(),
        api.applications.getAllForProvider()
      ]);
      setJobs(jobsData);
      setApplications(appsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const jobToCreate = {
        ...newJob,
        budget: Number(newJob.budget),
        skillsRequired: newJob.skillsRequired.split(',').map(s => s.trim())
      };
      await api.jobs.create(jobToCreate);
      setShowPostModal(false);
      setNewJob({ title: '', description: '', budget: '', location: '', skillsRequired: '' });
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplicationStatus = async (appId, status) => {
    try {
      await api.applications.updateStatus(appId, status);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const openReviewModal = (workerId, workerName, jobId, jobTitle) => {
    setReviewTarget({ workerId, workerName, jobId, jobTitle });
    setReviewRating(0);
    setReviewComment('');
    setReviewMessage('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      setReviewMessage('Please select a rating.');
      return;
    }
    if (reviewRating < 3 && !reviewComment.trim()) {
      setReviewMessage('Please provide a reason for ratings less than 3 stars.');
      return;
    }
    try {
      setReviewSubmitting(true);
      await api.reviews.submit({
        workerId: reviewTarget.workerId,
        jobId: reviewTarget.jobId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewMessage('Review submitted successfully!');
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewTarget(null);
      }, 1500);
    } catch (err) {
      setReviewMessage(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const pendingApps = applications.filter(a => a.status === 'Pending');
  const activeJobs = jobs.filter(j => j.status === 'Open');

  return (
    <motion.div className="provider-dashboard grid" style={{ gap: '2rem' }} variants={containerVariants} initial="hidden" animate="show">
      <motion.header style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} variants={itemVariants}>
        <div>
          <h1 style={{ color: 'var(--primary-dark)' }}>Employer Dashboard</h1>
          <p>Manage your job postings, moderate applicants, and monitor workflows.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowPostModal(true)}>
          <PlusCircle size={18} style={{ marginRight: '0.5rem' }} /> Post New Job
        </button>
      </motion.header>

      {/* Overview Widgets */}
      <motion.div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }} variants={itemVariants}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '50%' }}>
            <Target size={24} color="#FFF" />
          </div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-accent)', fontWeight: 500 }}>Active Listings</h4>
            <h2 style={{ margin: 0 }}>{activeJobs.length}</h2>
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-dark)', padding: '1rem', borderRadius: '50%' }}>
            <Users size={24} color="#FFF" />
          </div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-accent)', fontWeight: 500 }}>Pending Applicants</h4>
            <h2 style={{ margin: 0 }}>{pendingApps.length}</h2>
          </div>
        </div>
      </motion.div>

      <motion.div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '2rem' }} variants={itemVariants}>
        
        {/* Active Jobs Pipeline */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(63, 81, 181, 0.1)', paddingBottom: '0.5rem' }}>
            Application Pipeline
          </h3>
          
          {loading ? (
            <p>Loading your jobs...</p>
          ) : jobs.length === 0 ? (
            <p>You haven't posted any jobs yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {jobs.map(job => {
                const jobApps = applications.filter(a => a.job._id === job._id);
                return (
                  <div key={job._id} style={{ border: '1px solid rgba(63, 81, 181, 0.1)', borderRadius: 'var(--radius-squircle)', overflow: 'hidden' }}>
                    <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(63, 81, 181, 0.1)' }}>
                      <div style={{ fontWeight: 600 }}>{job.title}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 600 }}>Budget: ₹{job.budget.toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {jobApps.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-accent)', margin: 0 }}>No applicants yet.</p>
                      ) : (
                        jobApps.map(app => (
                          <div key={app._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>{app.applicant?.name}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)', marginLeft: '0.5rem' }}>({app.status})</span>
                            </div>
                            {app.status === 'Pending' && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  className="btn-outline" 
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#2E7D32', borderColor: '#2E7D32' }}
                                  onClick={() => handleApplicationStatus(app._id, 'Accepted')}
                                >
                                  <Check size={14} /> Accept
                                </button>
                                <button 
                                  className="btn-outline" 
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#C62828', borderColor: '#C62828' }}
                                  onClick={() => handleApplicationStatus(app._id, 'Rejected')}
                                >
                                  <Trash2 size={14} /> Decline
                                </button>
                              </div>
                            )}
                            {app.status === 'Accepted' && (
                              <button 
                                className="btn-outline" 
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#FBBF24', borderColor: '#FBBF24' }}
                                onClick={() => openReviewModal(app.applicant?._id, app.applicant?.name, job._id, job.title)}
                              >
                                <Star size={14} /> Rate Worker
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Local Area Insights */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(63, 81, 181, 0.1)', paddingBottom: '0.5rem' }}>
            Job Management
          </h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            Quickly monitor the status of your active contracts and workforce.
          </p>
          <div style={{ padding: '1rem', background: 'rgba(63, 81, 181, 0.05)', borderRadius: '12px' }}>
             <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Total Jobs Posted: {jobs.length}</p>
             <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Successful Hires: {applications.filter(a => a.status === 'Accepted').length}</p>
          </div>
        </div>
      </motion.div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', zIndex: 1000, backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setShowPostModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto',
                background: '#FFFFFF', padding: '2rem', borderRadius: '16px',
                boxShadow: '0 24px 48px rgba(0,0,0,0.25)', color: '#1a202c',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#1A237E', margin: 0, fontSize: '1.35rem' }}>Post New Job</h2>
                <X size={22} style={{ cursor: 'pointer', color: '#718096' }} onClick={() => setShowPostModal(false)} />
              </div>
              <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Title</label>
                  <input
                    type="text" required value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#1a202c', backgroundColor: '#F7FAFC', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    placeholder="e.g. Commercial Wiring Upgrade"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                  <textarea
                    required value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', minHeight: '70px', color: '#1a202c', backgroundColor: '#F7FAFC', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    placeholder="Describe the job requirements, scope, and expectations..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Budget (₹)</label>
                    <input
                      type="number" required value={newJob.budget}
                      onChange={(e) => setNewJob({...newJob, budget: e.target.value})}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#1a202c', backgroundColor: '#F7FAFC', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</label>
                    <input
                      type="text" required value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#1a202c', backgroundColor: '#F7FAFC', fontSize: '0.95rem', boxSizing: 'border-box' }}
                      placeholder="e.g. Delhi / Mumbai / Bangalore"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Required Skills (comma separated)</label>
                  <input
                    type="text" required value={newJob.skillsRequired}
                    onChange={(e) => setNewJob({...newJob, skillsRequired: e.target.value})}
                    style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#1a202c', backgroundColor: '#F7FAFC', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    placeholder="e.g. electrical, wiring, safety protocols"
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '0.75rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                  {submitting ? 'Posting...' : 'Create Listing'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Worker Modal */}
      <AnimatePresence>
        {showReviewModal && reviewTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', zIndex: 1000, backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '420px',
                background: '#FFFFFF', padding: '2rem', borderRadius: '16px',
                boxShadow: '0 24px 48px rgba(0,0,0,0.25)', color: '#1a202c',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ color: '#1A237E', margin: 0, fontSize: '1.25rem' }}>Rate Worker</h2>
                <X size={20} style={{ cursor: 'pointer', color: '#718096' }} onClick={() => setShowReviewModal(false)} />
              </div>

              <p style={{ color: '#4a5568', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>{reviewTarget.workerName}</strong>
              </p>
              <p style={{ color: '#718096', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                Job: {reviewTarget.jobTitle}
              </p>

              {/* Star Rating */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={36}
                    style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                    color={star <= reviewRating ? '#FBBF24' : '#E2E8F0'}
                    fill={star <= reviewRating ? '#FBBF24' : 'none'}
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience working with this person..."
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '8px',
                  border: '1px solid #E2E8F0', minHeight: '80px', color: '#1a202c',
                  backgroundColor: '#F7FAFC', fontSize: '0.9rem', resize: 'vertical',
                  boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '1rem',
                }}
              />

              {reviewMessage && (
                <div style={{
                  padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1rem',
                  background: reviewMessage.includes('success') ? '#E8F5E9' : '#FFEBEE',
                  color: reviewMessage.includes('success') ? '#2E7D32' : '#C62828',
                  fontSize: '0.85rem', fontWeight: 600,
                }}>
                  {reviewMessage}
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProviderDashboard;
