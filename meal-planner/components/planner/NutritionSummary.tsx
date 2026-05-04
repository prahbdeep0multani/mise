'use client'

import { calculateWeeklyNutrition } from '@/lib/utils/calculations'
import type { MealWithRecipe } from '@/lib/types/models'

interface Props {
  meals: MealWithRecipe[]
}

export default function NutritionSummary({ meals }: Props) {
  if (meals.length === 0) return null

  const nutrition = calculateWeeklyNutrition(meals)
  const days = Math.max(meals.length, 1)

  const items = [
    { label: 'Avg Calories', value: Math.round((nutrition.calories ?? 0) / days), unit: 'kcal', color: 'bg-orange-100 text-orange-700' },
    { label: 'Avg Protein', value: Math.round(nutrition.protein / days), unit: 'g', color: 'bg-blue-100 text-blue-700' },
    { label: 'Avg Carbs', value: Math.round(nutrition.carbs / days), unit: 'g', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Avg Fat', value: Math.round(nutrition.fat / days), unit: 'g', color: 'bg-purple-100 text-purple-700' },
  ]

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Weekly Nutrition</p>
      <div className="flex flex-wrap gap-3">
        {items.map(item => (
          <div key={item.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${item.color}`}>
            <span>{item.value}{item.unit}</span>
            <span className="text-xs opacity-70">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
