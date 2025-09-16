import { Route, Routes } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './pages/LoginPage'
import Register from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from './components/ui/sonner'

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RecoilRoot>
          <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
          <Toaster />
          </div>
        </RecoilRoot>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App