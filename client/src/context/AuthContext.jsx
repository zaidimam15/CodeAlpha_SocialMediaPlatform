import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('connectify_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('connectify_theme') || 'dark');

  // Apply theme class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('connectify_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Fetch current user if token exists on mount
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.auth.getMe();
        if (data.success && data.user) {
          setUser(data.user);
          if (data.user.themePreference && data.user.themePreference !== 'system') {
            setTheme(data.user.themePreference);
          }
        } else {
          // Token invalid
          localStorage.removeItem('connectify_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('connectify_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (identifier, password) => {
    const data = await api.auth.login({ identifier, password });
    if (data.token) {
      localStorage.setItem('connectify_token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.user.themePreference && data.user.themePreference !== 'system') {
        setTheme(data.user.themePreference);
      }
    }
    return data;
  };

  const register = async (userData) => {
    const data = await api.auth.register(userData);
    if (data.token) {
      localStorage.setItem('connectify_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('connectify_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
    if (updatedFields.themePreference && updatedFields.themePreference !== 'system') {
      setTheme(updatedFields.themePreference);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
