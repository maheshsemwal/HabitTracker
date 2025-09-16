import { authAPI } from '../services/api';

// Simple base64 decoder for JWT payload
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null;

  // Check if token is about to expire (within 2 minutes)
  isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      
      // Return true if token expires within 2 minutes (120 seconds)
      return timeUntilExpiry < 120;
    } catch {
      return true; // If we can't decode, assume it's expired
    }
  }

  // Start automatic token refresh
  startAutoRefresh(): void {
    this.stopAutoRefresh(); // Clear any existing timer
    
    // Check every minute
    this.refreshTimer = setInterval(async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        this.stopAutoRefresh();
        return;
      }

      if (this.isTokenExpiringSoon(token)) {
        try {
          console.log('Token expiring soon, refreshing...');
          const response = await authAPI.refreshToken();
          localStorage.setItem('accessToken', response.accessToken);
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Failed to refresh token:', error);
          this.stopAutoRefresh();
          // Let the main interceptor handle the logout
        }
      }
    }, 60000); // Check every minute
  }

  // Stop automatic token refresh
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

export const tokenManager = new TokenManager();