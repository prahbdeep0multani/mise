'use client'

import { DollarSign } from 'lucide-react'
import { useMeals } from '@/lib/hooks/useMeals'
import { getDayName } from '@/lib/utils/formatting'
import { getMealsForDay } from '@/lib/utils/calculations'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

interface Props {
  weekStarting: string
}

export default function CostChart({ weekStarting }: Props) {
  const { data: meals = [], isLoading } = useMeals(weekStarting)

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  const dailyCosts = Array.from({ length: 7 }, (_, day) => {
    const dayMeals = getMealsForDay(meals, day)
    const cost = dayMeals.reduce((sum, m) => sum + Number(m.recipe?.estimated_cost ?? 0), 0)
    return { day, label: getDayName(day).slice(0, 3), cost }
  })

  const totalCost = dailyCosts.reduce((sum, d) => sum + d.cost, 0)
  const avgCost = totalCost / 7
  const maxCost = Math.max(...dailyCosts.map(d => d.cost), 1)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Weekly Total
          </p>
          <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Daily Average</p>
          <p className="text-2xl font-bold text-gray-900">${avgCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Daily Cost Breakdown</h3>
        <div className="flex items-end gap-3 h-40">
          {dailyCosts.map(({ day, label, cost }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">${cost.toFixed(0)}</span>
              <div
                className="w-full bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600"
                style={{ height: `${maxCost > 0 ? (cost / maxCost) * 100 : 0}%`, minHeight: cost > 0 ? 4 : 0 }}
              />
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-meal cost */}
      {meals.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Cost Per Meal</h3>
          <div className="space-y-2">
            {meals
              .slice()
              .sort((a, b) => Number(b.recipe?.estimated_cost ?? 0) - Number(a.recipe?.estimated_cost ?? 0))
              .map(meal => (
                <div key={meal.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{meal.recipe?.name ?? 'Recipe'}</span>
                  <span className="font-semibold text-gray-900">
                    ${Number(meal.recipe?.estimated_cost ?? 0).toFixed(2)}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
