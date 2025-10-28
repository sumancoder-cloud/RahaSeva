import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { authReducer } from './authReducer';
import { jwtDecode } from 'jwt-decode';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  userRole: null,
  user: null,
};

// Create context
export const AuthContext = createContext(initialState);

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user token and role from localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Basic token format validation
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Invalid token format: missing parts');
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_ERROR' });
          return;
        }

        const decoded = jwtDecode(token);
        // Check for token expiration
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expired, removing from localStorage');
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_ERROR' }); // Token expired
        } else {
          // Token is valid, set user data
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { 
              token, 
              role: decoded.user?.role || 'user',
              user: decoded.user || {}
            } 
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_ERROR' });
      }
    } else {
      dispatch({ type: 'AUTH_ERROR' }); // No token found
    }
  }, []);

  // Login action
  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOADING' });
      
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (res.ok && data.success !== false) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            token: data.token, 
            role: data.role,
            user: data.user
          } 
        });
        return { success: true, role: data.role, user: data.user };
      } else {
        dispatch({ type: 'AUTH_ERROR' });
        return { success: false, msg: data.msg || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      dispatch({ type: 'AUTH_ERROR' });
      return { success: false, msg: 'Network error. Please check your connection.' };
    }
  };

  // Register action
  const register = async (name, email, password, phone, role, service, location, experience, pricePerHour) => {
    try {
      dispatch({ type: 'LOADING' });
      
      const requestBody = {
        name,
        email,
        password,
        phone,
        role,
      };

      // Add helper-specific fields if role is helper
      if (role === 'helper') {
        requestBody.service = service;
        requestBody.location = location;
        requestBody.experience = experience;
        requestBody.pricePerHour = pricePerHour;
      } else {
        // For regular users, still include location if provided
        if (location) {
          requestBody.location = location;
        }
      }

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();

      if (res.ok && data.success !== false) {
        // Don't automatically log in after registration
        // User must login separately for security
        dispatch({ type: 'AUTH_ERROR' }); // Clear any loading state
        return { success: true, role: data.role, user: data.user, msg: 'Registration successful' };
      } else {
        dispatch({ type: 'AUTH_ERROR' });
        return { success: false, msg: data.msg || 'Registration failed' };
      }
    } catch (err) {
      console.error('Registration error:', err);
      dispatch({ type: 'AUTH_ERROR' });
      return { success: false, msg: 'Network error. Please check your connection.' };
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await res.json();

      if (res.ok && data.success !== false) {
        return { success: true, user: data.user };
      } else {
        return { success: false, msg: data.msg || 'Failed to fetch profile' };
      }
    } catch (err) {
      console.error('Get profile error:', err);
      return { success: false, msg: 'Network error' };
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      
      const data = await res.json();

      if (res.ok && data.success !== false) {
        // Update local state with new user data
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { user: data.user } 
        });
        return { success: true, user: data.user };
      } else {
        return { success: false, msg: data.msg || 'Failed to update profile' };
      }
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, msg: 'Network error' };
    }
  };

  // Logout action
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      login, 
      register, 
      logout, 
      getUserProfile, 
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
