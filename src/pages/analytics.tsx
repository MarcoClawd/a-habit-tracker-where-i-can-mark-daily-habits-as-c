import React from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Target, Calendar } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { useHabits } from '../contexts/habit-context'
import HabitCalendar from '../components/habit-calendar'

function Analytics() {
  const { habits } = useHabits()
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const activeHabits = habits.filter(h => h.isActive)
  const totalStreak = activeHabits.reduce((sum, habit) => sum + habit.streak, 0)
  const averageCompletionRate = activeHabits.length > 0 
    ? Math.round(activeHabits.reduce((sum, habit) => sum + habit.completionRate, 0) / activeHabits.length)
    : 0
  const bestStreak = Math.max(...activeHabits.map(h => h.streak), 0)

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your progress and insights</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Active Days</p>
              <p className="text-2xl font-bold text-gray-900">{totalStreak}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{averageCompletionRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Streak</p>
              <p className="text-2xl font-bold text-gray-900">{bestStreak} days</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Monthly View</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium text-gray-900 min-w-[200px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {activeHabits.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active habits</h3>
            <p className="text-gray-600">Create some habits to see your progress analytics.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeHabits.map(habit => (
              <HabitCalendar key={habit.id} habit={habit} month={currentMonth} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics