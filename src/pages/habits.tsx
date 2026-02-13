import React from 'react'
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { useHabits } from '../contexts/habit-context'
import HabitForm from '../components/habit-form'

function Habits() {
  const { habits, updateHabit, deleteHabit } = useHabits()
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)

  const toggleHabitStatus = (id: string, isActive: boolean) => {
    updateHabit(id, { isActive: !isActive })
    setActiveDropdown(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      deleteHabit(id)
    }
    setActiveDropdown(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Habits</h1>
          <p className="text-gray-600 mt-1">Create, edit, and organize your habits</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </button>
      </div>

      {/* Habits List */}
      <div className="card">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habits created</h3>
            <p className="text-gray-600 mb-6">Start building better habits by creating your first one.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Habit
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {habits.map((habit, index) => (
              <div key={habit.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: habit.color }}
                  />
                  <div>
                    <h3 className={`font-medium ${
                      habit.isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {habit.name}
                    </h3>
                    {habit.description && (
                      <p className="text-sm text-gray-600">{habit.description}</p>
                    )}
                  </div>
                  {!habit.isActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {habit.streak} day streak
                    </div>
                    <div className="text-sm text-gray-600">
                      {habit.completionRate}% success rate
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === habit.id ? null : habit.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === habit.id && (
                      <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => toggleHabitStatus(habit.id, habit.isActive)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {habit.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(habit.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Habit Form Modal */}
      {showAddForm && (
        <HabitForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  )
}

export default Habits