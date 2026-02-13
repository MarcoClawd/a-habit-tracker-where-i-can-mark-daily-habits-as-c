import React from 'react'
import { Plus, Calendar } from 'lucide-react'
import { useHabits } from '../contexts/habit-context'
import HabitCard from '../components/habit-card'
import HabitForm from '../components/habit-form'
import { format } from 'date-fns'

function Dashboard() {
  const { habits, loading } = useHabits()
  const [showAddForm, setShowAddForm] = React.useState(false)

  const today = new Date()
  const completedToday = habits.filter(h => h.todayCompleted).length
  const totalHabits = habits.filter(h => h.isActive).length
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 flex items-center mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </button>
      </div>

      {/* Today's Progress */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">
            {completedToday} of {totalHabits} habits completed
          </span>
          <span className="text-sm font-medium text-primary-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-primary-600 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-6">Create your first habit to start tracking your progress.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits
            .filter(habit => habit.isActive)
            .map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
        </div>
      )}

      {/* Add Habit Form Modal */}
      {showAddForm && (
        <HabitForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  )
}

export default Dashboard