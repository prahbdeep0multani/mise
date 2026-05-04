'use client'

import { TrendingUp } from 'lucide-react'
import { useMeals } from '@/lib/hooks/useMeals'
import { calculateWeeklyNutrition } from '@/lib/utils/calculations'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

interface Props {
  weekStarting: string
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{Math.round(value)}g / {max}g</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function NutritionDashboard({ weekStarting }: Props) {
  const { data: meals = [], isLoading } = useMeals(weekStarting)

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  const nutrition = calculateWeeklyNutrition(meals)
  const days = 7
  const avgCalories = Math.round((nutrition.calories ?? 0) / days)
  const avgProtein = Math.round(nutrition.protein / days)
  const avgCarbs = Math.round(nutrition.carbs / days)
  const avgFat = Math.round(nutrition.fat / days)

  // Goals (daily)
  const goals = { calories: 2000, protein: 50, carbs: 250, fat: 65 }

  const statCards = [
    { label: 'Avg Daily Calories', value: avgCalories, unit: 'kcal', goal: goals.calories, color: 'text-orange-600' },
    { label: 'Avg Protein', value: avgProtein, unit: 'g/day', goal: goals.protein, color: 'text-blue-600' },
    { label: 'Avg Carbs', value: avgCarbs, unit: 'g/day', goal: goals.carbs, color: 'text-yellow-600' },
    { label: 'Avg Fat', value: avgFat, unit: 'g/day', goal: goals.fat, color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => {
          const pct = Math.round((stat.value / stat.goal) * 100)
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.unit}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-current transition-all"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{pct}% of daily goal</p>
            </div>
          )
        })}
      </div>

      {/* Macro breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Weekly Macro Totals
        </h3>
        <div className="space-y-4">
          <MacroBar label="Protein" value={nutrition.protein} max={goals.protein * days} color="bg-blue-500" />
          <MacroBar label="Carbohydrates" value={nutrition.carbs} max={goals.carbs * days} color="bg-yellow-500" />
          <MacroBar label="Fat" value={nutrition.fat} max={goals.fat * days} color="bg-purple-500" />
          <MacroBar label="Fiber" value={nutrition.fiber} max={25 * days} color="bg-green-500" />
        </div>
      </div>

      {meals.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No meals planned this week. Add meals in the Planner to see nutrition data.</p>
        </div>
      )}
    </div>
  )
}
