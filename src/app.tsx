import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { HabitProvider } from './contexts/habit-context'
import ProtectedRoute from './components/auth/protected-route'
import Layout from './components/layout'
import Dashboard from './pages/dashboard'
import Habits from './pages/habits'
import Analytics from './pages/analytics'
import AuthPage from './pages/auth'
import { useAuth } from './contexts/auth-context'

function AppRouter() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/" replace /> : <AuthPage />} 
        />
        <Route path="/*" element={
          <ProtectedRoute>
            <HabitProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/habits" element={<Habits />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </HabitProvider>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App