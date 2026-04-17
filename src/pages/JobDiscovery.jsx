import React, { useState, useEffect } from 'react';
import { Search, MapPin, IndianRupee, Briefcase, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

const INDIAN_CITIES = [
  'All Locations', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Goa', 'Kashmir'
];

const JobDiscovery = () => {
  const { user } = useAuth();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState(user?.location || 'All Locations');
  const [budgetMin, setBudgetMin] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await api.jobs.getAll();
        setAllJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Filter jobs by selected location
  const jobs = locationFilter === 'All Locations'
    ? allJobs
    : allJobs.filter(job => (job.location || '').toLowerCase() === locationFilter.toLowerCase());

  const handleApply = async (jobId) => {
    if (!user) {
      setMessage('Please log in as a worker to apply.');
      return;
    }
    if (user.role !== 'worker') {
      setMessage('Only workers can apply for jobs.');
      return;
    }

    try {
      setApplying(true);
      await api.applications.apply(jobId);
      setMessage('Applied successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || 'Failed to apply');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setApplying(false);
    }
  };

  // Smart matching: search across title, description, skills, and location.
  // Matched jobs appear first; if no search term, show all; unmatched jobs still shown below.
  const getFilteredAndRankedJobs = () => {
    const term = searchTerm.trim().toLowerCase();
    const budgetFloor = budgetMin === '' ? 0 : Number(budgetMin);
    const budgetFiltered = jobs.filter(job => job.budget >= budgetFloor);

    if (!term) return budgetFiltered;

    const matched = [];
    const unmatched = [];

    budgetFiltered.forEach(job => {
      const titleMatch = job.title.toLowerCase().includes(term);
      const descMatch = (job.description || '').toLowerCase().includes(term);
      const skillMatch = (job.skillsRequired || []).some(skill =>
        skill.toLowerCase().includes(term) || term.includes(skill.toLowerCase())
      );
      const locationMatch = (job.location || '').toLowerCase().includes(term);

      if (titleMatch || descMatch || skillMatch || locationMatch) {
        matched.push(job);
      } else {
        unmatched.push(job);
      }
    });

    // Return matched first, then all remaining jobs so the worker always sees listings
    return [...matched, ...unmatched];
  };

  const filteredJobs = getFilteredAndRankedJobs();
  const matchCount = searchTerm.trim()
    ? filteredJobs.filter(job => {
        const term = searchTerm.trim().toLowerCase();
        return job.title.toLowerCase().includes(term)
          || (job.description || '').toLowerCase().includes(term)
          || (job.skillsRequired || []).some(s => s.toLowerCase().includes(term) || term.includes(s.toLowerCase()))
          || (job.location || '').toLowerCase().includes(term);
      }).length
    : 0;

  return (
    <div className="job-discovery grid" style={{ gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '2rem' }}>
      
      {/* Sidebar Filters */}
      <motion.aside className="glass-card" style={{ height: 'fit-content' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Filters</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            <MapPin size={16} /> Location
          </label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-dark, #1a1a2e)', color: 'var(--text-main)', fontSize: '0.9rem' }}
          >
            {INDIAN_CITIES.map(city => (
              <option key={city} value={city}>{city}{user?.location === city ? ' (Your Area)' : ''}</option>
            ))}
          </select>
          {user?.location && locationFilter !== user.location && (
            <button
              onClick={() => setLocationFilter(user.location)}
              style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary-light)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Reset to my location ({user.location})
            </button>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            <IndianRupee size={16} /> Min Budget (₹)
          </label>
          <input 
            type="number" value={budgetMin} 
            min={0}
            onChange={(e) => setBudgetMin(e.target.value)}
            placeholder="0"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)' }}
          />
        </div>

        {message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            background: message.includes('successfully') ? '#E8F5E9' : '#FFEBEE', 
            color: message.includes('successfully') ? '#2E7D32' : '#C62828',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            fontWeight: 600
          }}>
            {message}
          </div>
        )}
      </motion.aside>

      {/* Main Feed */}
      <main>
        {/* Search Bar */}
        <motion.div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Search size={20} color="var(--text-accent)" />
          <input 
            type="text" 
            placeholder="Search for skills, job titles, or keywords..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: 'var(--text-main)' }}
          />
        </motion.div>

        {/* Match indicator */}
        {searchTerm.trim() && !loading && (
          <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(63, 81, 181, 0.1)', border: '1px solid rgba(63, 81, 181, 0.2)', fontSize: '0.875rem' }}>
            <strong style={{ color: 'var(--primary-light)' }}>{matchCount} job{matchCount !== 1 ? 's' : ''}</strong>
            <span style={{ color: 'var(--text-accent)' }}> matched for "{searchTerm.trim()}"</span>
            {filteredJobs.length > matchCount && (
              <span style={{ color: 'var(--text-accent)', opacity: 0.7 }}> · {filteredJobs.length - matchCount} other listings shown below</span>
            )}
          </div>
        )}

        {/* Job Listings Staggered */}
        <motion.div className="grid" style={{ gridTemplateColumns: '1fr' }} variants={containerVariants} initial="hidden" animate="show">
          {loading ? (
            <div className="glass-card text-center" style={{ padding: '4rem 2rem' }}>
              <p>Loading jobs from database...</p>
            </div>
          ) : filteredJobs.map(job => (
            <motion.div key={job._id} variants={itemVariants} layoutId={`job-card-${job._id}`}>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', position: 'relative' }} onClick={() => setSelectedId(job._id)}>
                {/* Local job badge */}
                {user?.location && (job.location || '').toLowerCase() === user.location.toLowerCase() && (
                  <div style={{
                    position: 'absolute', top: '-8px', right: '12px',
                    background: 'linear-gradient(135deg, #43A047, #66BB6A)', color: '#fff',
                    padding: '2px 12px', borderRadius: '999px', fontSize: '0.7rem',
                    fontWeight: 700, letterSpacing: '0.5px', boxShadow: '0 2px 8px rgba(67,160,71,0.3)'
                  }}>
                    📍 Your Area
                  </div>
                )}
                <div>
                  <motion.h3 layoutId={`job-title-${job._id}`} style={{ marginBottom: '0.25rem', color: 'var(--primary-dark)' }}>{job.title}</motion.h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    <Briefcase size={14} /> {job.providerName || job.provider?.name || 'Unknown Provider'} • <MapPin size={14} /> {job.location}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {job.skillsRequired && job.skillsRequired.map(skill => (
                      <span key={skill} style={{ background: 'rgba(63, 81, 181, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>₹{job.budget.toLocaleString('en-IN')}</div>
                  <button className="btn-outline" style={{ padding: '0.5rem 1rem' }}>View Details</button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {!loading && filteredJobs.length === 0 && (
            <div className="glass-card text-center" style={{ padding: '4rem 2rem' }}>
              <p>No jobs found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Shared Element Layout Morphing Modal */}
      <AnimatePresence>
        {selectedId && (() => {
          const job = jobs.find(j => j._id === selectedId);
          if (!job) return null;
          return (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, backdropFilter: 'blur(8px)' }}
                onClick={() => setSelectedId(null)}
              />
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, pointerEvents: 'none' }}>
                <motion.div 
                  layoutId={`job-card-${job._id}`} 
                  className="glass-card" 
                  style={{ width: '90%', maxWidth: '600px', pointerEvents: 'auto', position: 'relative' }}
                >
                  <button onClick={() => setSelectedId(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent' }}><X size={24} color="var(--text-accent)" /></button>
                  <motion.h2 layoutId={`job-title-${job._id}`} style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>{job.title}</motion.h2>
                  <p><strong>Provider:</strong> {job.providerName || job.provider?.name}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>{job.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{job.budget.toLocaleString('en-IN')}</div>
                    <button 
                      className="btn-primary" 
                      onClick={() => handleApply(job._id)}
                      disabled={applying}
                    >
                      {applying ? 'Applying...' : 'Apply Now'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};

export default JobDiscovery;
