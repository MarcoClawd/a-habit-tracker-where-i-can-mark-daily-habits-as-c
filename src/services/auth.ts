import { User, LoginCredentials, RegisterCredentials } from '../types/auth'
import { supabase, isPreviewMode } from '../lib/supabase'

// Fallback to localStorage for preview mode
const USERS_STORAGE_KEY = 'habit_tracker_users'
const CURRENT_USER_KEY = 'habit_tracker_current_user'

interface StoredUser {
  id: string
  email: string
  displayName: string
  password: string
  createdAt: string
  updatedAt: string
}

// Preview mode functions (same as before)
function getStoredUsers(): StoredUser[] {
  if (!isPreviewMode) return []
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveStoredUsers(users: StoredUser[]) {
  if (!isPreviewMode) return
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

function convertStoredUserToUser(stored: StoredUser): User {
  return {
    id: stored.id,
    email: stored.email,
    displayName: stored.displayName,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt)
  }
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<User> {
    if (isPreviewMode) {
      // Preview mode - use localStorage
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const users = getStoredUsers()
      const user = users.find(u => u.email === credentials.email && u.password === credentials.password)
      
      if (!user) {
        throw new Error('Invalid email or password')
      }
      
      const convertedUser = convertStoredUserToUser(user)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(convertedUser))
      
      return convertedUser
    }

    // Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Login failed')
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Failed to load user profile')
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    }
  }
  
  static async register(credentials: RegisterCredentials): Promise<User> {
    if (isPreviewMode) {
      // Preview mode - use localStorage
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const users = getStoredUsers()
      
      if (users.find(u => u.email === credentials.email)) {
        throw new Error('User with this email already exists')
      }
      
      const now = new Date().toISOString()
      const newStoredUser: StoredUser = {
        id: generateId(),
        email: credentials.email,
        displayName: credentials.displayName,
        password: credentials.password,
        createdAt: now,
        updatedAt: now
      }
      
      users.push(newStoredUser)
      saveStoredUsers(users)
      
      const user = convertStoredUserToUser(newStoredUser)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
      
      return user
    }

    // Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          display_name: credentials.displayName
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Registration failed')
    }

    // The profile will be created automatically by the trigger
    // Wait a moment and then fetch the profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Failed to create user profile')
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    }
  }
  
  static async logout(): Promise<void> {
    if (isPreviewMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      localStorage.removeItem(CURRENT_USER_KEY)
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }
  
  static getCurrentUser(): User | null {
    if (isPreviewMode) {
      try {
        const stored = localStorage.getItem(CURRENT_USER_KEY)
        if (!stored) return null
        
        const parsed = JSON.parse(stored)
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt)
        }
      } catch {
        return null
      }
    }

    return null // In production, we'll get user from Supabase session
  }

  static async getCurrentSession(): Promise<User | null> {
    if (isPreviewMode) {
      return this.getCurrentUser()
    }

    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return null
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    if (isPreviewMode) {
      // For preview mode, just call once with current user
      callback(this.getCurrentUser())
      return () => {}
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!error && profile) {
            callback({
              id: profile.id,
              email: profile.email,
              displayName: profile.display_name,
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at)
            })
          } else {
            callback(null)
          }
        } catch {
          callback(null)
        }
      } else {
        callback(null)
      }
    })

    return () => subscription.unsubscribe()
  }
}