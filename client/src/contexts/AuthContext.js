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
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    if (initialized) {
      if (keycloak?.authenticated) {
        // Get user info directly from Keycloak token - no backend call needed
        const userInfo = getKeycloakUserInfo();
        
        if (userInfo) {
          // Set API auth header for future backend calls
          api.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userInfo,
              token: keycloak.token
            }
          });
        } else {
          dispatch({ type: 'LOGIN_ERROR', payload: 'Failed to extract user info from token' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [keycloak?.authenticated, initialized, keycloak?.token]);

  // Get user info from Keycloak token (no backend call needed)
  const getKeycloakUserInfo = () => {
    if (!keycloak?.tokenParsed) return null;
    
    const token = keycloak.tokenParsed;
    
    return {
      id: token.sub,
      username: token.preferred_username || token.email,
      email: token.email,
      firstName: token.given_name || '',
      lastName: token.family_name || '',
      fullName: token.name || `${token.given_name || ''} ${token.family_name || ''}`.trim(),
      roles: [
        ...(token.realm_access?.roles || []),
        ...(token.resource_access?.['PMAL-client']?.roles || [])
      ],
      emailVerified: token.email_verified || false,
      // Add any other fields you need from the token
      company: token.company || '',
      department: token.department || '',
      userRole: token.user_role || 'Employee'
    };
  };

  // Keycloak-specific login function
// Replace the existing keycloakLogin function with this:
const keycloakLogin = async (isAdmin = false) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    if (!keycloak) {
      throw new Error('Keycloak not initialized');
    }

    // Different redirects based on user type
    const redirectUri = isAdmin 
      ? window.location.origin + '/admin'
      : window.location.origin + '/dashboard';

    // Redirect to Keycloak login
    await keycloak.login({
      redirectUri: redirectUri,
      prompt: 'login'
    });
    
  } catch (error) {
    console.error('Keycloak login failed:', error);
    dispatch({
      type: 'LOGIN_ERROR',
      payload: 'Keycloak login failed'
    });
    throw error;
  }
};
  // Keycloak-specific registration function
  const keycloakRegister = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (!keycloak) {
        throw new Error('Keycloak not initialized');
      }

      // Redirect to Keycloak registration
      await keycloak.register({
        redirectUri: window.location.origin + '/dashboard'
      });
      
    } catch (error) {
      console.error('Keycloak registration failed:', error);
      dispatch({
        type: 'LOGIN_ERROR',
        payload: 'Keycloak registration failed'
      });
      throw error;
    }
  };

  const logout = () => {
    // Remove API default auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Logout from Keycloak
    if (keycloak?.authenticated) {
      keycloak.logout({
        redirectUri: window.location.origin
      });
    }
    
    dispatch({ type: 'LOGOUT' });
  };

  // Check if user has specific roles
  const hasRole = (role) => {
    if (!keycloak?.authenticated || !keycloak.tokenParsed) {
      return false;
    }
    
    const realmRoles = keycloak.tokenParsed.realm_access?.roles || [];
    const clientRoles = keycloak.tokenParsed.resource_access?.['PMAL-client']?.roles || [];
    
    return realmRoles.includes(role) || clientRoles.includes(role);
  };

  // Check if user is admin
 // Replace the existing isAdmin function with this:
const isAdmin = () => {
  if (!keycloak?.authenticated || !keycloak.tokenParsed) {
    return false;
  }
  
  const realmRoles = keycloak.tokenParsed.realm_access?.roles || [];
  const clientRoles = keycloak.tokenParsed.resource_access?.['PMAL-client']?.roles || [];
  
  return realmRoles.includes('admin') || 
         realmRoles.includes('pmal-admin') || 
         realmRoles.includes('realm-admin') ||
         clientRoles.includes('admin') || 
         clientRoles.includes('pmal-admin');
};
  // Update user profile (this would need backend integration)
  const updateProfile = async (userData) => {
    try {
      // If you want to store additional profile data in your backend
      const response = await api.put(`/users/${state.user.id}`, userData);
      
      // Update local state
      dispatch({
        type: 'UPDATE_USER',
        payload: userData
      });
      
      return { success: true, user: { ...state.user, ...userData } };
    } catch (error) {
      console.warn('Backend profile update failed, updating locally only:', error);
      
      // Even if backend fails, update local state
      dispatch({
        type: 'UPDATE_USER',
        payload: userData
      });
      
      return { success: true, user: { ...state.user, ...userData } };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh token if needed
  const refreshToken = async () => {
    try {
      if (keycloak?.authenticated) {
        await keycloak.updateToken(30); // Refresh if expires in 30 seconds
        api.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
        return keycloak.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const value = {
    // State
    ...state,
    
    // Keycloak specific
    keycloak,
    initialized,
    keycloakLogin,
    keycloakRegister,
    hasRole,
    isAdmin,
    getKeycloakUserInfo,
    refreshToken,
    
    // General auth functions
    logout,
    updateProfile,
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