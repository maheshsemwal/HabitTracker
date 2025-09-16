import axios from 'axios';
import type { User, Habit, FeedItem, FollowRequest } from '../store/atoms';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies for refresh token
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Access token expired, attempting refresh...');
        const refreshResponse = await api.post('/auth/refresh-token');
        const { accessToken } = refreshResponse.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        console.log('Token refreshed successfully');
        return api(originalRequest);
      } catch (refreshError) {
        console.log('Token refresh failed, redirecting to login');
        
        // Import toast dynamically to avoid circular dependencies
        const { toast } = await import('sonner');
        toast.error('Your session has expired. Please log in again.');
        
        // Clear token and redirect to login
        localStorage.removeItem('accessToken');
        
        // Use a timeout to allow the toast to show before redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors with better messages
    if (error.response?.status === 401) {
      const { toast } = await import('sonner');
      toast.error('Authentication failed. Please log in again.');
    } else if (error.response?.status >= 500) {
      const { toast } = await import('sonner');
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      const { toast } = await import('sonner');
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },
};

// Habit API
export const habitAPI = {
  getHabits: async (): Promise<Habit[]> => {
    const response = await api.get('/habits');
    return response.data;
  },
  
  createHabit: async (habitData: {
    name: string;
    description?: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    category?: string;
  }): Promise<Habit> => {
    const response = await api.post('/habits', habitData);
    return response.data;
  },
  
  updateHabit: async (id: string, habitData: {
    name?: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    category?: string;
  }): Promise<Habit> => {
    const response = await api.put(`/habits/${id}`, habitData);
    return response.data;
  },
  
  deleteHabit: async (id: string): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },
  
  getHabitHistory: async (habitId: string) => {
    const response = await api.get(`/complete/${habitId}`);
    return response.data;
  },
};

// Complete Habit API
export const completeHabitAPI = {
  markAsCompleted: async (habitId: string) => {
    const response = await api.post(`/complete/${habitId}`);
    return response.data;
  },
  
  getHistory: async (habitId: string) => {
    const response = await api.get(`/complete/${habitId}`);
    return response.data;
  },
};

// User/Follow API
export const userAPI = {
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/user/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getUserProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/user/profile/${userId}`);
    return response.data;
  },

  sendFollowRequest: async (userId: string) => {
    const response = await api.post(`/user/follow/${userId}`, { userId });
    return response.data;
  },
  
  respondToRequest: async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    const response = await api.put(`/user/request/${requestId}`, { requestId, action });
    return response.data;
  },
  
  getRequests: async (): Promise<FollowRequest[]> => {
    const response = await api.get('/user/requests');
    return response.data;
  },
  
  getFollowers: async (userId: string): Promise<User[]> => {
    const response = await api.get(`/user/followers/${userId}`);
    return response.data;
  },
  
  getFollowing: async (userId: string): Promise<User[]> => {
    const response = await api.get(`/user/following/${userId}`);
    return response.data;
  },
};

// Feed API
export const feedAPI = {
  getMyFeed: async (): Promise<FeedItem[]> => {
    const response = await api.get('/feed');
    return response.data;
  },
  
  getUserFeed: async (userId: string): Promise<FeedItem[]> => {
    const response = await api.get(`/feed/${userId}`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getUserAnalytics: async (userId: string) => {
    const response = await api.get(`/analytics/${userId}`);
    return response.data;
  },
  
  getChartData: async (userId: string) => {
    const response = await api.get(`/analytics/charts/${userId}`);
    return response.data;
  },
};

export default api;