import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Check if token is expired
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Get user data
          fetchUserData(token);
        } else {
          // Token expired
          logout();
        }
      } catch (err) {
        console.error('Token validation error:', err);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('/api/users/me');
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email, password) => {
    try {
      setError('');
      const response = await axios.post('/api/auth/login', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user data
      await fetchUserData(token);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      return false;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    setLoading(false);
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
