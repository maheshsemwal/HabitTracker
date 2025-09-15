import { Route, Routes } from 'react-router-dom'
import Login from './pages/LoginPage'
import Register from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import Feed from './pages/feed'
import Profile from './pages/Profile'

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/profile/:userId" element={<Profile />} />
    </Routes>
  )
}

export default App