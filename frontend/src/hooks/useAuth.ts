import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { authTokenState, currentUserState, isAuthenticatedState } from '../store/atoms';
import { authAPI } from '../services/api';
import { toast } from 'sonner';
import { tokenManager } from '../utils/tokenManager';

export const useAuth = () => {
  const [authToken, setAuthToken] = useRecoilState(authTokenState);
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const [isAuthenticated, setIsAuthenticated] = useRecoilState(isAuthenticatedState);
  const navigate = useNavigate();

  // Initialize auth state from localStorage and fetch current user
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !authToken) {
      setAuthToken(token);
      setIsAuthenticated(true);
      // Start automatic token refresh
      tokenManager.startAutoRefresh();
      // Fetch current user data
      fetchCurrentUser();
    }
  }, [authToken, setAuthToken, setIsAuthenticated]);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setCurrentUser(response.user);
    } catch (error: any) {
      console.error('Failed to fetch current user:', error);
      // Only logout if it's a 401 error (token expired/invalid)
      if (error.response?.status === 401) {
        handleTokenExpiration();
      }
    }
  };

  const handleTokenExpiration = () => {
    console.log('Token expired, logging out user');
    toast.error('Your session has expired. Please log in again.');
    logout();
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { accessToken, user } = response;
      
      localStorage.setItem('accessToken', accessToken);
      setAuthToken(accessToken);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Start automatic token refresh
      tokenManager.startAutoRefresh();
      
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(name, email, password);
      const { accessToken, user } = response;
      
      localStorage.setItem('accessToken', accessToken);
      setAuthToken(accessToken);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setAuthToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // Stop automatic token refresh
      tokenManager.stopAutoRefresh();
      
      toast.success('Logged out successfully!');
      navigate('/login');
    }
  };

  return {
    authToken,
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    handleTokenExpiration,
    fetchCurrentUser,
  };
};