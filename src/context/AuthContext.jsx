import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../api/auth";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("userData");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if token is still valid on app start
  useEffect(() => {
    if (token) {
      checkTokenValidity();
    }
  }, []);

  const checkTokenValidity = async () => {
    try {
      const response = await authAPI.verifyToken(token);
      if (response.valid && response.user) {
        // Update user data if needed
        setUser(response.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      const { token: jwt, user: userData } = response;
      
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("token", jwt);
      setUser(userData);
      setToken(jwt);
      
      return { success: true, user: userData };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      const { token: jwt, user: newUser } = response;
      
      localStorage.setItem("userData", JSON.stringify(newUser));
      localStorage.setItem("token", jwt);
      setUser(newUser);
      setToken(jwt);
      
      return { success: true, user: newUser };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setError(null);
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.resetPassword(resetData);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    if (!token) {
      throw new Error('No authentication token');
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.changePassword(passwordData, token);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.resendOTP(email);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isAdmin = () => {
    return user && (user.type === 'admin' || user.role === 'admin');
  };

  const isSuperAdmin = () => {
    return user && user.role === 'superadmin';
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    resendOTP,
    clearError,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};