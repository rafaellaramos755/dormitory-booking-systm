import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost/backend/api';

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/check_session.php`, {
        withCredentials: true
      });
      if (response.data.logged_in) {
        setUser(response.data.user);
        if (response.data.user.user_type === 'tenant') {
          checkDueDates();
        }
      }
    } catch (error) {
      console.error('Session check failed', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDueDates = async () => {
    try {
      await axios.get(`${API_URL}/notifications/check_due_dates.php`, { withCredentials: true });
    } catch (error) {
      console.error('Due date check failed', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login.php`, 
        { email, password },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        setUser(response.data.user);
        if (response.data.user.user_type === 'tenant') checkDueDates();
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register.php`, 
        userData,
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout.php`, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};