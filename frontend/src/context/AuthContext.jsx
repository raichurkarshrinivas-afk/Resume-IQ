/**
 * Auth context — JWT state, login, individual register, teacher register, profile update, and logout.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('resumeiq_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await client.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem('resumeiq_token', data.access_token);
      localStorage.setItem('resumeiq_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    setLoading(true);
    try {
      const { data } = await client.post('/api/auth/register', {
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
      });
      localStorage.setItem('resumeiq_token', data.access_token);
      localStorage.setItem('resumeiq_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const registerTeacher = useCallback(async ({ email, password, fullName, institutionName, department, designation }) => {
    setLoading(true);
    try {
      const { data } = await client.post('/api/auth/register-teacher', {
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        institution_name: institutionName.trim(),
        department: department.trim(),
        designation: designation ? designation.trim() : null,
      });
      localStorage.setItem('resumeiq_token', data.access_token);
      localStorage.setItem('resumeiq_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.detail || 'Teacher registration failed. Please try again.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (fullName) => {
    setLoading(true);
    try {
      const { data } = await client.patch('/api/auth/profile', {
        full_name: fullName.trim(),
      });
      localStorage.setItem('resumeiq_user', JSON.stringify(data));
      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update profile.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setLoading(true);
    try {
      await client.delete('/api/auth/account');
      localStorage.removeItem('resumeiq_token');
      localStorage.removeItem('resumeiq_user');
      setUser(null);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete account.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('resumeiq_token');
    localStorage.removeItem('resumeiq_user');
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('resumeiq_token');
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { data } = await client.get('/api/auth/me');
      localStorage.setItem('resumeiq_user', JSON.stringify(data));
      setUser(data);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (localStorage.getItem('resumeiq_token')) {
      fetchUser();
    }
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        registerTeacher,
        updateProfile,
        deleteAccount,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
