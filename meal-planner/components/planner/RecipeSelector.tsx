'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search, Clock, DollarSign, Loader2 } from 'lucide-react'
import { getDayName } from '@/lib/utils/formatting'
import { formatCurrency } from '@/lib/utils/formatting'
import EmptyState from '@/components/shared/EmptyState'
import type { Recipe } from '@/lib/types/database'

const DIET_FILTERS = ['Quick (<30min)', 'Vegan', 'Keto', 'Gluten-Free']

interface Props {
  dayOfWeek: number
  weekStarting: string
  onSelect: (recipe: Recipe) => void
  onClose: () => void
}

export default function RecipeSelector({ dayOfWeek, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const searchRecipes = useCallback(async (q: string, filters: string[]) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (filters.includes('Vegan')) params.set('diet', 'vegan')
      if (filters.includes('Keto')) params.set('diet', 'keto')
      if (filters.includes('Gluten-Free')) params.set('intolerances', 'gluten')
      if (filters.includes('Quick (<30min)')) params.set('maxTime', '30')
      params.set('limit', '20')

      const res = await fetch(`/api/recipes/search?${params}`)
      const data = await res.json()
      setRecipes(data.recipes ?? [])
    } catch {
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    const timer = setTimeout(() => searchRecipes(query, activeFilters), 400)
    setDebounceTimer(timer)
    return () => clearTimeout(timer)
  }, [query, activeFilters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    searchRecipes('', [])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleFilter(f: string) {
    setActiveFilters(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="font-semibold text-gray-900">Add Meal</h3>
            <p className="text-sm text-gray-500">{getDayName(dayOfWeek)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search recipes…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mt-2">
            {DIET_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeFilters.includes(f)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          ) : recipes.length === 0 ? (
            <EmptyState
              icon={<Search className="w-10 h-10 text-gray-300" />}
              title="No recipes found"
              description="Try a different search or remove filters"
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {recipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => onSelect(recipe)}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-400 hover:bg-emerald-50 text-left transition-all group"
                >
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover rounded-lg" />
                    ) : '🍽️'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate group-hover:text-emerald-700">
                      {recipe.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {recipe.description ?? recipe.cuisine ?? ''}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      {recipe.prep_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {recipe.prep_time_minutes}m
                        </span>
                      )}
                      {recipe.estimated_cost && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {formatCurrency(Number(recipe.estimated_cost))}
                        </span>
                      )}
                      {recipe.dietary_tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
