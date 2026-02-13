import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { AuthState, AuthContextType, LoginCredentials, RegisterCredentials } from '../types/auth'
import { AuthService } from '../services/auth'

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthState['user'] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  
  // Check for existing session and listen for auth changes
  useEffect(() => {
    let mounted = true
    
    // Get initial session
    AuthService.getCurrentSession().then(user => {
      if (mounted) {
        dispatch({ type: 'SET_USER', payload: user })
      }
    }).catch(() => {
      if (mounted) {
        dispatch({ type: 'SET_USER', payload: null })
      }
    })
    
    // Listen for auth state changes
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      if (mounted) {
        dispatch({ type: 'SET_USER', payload: user })
      }
    })
    
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])
  
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })
      const user = await AuthService.login(credentials)
      dispatch({ type: 'SET_USER', payload: user })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Login failed' })
    }
  }
  
  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })
      const user = await AuthService.register(credentials)
      dispatch({ type: 'SET_USER', payload: user })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Registration failed' })
    }
  }
  
  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })
      await AuthService.logout()
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Logout failed' })
      // Even if logout fails, clear the user state locally
      dispatch({ type: 'LOGOUT' })
    }
  }
  
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }
  
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}