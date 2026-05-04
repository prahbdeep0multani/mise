'use client'

import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core'
import { getDayName } from '@/lib/utils/formatting'
import { getWeekDates, getMealsForDay } from '@/lib/utils/calculations'
import MealCard from './MealCard'
import type { MealWithRecipe } from '@/lib/types/models'
import { format, parseISO } from 'date-fns'

interface Props {
  weekStarting: string
  meals: MealWithRecipe[]
  onAddMeal: (dayOfWeek: number) => void
  onRemoveMeal: (mealId: string) => void
  onMoveMeal: (mealId: string, newDay: number) => void
}

function DayColumn({
  dayIndex,
  date,
  meals,
  onAddMeal,
  onRemoveMeal,
}: {
  dayIndex: number
  date: Date
  meals: MealWithRecipe[]
  onAddMeal: (day: number) => void
  onRemoveMeal: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dayIndex}` })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[140px] flex-1 rounded-xl border-2 transition-colors ${
        isOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 bg-white'
      }`}
    >
      {/* Day header */}
      <div className="px-3 py-2 border-b border-gray-100 text-center">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {getDayName(dayIndex).slice(0, 3)}
        </p>
        <p className="text-sm font-bold text-gray-800">
          {format(date, 'd')}
        </p>
      </div>

      {/* Meal slots */}
      <div className="flex-1 p-2 flex flex-col gap-2 min-h-[200px]">
        {meals.map(meal => (
          <MealCard
            key={meal.id}
            meal={meal}
            onRemove={() => onRemoveMeal(meal.id)}
            onRate={() => {}}
          />
        ))}

        <button
          onClick={() => onAddMeal(dayIndex)}
          className="flex items-center justify-center gap-1 w-full py-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>
    </div>
  )
}

export default function WeeklyCalendar({ weekStarting, meals, onAddMeal, onRemoveMeal, onMoveMeal }: Props) {
  const weekDates = getWeekDates(weekStarting)

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const mealId = active.id as string
    const overId = over.id as string

    if (overId.startsWith('day-')) {
      const newDay = parseInt(overId.replace('day-', ''), 10)
      onMoveMeal(mealId, newDay)
    }
  }, [onMoveMeal])

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-[980px]">
          {weekDates.map((date, index) => (
            <DayColumn
              key={index}
              dayIndex={index}
              date={date}
              meals={getMealsForDay(meals, index)}
              onAddMeal={onAddMeal}
              onRemoveMeal={onRemoveMeal}
            />
          ))}
        </div>
      </div>
    </DndContext>
  )
}
