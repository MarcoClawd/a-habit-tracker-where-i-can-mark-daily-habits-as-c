import React from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useHabits } from '../contexts/habit-context'

interface HabitFormData {
  name: string
  description: string
  color: string
}

interface HabitFormProps {
  onClose: () => void
}

const colorOptions = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
]

function HabitForm({ onClose }: HabitFormProps) {
  const { addHabit } = useHabits()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<HabitFormData>({
    defaultValues: {
      color: colorOptions[0]
    }
  })

  const selectedColor = watch('color')

  const onSubmit = (data: HabitFormData) => {
    addHabit({
      name: data.name,
      description: data.description || undefined,
      color: data.color,
      isActive: true
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Habit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Habit Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Habit name is required' })}
              className="input"
              placeholder="e.g., Drink Water"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input
              id="description"
              type="text"
              {...register('description')}
              className="input"
              placeholder="e.g., 8 glasses per day"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HabitForm