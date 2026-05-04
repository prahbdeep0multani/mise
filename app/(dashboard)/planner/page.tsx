'use client'

import { useState, useCallback } from 'react'
import { Sparkles, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useMealStore } from '@/lib/stores/mealStore'
import { useAIStore } from '@/lib/stores/aiStore'
import { useMeals, useCreateMeal, useDeleteMeal } from '@/lib/hooks/useMeals'
import { useAuth } from '@/lib/hooks/useAuth'
import { getWeekStart } from '@/lib/utils/formatting'
import { getWeekDates } from '@/lib/utils/calculations'
import WeeklyCalendar from '@/components/planner/WeeklyCalendar'
import RecipeSelector from '@/components/planner/RecipeSelector'
import AISuggestions from '@/components/planner/AISuggestions'
import NutritionSummary from '@/components/planner/NutritionSummary'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import type { Recipe } from '@/lib/types/database'
import type { MealSuggestion } from '@/lib/types/models'
import { format, addWeeks, subWeeks, parseISO } from 'date-fns'

export default function PlannerPage() {
  const { user } = useAuth()
  const { currentWeek, setCurrentWeek, isGenerating, setIsGenerating, suggestions, setSuggestions } = useMealStore()
  const { isStreaming, setIsStreaming, appendToStream, clearStream } = useAIStore()

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showRecipeSelector, setShowRecipeSelector] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  const { data: meals = [], isLoading } = useMeals(currentWeek)
  const createMeal = useCreateMeal()
  const deleteMeal = useDeleteMeal()

  const weekDates = getWeekDates(currentWeek)
  const weekStart = parseISO(currentWeek)

  function prevWeek() {
    setCurrentWeek(getWeekStart(subWeeks(weekStart, 1)))
  }

  function nextWeek() {
    setCurrentWeek(getWeekStart(addWeeks(weekStart, 1)))
  }

  const handleAddMeal = useCallback((dayOfWeek: number) => {
    setSelectedDay(dayOfWeek)
    setShowRecipeSelector(true)
  }, [])

  const handleRecipeSelect = useCallback(async (recipe: Recipe) => {
    if (selectedDay === null || !user) return
    await createMeal.mutateAsync({
      user_id: user.id,
      recipe_id: recipe.id,
      day_of_week: selectedDay,
      week_starting: currentWeek,
      servings: 2,
      notes: null,
    })
    setShowRecipeSelector(false)
    setSelectedDay(null)
  }, [selectedDay, user, currentWeek, createMeal])

  const handleRemoveMeal = useCallback(async (mealId: string) => {
    await deleteMeal.mutateAsync(mealId)
  }, [deleteMeal])

  const handleMoveMeal = useCallback(async (mealId: string, newDay: number) => {
    // Update via API – handled in useUpdateMeal
  }, [])

  const handleGenerateAIPlan = useCallback(async () => {
    if (!user) return
    setIsGenerating(true)
    setShowAISuggestions(true)
    clearStream()

    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStarting: currentWeek,
          budget: 80,
          dietary: { vegan: false, keto: false, glutenFree: false, dairyFree: false, nutFree: false },
          prepTimeMax: 45,
          servings: 2,
          dislikedIngredients: [],
        }),
      })

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        appendToStream(chunk)
      }

      try {
        const parsed = JSON.parse(fullText)
        setSuggestions(parsed)
      } catch {
        // streamed as JSON — try to extract
      }
    } catch (err) {
      console.error('AI generation failed:', err)
    } finally {
      setIsGenerating(false)
      setIsStreaming(false)
    }
  }, [user, currentWeek, setIsGenerating, clearStream, appendToStream, setSuggestions, setIsStreaming])

  const handleAcceptSuggestions = useCallback(async (suggestedMeals: MealSuggestion[]) => {
    if (!user) return
    for (const suggestion of suggestedMeals) {
      // Create a recipe entry then add the meal
      const res = await fetch('/api/recipes/search?q=' + encodeURIComponent(suggestion.meal) + '&limit=1')
      const data = await res.json()
      if (data.recipes?.length > 0) {
        await createMeal.mutateAsync({
          user_id: user.id,
          recipe_id: data.recipes[0].id,
          day_of_week: suggestion.day,
          week_starting: currentWeek,
          servings: 2,
          notes: null,
        })
      }
    }
    setShowAISuggestions(false)
    setSuggestions(null)
  }, [user, currentWeek, createMeal, setSuggestions])

  const weekLabel = weekDates.length > 0
    ? `${format(weekDates[0], 'MMM d')} – ${format(weekDates[6], 'MMM d, yyyy')}`
    : ''

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 min-w-55 text-center">
            {weekLabel}
          </h2>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAIPlan}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors font-medium"
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating…' : 'Generate AI Plan'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <WeeklyCalendar
            weekStarting={currentWeek}
            meals={meals}
            onAddMeal={handleAddMeal}
            onRemoveMeal={handleRemoveMeal}
            onMoveMeal={handleMoveMeal}
          />
          <NutritionSummary meals={meals} />
        </>
      )}

      {showRecipeSelector && selectedDay !== null && (
        <RecipeSelector
          dayOfWeek={selectedDay}
          weekStarting={currentWeek}
          onSelect={handleRecipeSelect}
          onClose={() => { setShowRecipeSelector(false); setSelectedDay(null) }}
        />
      )}

      {showAISuggestions && (
        <AISuggestions
          suggestions={suggestions}
          onAccept={handleAcceptSuggestions}
          onDismiss={() => { setShowAISuggestions(false); setSuggestions(null) }}
          isLoading={isGenerating}
        />
      )}
    </div>
  )
}
