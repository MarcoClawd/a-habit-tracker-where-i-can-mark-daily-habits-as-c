import { Habit, HabitEntry, CreateHabitInput, UpdateHabitInput } from '../types/habit'
import { supabase, isPreviewMode } from '../lib/supabase'
import { format } from 'date-fns'

// Fallback to localStorage for preview mode
function getUserStorageKey(userId: string, type: 'habits' | 'entries'): string {
  return `habit_tracker_${userId}_${type}`
}

function saveToLocalStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    const parsed = JSON.parse(item)
    if (key.includes('habits')) {
      return parsed.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt)
      }))
    }
    if (key.includes('entries')) {
      return parsed.map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt)
      }))
    }
    return parsed
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return defaultValue
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export class HabitService {
  static async getHabits(userId: string): Promise<Habit[]> {
    if (isPreviewMode) {
      const habitsKey = getUserStorageKey(userId, 'habits')
      return loadFromLocalStorage<Habit[]>(habitsKey, [])
    }

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data.map(habit => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      color: habit.color,
      isActive: habit.is_active,
      createdAt: new Date(habit.created_at)
    }))
  }

  static async getHabitEntries(userId: string): Promise<HabitEntry[]> {
    if (isPreviewMode) {
      const entriesKey = getUserStorageKey(userId, 'entries')
      return loadFromLocalStorage<HabitEntry[]>(entriesKey, [])
    }

    const { data, error } = await supabase
      .from('habit_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data.map(entry => ({
      id: entry.id,
      habitId: entry.habit_id,
      date: entry.date,
      completed: entry.completed,
      createdAt: new Date(entry.created_at)
    }))
  }

  static async createHabit(userId: string, input: CreateHabitInput): Promise<Habit> {
    if (isPreviewMode) {
      const newHabit: Habit = {
        id: generateId(),
        ...input,
        createdAt: new Date()
      }
      
      const habitsKey = getUserStorageKey(userId, 'habits')
      const habits = loadFromLocalStorage<Habit[]>(habitsKey, [])
      habits.push(newHabit)
      saveToLocalStorage(habitsKey, habits)
      
      return newHabit
    }

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        color: input.color,
        is_active: input.isActive
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    }
  }

  static async updateHabit(userId: string, habitId: string, updates: UpdateHabitInput): Promise<Habit> {
    if (isPreviewMode) {
      const habitsKey = getUserStorageKey(userId, 'habits')
      const habits = loadFromLocalStorage<Habit[]>(habitsKey, [])
      const habitIndex = habits.findIndex(h => h.id === habitId)
      
      if (habitIndex === -1) {
        throw new Error('Habit not found')
      }
      
      habits[habitIndex] = { ...habits[habitIndex], ...updates }
      saveToLocalStorage(habitsKey, habits)
      
      return habits[habitIndex]
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('habits')
      .update(updateData)
      .eq('id', habitId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    }
  }

  static async deleteHabit(userId: string, habitId: string): Promise<void> {
    if (isPreviewMode) {
      const habitsKey = getUserStorageKey(userId, 'habits')
      const entriesKey = getUserStorageKey(userId, 'entries')
      
      const habits = loadFromLocalStorage<Habit[]>(habitsKey, [])
      const entries = loadFromLocalStorage<HabitEntry[]>(entriesKey, [])
      
      const filteredHabits = habits.filter(h => h.id !== habitId)
      const filteredEntries = entries.filter(e => e.habitId !== habitId)
      
      saveToLocalStorage(habitsKey, filteredHabits)
      saveToLocalStorage(entriesKey, filteredEntries)
      return
    }

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }
  }

  static async toggleHabitEntry(userId: string, habitId: string, date: string): Promise<HabitEntry> {
    if (isPreviewMode) {
      const entriesKey = getUserStorageKey(userId, 'entries')
      const entries = loadFromLocalStorage<HabitEntry[]>(entriesKey, [])
      
      const existingEntry = entries.find(e => e.habitId === habitId && e.date === date)
      
      if (existingEntry) {
        existingEntry.completed = !existingEntry.completed
        saveToLocalStorage(entriesKey, entries)
        return existingEntry
      } else {
        const newEntry: HabitEntry = {
          id: generateId(),
          habitId,
          date,
          completed: true,
          createdAt: new Date()
        }
        entries.push(newEntry)
        saveToLocalStorage(entriesKey, entries)
        return newEntry
      }
    }

    // Check if entry exists
    const { data: existingEntry } = await supabase
      .from('habit_entries')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (existingEntry) {
      // Update existing entry
      const { data, error } = await supabase
        .from('habit_entries')
        .update({ completed: !existingEntry.completed })
        .eq('id', existingEntry.id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        id: data.id,
        habitId: data.habit_id,
        date: data.date,
        completed: data.completed,
        createdAt: new Date(data.created_at)
      }
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('habit_entries')
        .insert({
          habit_id: habitId,
          user_id: userId,
          date,
          completed: true
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        id: data.id,
        habitId: data.habit_id,
        date: data.date,
        completed: data.completed,
        createdAt: new Date(data.created_at)
      }
    }
  }
}