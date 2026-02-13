export interface Habit {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
  createdAt: Date
}

export interface HabitEntry {
  id: string
  habitId: string
  date: string // YYYY-MM-DD format
  completed: boolean
  createdAt: Date
}

export interface HabitWithEntries extends Habit {
  entries: HabitEntry[]
  streak: number
  completionRate: number
  todayCompleted: boolean
}

export interface CreateHabitInput {
  name: string
  description?: string
  color: string
  isActive: boolean
}

export interface UpdateHabitInput {
  name?: string
  description?: string
  color?: string
  isActive?: boolean
}