'use client'

import { useState } from 'react'
import { X, Clock, DollarSign, Star, GripVertical } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { MealWithRecipe } from '@/lib/types/models'
import { formatCurrency } from '@/lib/utils/formatting'

const CUISINE_EMOJI: Record<string, string> = {
  italian: '🍝', mexican: '🌮', asian: '🍜', american: '🍔',
  mediterranean: '🥗', indian: '🍛', french: '🥘', default: '🍽️',
}

interface Props {
  meal: MealWithRecipe
  onRemove: () => void
  onRate: (rating: number) => void
}

export default function MealCard({ meal, onRemove, onRate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [rating, setRating] = useState(meal.feedback_rating ?? 0)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: meal.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const emoji = CUISINE_EMOJI[meal.recipe?.cuisine?.toLowerCase() ?? ''] ?? CUISINE_EMOJI.default
  const recipe = meal.recipe

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer select-none"
    >
      <div className="p-2">
        <div className="flex items-start gap-1">
          {/* Drag handle */}
          <button
            {...listeners}
            {...attributes}
            className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 min-w-0" onClick={() => setExpanded(!expanded)}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-base">{emoji}</span>
              <span className="text-xs font-semibold text-gray-800 truncate">
                {recipe?.name ?? 'Recipe'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              {recipe?.prep_time_minutes && (
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {recipe.prep_time_minutes}m
                </span>
              )}
              {recipe?.estimated_cost && (
                <span className="flex items-center gap-0.5">
                  <DollarSign className="w-3 h-3" />
                  {formatCurrency(Number(recipe.estimated_cost))}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="flex-shrink-0 p-0.5 text-gray-300 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {expanded && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            {recipe?.nutrition && typeof recipe.nutrition === 'object' && (
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-2">
                <span>Cal: {(recipe.nutrition as { calories?: number }).calories ?? '—'}</span>
                <span>Protein: {(recipe.nutrition as { protein?: number }).protein ?? '—'}g</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">Rate:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={e => {
                    e.stopPropagation()
                    setRating(star)
                    onRate(star)
                  }}
                  className={star <= rating ? 'text-yellow-400' : 'text-gray-200'}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
