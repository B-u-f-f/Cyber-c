import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

export const AuthContext = createContext();

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        axios.defaults.headers.common['x-auth-token'] = localStorage.token;
      } else {
        delete axios.defaults.headers.common['x-auth-token'];
        dispatch({ type: 'AUTH_ERROR' });
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/user`);
        dispatch({
          type: 'USER_LOADED',
          payload: res.data
        });
      } catch (err) {
        console.error('Error loading user:', err);
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      return { success: true };
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.msg || 'Login failed'
      });
      return { success: false, message: err.response?.data?.msg || 'Login failed' };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });
      return { success: true };
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.msg || 'Registration failed'
      });
      return { success: false, message: err.response?.data?.msg || 'Registration failed' };
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear errors
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};