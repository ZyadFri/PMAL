import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: null,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { keycloak } = useKeycloak();

  useEffect(() => {
    if (keycloak?.authenticated) {
      // If Keycloak is authenticated, get user info from our backend
      fetchUserProfile();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [keycloak?.authenticated]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.data.user,
          token: keycloak.token
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch user profile'
      });
    }
  };

  const login = async (credentials, isAdmin = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const endpoint = isAdmin ? '/auth/login-admin' : '/auth/login-user';
      const response = await api.post(endpoint, credentials);
      
      const { user, token } = response.data.data;
      
      // Store token in localStorage
      localStorage.setItem('pmal_token', token);
      
      // Set API default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;
      
      // Store token in localStorage
      localStorage.setItem('pmal_token', token);
      
      // Set API default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true, user, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('pmal_token');
    
    // Remove API default auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Logout from Keycloak
    if (keycloak?.authenticated) {
      keycloak.logout();
    }
    
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put(`/users/${state.user.id}`, userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data.user
      });
      return { success: true, user: response.data.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/change-password', passwordData);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed'
      };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;