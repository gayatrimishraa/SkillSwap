import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, FileText, Star, Briefcase, Save, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    location: '',
    skills: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        skills: (user.skills || []).join(', '),
      });
      // Fetch reviews if worker
      if (user.role === 'worker') {
        api.reviews.getForWorker(user._id).then(setReviews).catch(() => {});
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      await updateProfile({
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        location: form.location,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    navigate(user.role === 'worker' ? '/jobs' : `/dashboard/${user.role}`);
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
    color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none',
    transition: 'border 0.2s',
  };

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem',
    color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < Math.round(rating) ? '#FBBF24' : 'rgba(255,255,255,0.2)'}
        fill={i < Math.round(rating) ? '#FBBF24' : 'none'}
      />
    ));
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', width: '100%', padding: '0 1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 60, damping: 20 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              {user.profileComplete ? 'My Profile' : 'Complete Your Profile'}
            </h1>
            <p style={{ color: 'var(--text-accent)', margin: '0.25rem 0 0' }}>
              {user.role === 'worker' ? 'Set up your skills and details to find matching jobs' : 'Set up your company profile'}
            </p>
          </div>
          {user.role === 'worker' && user.ratingCount > 0 && (
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginBottom: '0.25rem' }}>
                {renderStars(user.rating)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-accent)' }}>
                {user.rating}/5 ({user.ratingCount} review{user.ratingCount !== 1 ? 's' : ''})
              </div>
            </div>
          )}
        </div>

        {/* Avatar & Badge */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary), #7C4DFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, color: '#fff',
          }}>
            {(user.name || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{user.name}</h2>
            <p style={{ margin: '0.15rem 0', fontSize: '0.9rem', color: 'var(--text-accent)' }}>{user.email}</p>
            <span style={{
              display: 'inline-block', marginTop: '0.35rem',
              padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.7rem',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
              background: user.role === 'worker' ? 'rgba(63, 81, 181, 0.2)' : 'rgba(124, 77, 255, 0.2)',
              color: user.role === 'worker' ? '#C5CAE9' : '#B388FF',
            }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Personal Details</h3>

            <div>
              <label style={labelStyle}><User size={14} /> Full Name</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label style={labelStyle}><Phone size={14} /> Phone Number</label>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            <div>
              <label style={labelStyle}><MapPin size={14} /> Location</label>
              <input
                style={inputStyle}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Downtown, Metro Area"
                required
              />
            </div>

            <div>
              <label style={labelStyle}><FileText size={14} /> Bio</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder={user.role === 'worker' ? 'Describe your experience and expertise...' : 'Tell workers about your company...'}
                required
              />
            </div>

            <div>
              <label style={labelStyle}><Briefcase size={14} /> {user.role === 'worker' ? 'Skills (comma separated)' : 'Industry Tags (comma separated)'}</label>
              <input
                style={inputStyle}
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder={user.role === 'worker' ? 'e.g. plumbing, electrical, carpentry' : 'e.g. construction, tech, logistics'}
                required
              />
              {form.skills && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {form.skills.split(',').map((s, i) => s.trim() && (
                    <span key={i} style={{
                      background: 'rgba(63, 81, 181, 0.15)', color: 'var(--primary-light)',
                      padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                    }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
              background: message.includes('success') ? 'rgba(46, 125, 50, 0.15)' : 'rgba(198, 40, 40, 0.15)',
              color: message.includes('success') ? '#66BB6A' : '#EF5350',
              fontSize: '0.875rem', fontWeight: 600,
            }}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ flex: 1, padding: '0.85rem 1.5rem', fontSize: '1rem', minWidth: '160px' }}
            >
              <Save size={16} style={{ marginRight: '0.5rem' }} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={handleContinue}
              disabled={!user.profileComplete}
              title={!user.profileComplete ? "Please save your profile first to continue" : ""}
              style={{ flex: 1, padding: '0.85rem 1.5rem', fontSize: '1rem', minWidth: '160px', opacity: user.profileComplete ? 1 : 0.5, cursor: user.profileComplete ? 'pointer' : 'not-allowed' }}
            >
              {user.role === 'worker' ? 'Find Jobs' : 'Go to Dashboard'} <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>
        </form>

        {/* Reviews Section (Worker Only) */}
        {user.role === 'worker' && (
          <div className="glass-card" style={{ marginTop: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700 }}>
              My Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-accent)', fontSize: '0.9rem' }}>
                No reviews yet. Complete jobs to receive ratings from employers.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map(review => (
                  <div key={review._id} style={{
                    padding: '1rem', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.job?.title || 'Job'}</div>
                      <div style={{ display: 'flex', gap: '2px' }}>{renderStars(review.rating)}</div>
                    </div>
                    {review.comment && (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-accent)' }}>"{review.comment}"</p>
                    )}
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                      — {review.reviewer?.name || 'Employer'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;
