import React from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns'
import { HabitWithEntries } from '../types/habit'
import { useHabits } from '../contexts/habit-context'

interface HabitCalendarProps {
  habit: HabitWithEntries
  month: Date
}

function HabitCalendar({ habit, month }: HabitCalendarProps) {
  const { getHabitEntry, toggleHabitForDate } = useHabits()
  
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const today = new Date()

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: habit.color }}
          />
          <h3 className="font-semibold text-gray-900">{habit.name}</h3>
        </div>
        <span className="text-sm text-gray-600">
          {format(month, 'MMMM yyyy')}
        </span>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const entry = getHabitEntry(habit.id, dateStr)
          const isCompleted = entry?.completed || false
          const isFutureDate = isBefore(today, day) && !isToday(day)
          const canToggle = !isFutureDate
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => canToggle && toggleHabitForDate(habit.id, dateStr)}
              disabled={!canToggle}
              className={`
                p-2 text-sm rounded-lg transition-all relative
                ${isSameMonth(day, month) ? 'text-gray-900' : 'text-gray-400'}
                ${isToday(day) ? 'ring-2 ring-primary-500' : ''}
                ${isCompleted ? 'bg-green-100 hover:bg-green-200' : ''}
                ${canToggle ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                ${!isSameMonth(day, month) ? 'pointer-events-none' : ''}
              `}
            >
              <span className={isCompleted ? 'text-green-700 font-medium' : ''}>
                {format(day, 'd')}
              </span>
              {isCompleted && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default HabitCalendar