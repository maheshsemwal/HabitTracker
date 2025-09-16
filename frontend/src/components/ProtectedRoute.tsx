import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isAuthenticatedState, currentUserState, authTokenState } from '../store/atoms';
import { authAPI } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useRecoilState(isAuthenticatedState);
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const authToken = useRecoilValue(authTokenState);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && !currentUser) {
        try {
          // Try to refresh token to validate authentication
          const response = await authAPI.refreshToken();
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            setIsAuthenticated(true);
          }
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('accessToken');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else if (!token) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };

    checkAuth();
  }, [currentUser, setIsAuthenticated, setCurrentUser]);

  if (!isAuthenticated || !authToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;