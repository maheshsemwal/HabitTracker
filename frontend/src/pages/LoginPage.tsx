import { Login } from '../components/Login'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (email: string, password: string) => {
    if(email === '' || password === '') {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      // Error handling is done in the useAuth hook
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex justify-center items-center h-screen'>
      <Login 
        email={email} 
        password={password} 
        setEmail={setEmail} 
        setPassword={setPassword} 
        handleLogin={handleLogin} 
        loading={loading}
      />
    </div>
  )
}

export default LoginPage