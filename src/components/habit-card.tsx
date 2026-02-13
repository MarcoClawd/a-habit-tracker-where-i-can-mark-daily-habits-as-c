import React from 'react'
import { Check, Flame, TrendingUp } from 'lucide-react'
import { HabitWithEntries } from '../types/habit'
import { useHabits } from '../contexts/habit-context'

interface HabitCardProps {
  habit: HabitWithEntries
}

function HabitCard({ habit }: HabitCardProps) {
  const { toggleHabitToday } = useHabits()

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: habit.color }}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-gray-600">{habit.description}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => toggleHabitToday(habit.id)}
          className={`p-2 rounded-full transition-colors ${
            habit.todayCompleted
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <Check className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <div>
            <p className="text-sm text-gray-600">Streak</p>
            <p className="font-semibold text-gray-900">{habit.streak} days</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="font-semibold text-gray-900">{habit.completionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HabitCard