import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await api.auth.me();
          setUser(data.user);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkUserStatus();
  }, []);

  const login = async (credentials) => {
    const data = await api.auth.login(credentials);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.auth.register(userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (profileData) => {
    const data = await api.auth.updateProfile(profileData);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
