import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BarChart3, Calendar, Settings, TrendingUp, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/auth-context'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Calendar },
    { name: 'Habits', href: '/habits', icon: Settings },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout failed:', error)
      // Still close the menu even if logout fails
      setShowUserMenu(false)
    }
  }

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false)
    }

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowUserMenu(!showUserMenu)
              }}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user?.displayName}</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLogout()
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
        <nav className="flex space-x-1 px-4 pb-3">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0">
          <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Habit Tracker</span>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </NavLink>
                )
              })}
            </nav>
            
            {/* User menu in sidebar */}
            <div className="border-t border-gray-200 p-4">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUserMenu(!showUserMenu)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5 mr-3" />
                  <span className="flex-1 text-left">{user?.displayName}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute bottom-12 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLogout()
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:ml-64 flex-1">
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout