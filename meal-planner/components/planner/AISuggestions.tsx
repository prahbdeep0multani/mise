'use client'

import { X, Check, Plus, Sparkles, Clock, DollarSign } from 'lucide-react'
import { getDayName } from '@/lib/utils/formatting'
import { formatCurrency } from '@/lib/utils/formatting'
import type { MealSuggestion, WeekPlanSuggestion } from '@/lib/types/models'

interface Props {
  suggestions: WeekPlanSuggestion | null
  onAccept: (meals: MealSuggestion[]) => void
  onDismiss: () => void
  isLoading: boolean
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="flex gap-2">
        <div className="h-3 bg-gray-200 rounded w-12" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
    </div>
  )
}

export default function AISuggestions({ suggestions, onAccept, onDismiss, isLoading }: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onDismiss} />

      <div className="fixed right-0 top-0 h-full w-[460px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">AI Meal Suggestions</h3>
              {suggestions && (
                <p className="text-xs text-emerald-100">
                  Est. total: {formatCurrency(suggestions.totalCost)} · {Math.round(suggestions.avgCaloriesPerDay)} cal/day
                </p>
              )}
            </div>
          </div>
          <button onClick={onDismiss} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && !suggestions ? (
            Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
          ) : suggestions ? (
            suggestions.meals.map((meal, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">
                      {getDayName(meal.day)}
                    </p>
                    <p className="font-semibold text-gray-900">{meal.meal}</p>
                    {meal.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{meal.description}</p>
                    )}
                  </div>
                  <button className="ml-3 p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {meal.prepTime}m
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {formatCurrency(meal.estimatedCost)}
                  </span>
                  {meal.nutrition.calories && (
                    <span>{meal.nutrition.calories} cal</span>
                  )}
                </div>

                {meal.ingredients.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {meal.ingredients.slice(0, 3).map(i => i.item).join(', ')}
                    {meal.ingredients.length > 3 && ` +${meal.ingredients.length - 3} more`}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
              <Sparkles className="w-12 h-12 mb-3 text-gray-200" />
              <p className="text-sm">No suggestions yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {suggestions && (
          <div className="border-t px-4 py-3 bg-gray-50 flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => onAccept(suggestions.meals)}
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Accept All
            </button>
          </div>
        )}
      </div>
    </>
  )
}
