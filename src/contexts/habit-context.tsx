import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { useAuth } from './auth-context'
import { HabitService } from '../services/habits'
import {
  Habit,
  HabitEntry,
  HabitWithEntries,
  CreateHabitInput,
  UpdateHabitInput
} from '../types/habit'

interface HabitState {
  habits: HabitWithEntries[]
  entries: HabitEntry[]
  loading: boolean
  error: string | null
}

type HabitAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'LOAD_DATA'; payload: { habits: Habit[]; entries: HabitEntry[] } }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'UPDATE_ENTRY'; payload: HabitEntry }
  | { type: 'CLEAR_DATA' }

interface HabitContextType extends HabitState {
  addHabit: (input: CreateHabitInput) => Promise<void>
  updateHabit: (id: string, updates: UpdateHabitInput) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleHabitToday: (habitId: string) => Promise<void>
  toggleHabitForDate: (habitId: string, date: string) => Promise<void>
  getHabitEntry: (habitId: string, date: string) => HabitEntry | undefined
  refreshData: () => Promise<void>
}

const HabitContext = createContext<HabitContextType | undefined>(undefined)

function calculateStreak(entries: HabitEntry[]): number {
  if (entries.length === 0) return 0
  
  const sortedEntries = entries
    .filter(e => e.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  if (sortedEntries.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const entry of sortedEntries) {
    const entryDate = parseISO(entry.date)
    const daysDiff = differenceInDays(currentDate, entryDate)
    
    if (daysDiff === streak) {
      streak++
      currentDate = new Date(entryDate)
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

function calculateCompletionRate(entries: HabitEntry[]): number {
  if (entries.length === 0) return 0
  const completedEntries = entries.filter(e => e.completed).length
  return Math.round((completedEntries / entries.length) * 100)
}

function enhanceHabitsWithEntries(habits: Habit[], entries: HabitEntry[]): HabitWithEntries[] {
  const today = format(new Date(), 'yyyy-MM-dd')
  
  return habits.map(habit => {
    const habitEntries = entries.filter(e => e.habitId === habit.id)
    const todayEntry = habitEntries.find(e => e.date === today)
    
    return {
      ...habit,
      entries: habitEntries,
      streak: calculateStreak(habitEntries),
      completionRate: calculateCompletionRate(habitEntries),
      todayCompleted: todayEntry?.completed || false
    }
  })
}

const initialState: HabitState = {
  habits: [],
  entries: [],
  loading: true,
  error: null
}

function habitReducer(state: HabitState, action: HabitAction): HabitState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'LOAD_DATA': {
      const enhancedHabits = enhanceHabitsWithEntries(action.payload.habits, action.payload.entries)
      return {
        ...state,
        habits: enhancedHabits,
        entries: action.payload.entries,
        loading: false,
        error: null
      }
    }
    
    case 'ADD_HABIT': {
      const enhancedHabits = enhanceHabitsWithEntries(
        [...state.habits.map(h => ({ ...h, entries: undefined }) as Habit), action.payload],
        state.entries
      )
      return { ...state, habits: enhancedHabits }
    }
    
    case 'UPDATE_HABIT': {
      const updatedHabits = state.habits.map(h => ({
        ...h,
        entries: undefined
      }) as Habit).map(habit => 
        habit.id === action.payload.id ? action.payload : habit
      )
      const enhancedHabits = enhanceHabitsWithEntries(updatedHabits, state.entries)
      return { ...state, habits: enhancedHabits }
    }
    
    case 'DELETE_HABIT': {
      const filteredHabits = state.habits.filter(h => h.id !== action.payload)
      const filteredEntries = state.entries.filter(e => e.habitId !== action.payload)
      const enhancedHabits = enhanceHabitsWithEntries(
        filteredHabits.map(h => ({ ...h, entries: undefined }) as Habit),
        filteredEntries
      )
      return {
        ...state,
        habits: enhancedHabits,
        entries: filteredEntries
      }
    }
    
    case 'UPDATE_ENTRY': {
      const updatedEntries = state.entries.map(entry =>
        entry.id === action.payload.id ? action.payload : entry
      )
      
      // If entry doesn't exist, add it
      if (!updatedEntries.find(e => e.id === action.payload.id)) {
        updatedEntries.push(action.payload)
      }
      
      const enhancedHabits = enhanceHabitsWithEntries(
        state.habits.map(h => ({ ...h, entries: undefined }) as Habit),
        updatedEntries
      )
      return {
        ...state,
        habits: enhancedHabits,
        entries: updatedEntries
      }
    }
    
    case 'CLEAR_DATA':
      return initialState
    
    default:
      return state
  }
}

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(habitReducer, initialState)
  const { user } = useAuth()
  
  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
      loadData()
    } else {
      dispatch({ type: 'CLEAR_DATA' })
    }
  }, [user])
  
  const loadData = async () => {
    if (!user) return
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const [habits, entries] = await Promise.all([
        HabitService.getHabits(user.id),
        HabitService.getHabitEntries(user.id)
      ])
      dispatch({ type: 'LOAD_DATA', payload: { habits, entries } })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load data' 
      })
    }
  }
  
  const addHabit = async (input: CreateHabitInput) => {
    if (!user) return
    
    try {
      const newHabit = await HabitService.createHabit(user.id, input)
      dispatch({ type: 'ADD_HABIT', payload: newHabit })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to add habit' 
      })
      throw error
    }
  }
  
  const updateHabit = async (id: string, updates: UpdateHabitInput) => {
    if (!user) return
    
    try {
      const updatedHabit = await HabitService.updateHabit(user.id, id, updates)
      dispatch({ type: 'UPDATE_HABIT', payload: updatedHabit })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update habit' 
      })
      throw error
    }
  }
  
  const deleteHabit = async (id: string) => {
    if (!user) return
    
    try {
      await HabitService.deleteHabit(user.id, id)
      dispatch({ type: 'DELETE_HABIT', payload: id })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to delete habit' 
      })
      throw error
    }
  }
  
  const toggleHabitToday = async (habitId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    await toggleHabitForDate(habitId, today)
  }
  
  const toggleHabitForDate = async (habitId: string, date: string) => {
    if (!user) return
    
    try {
      const entry = await HabitService.toggleHabitEntry(user.id, habitId, date)
      dispatch({ type: 'UPDATE_ENTRY', payload: entry })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update habit entry' 
      })
      throw error
    }
  }
  
  const getHabitEntry = (habitId: string, date: string): HabitEntry | undefined => {
    return state.entries.find(e => e.habitId === habitId && e.date === date)
  }
  
  const refreshData = async () => {
    await loadData()
  }
  
  const value: HabitContextType = {
    ...state,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitToday,
    toggleHabitForDate,
    getHabitEntry,
    refreshData
  }
  
  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  )
}

export function useHabits() {
  const context = useContext(HabitContext)
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider')
  }
  return context
}