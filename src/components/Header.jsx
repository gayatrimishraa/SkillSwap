import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogOut, ArrowRightCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const headerStyle = {
    background: scrolled ? 'rgba(13, 15, 37, 0.9)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
    transition: 'all 0.3s ease',
    padding: '1rem 0'
  };

  return (
    <header style={headerStyle} className="site-header">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
          <Briefcase size={28} color="var(--primary-light)" />
          <span>SKILLSWAP</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {(!user || user.role !== 'provider') && (
            <Link to="/jobs" style={{ fontWeight: 600, color: '#fff', opacity: 0.9, transition: 'opacity 0.2s' }}>Find Jobs</Link>
          )}
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1.5rem' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, opacity: 0.9 }}>
                <User size={16} /> Profile
              </Link>
              <Link to={`/dashboard/${user.role}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                <Briefcase size={16} />
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px', color: '#fff', display: 'flex', alignItems: 'center' }}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/login" style={{ fontWeight: 600, color: '#fff' }}>Log In</Link>
              <div style={{ paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.2)', display: 'flex', gap: '1rem' }}>
                <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--primary-light)' }}>
                  Join as Worker <ArrowRightCircle size={18} />
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                  Post a Job
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
