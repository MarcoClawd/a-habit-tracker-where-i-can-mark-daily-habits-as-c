import React from 'react'
import { BarChart3 } from 'lucide-react'
import LoginForm from '../components/auth/login-form'
import RegisterForm from '../components/auth/register-form'

function AuthPage() {
  const [isLogin, setIsLogin] = React.useState(true)
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12 bg-primary-600">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <BarChart3 className="h-12 w-12 text-white" />
            <span className="ml-3 text-2xl font-bold text-white">Habit Tracker</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Logga in för fan          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Track your daily habits, visualize your progress, and achieve your goals with our intuitive habit tracking platform.
          </p>
          <div className="space-y-4">
            <div className="flex items-center text-primary-100">
              <div className="w-2 h-2 bg-primary-200 rounded-full mr-4" />
              <span>Daily habit tracking and completion</span>
            </div>
            <div className="flex items-center text-primary-100">
              <div className="w-2 h-2 bg-primary-200 rounded-full mr-4" />
              <span>Streak counting and progress analytics</span>
            </div>
            <div className="flex items-center text-primary-100">
              <div className="w-2 h-2 bg-primary-200 rounded-full mr-4" />
              <span>Beautiful calendar views and insights</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage