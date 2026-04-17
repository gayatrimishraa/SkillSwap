import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Auth = ({ type }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [role, setRole] = useState('worker');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password || (type === 'register' && !formData.name)) {
      setError('All fields are required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      if (type === 'register') {
        await register({ ...formData, role });
      } else {
        await login({ email: formData.email, password: formData.password, role });
      }
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', width: '100%', padding: '0 1rem' }}>
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 50, damping: 20 }} style={{ background: '#FFFFFF', padding: '3rem 2.5rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', color: '#000' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1A237E', fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.5px' }}>
          {type === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
        </h2>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {type === 'register' && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.875rem', color: '#333' }}>SELECT PROFILE TYPE</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button"
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: role === 'worker' ? '2px solid #1A237E' : '1px solid #E2E8F0', background: role === 'worker' ? '#E8EAF6' : '#F1F5F9', color: role === 'worker' ? '#1A237E' : '#64748B', fontWeight: 700 }}
                onClick={() => setRole('worker')}
              >
                Worker Space
              </button>
              <button 
                type="button"
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: role === 'provider' ? '2px solid #1A237E' : '1px solid #E2E8F0', background: role === 'provider' ? '#E8EAF6' : '#F1F5F9', color: role === 'provider' ? '#1A237E' : '#64748B', fontWeight: 700 }}
                onClick={() => setRole('provider')}
              >
                Job Provider
              </button>
            </div>
          </div>
        )}

        {type === 'login' && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.875rem', color: '#333' }}>LOGIN DESTINATION</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F1F5F9', color: '#000', fontWeight: 500 }}
            >
              <option value="worker">Worker Dashboard</option>
              <option value="provider">Provider Dashboard</option>
              <option value="admin">System Admin</option>
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {type === 'register' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.875rem', color: '#333' }}>FULL NAME</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F1F5F9', color: '#000' }} 
                placeholder="Jane Doe"
                required
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.875rem', color: '#333' }}>EMAIL ADDRESS</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F1F5F9', color: '#000' }} 
              placeholder="jane@company.com"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.875rem', color: '#333' }}>PASSWORD</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F1F5F9', color: '#000' }} 
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              width: '100%', 
              background: isSubmitting ? '#64748B' : '#1A237E', 
              color: '#fff', 
              padding: '1rem', 
              borderRadius: '8px', 
              fontWeight: 800, 
              fontSize: '1rem', 
              marginTop: '1rem', 
              transition: 'background 0.2s',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'PROCESSING...' : (type === 'login' ? 'SIGN IN SECURELY' : 'CREATE ACCOUNT')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
          {type === 'login' ? (
            <>Don't have an account? <Link to="/register" style={{ color: '#1A237E', fontWeight: 800 }}>Sign up</Link></>
          ) : (
            <>Already have an account? <Link to="/login" style={{ color: '#1A237E', fontWeight: 800 }}>Log in</Link></>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
