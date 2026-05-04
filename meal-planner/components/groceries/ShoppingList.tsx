'use client'

import { ShoppingBasket } from 'lucide-react'
import { sortByAisle } from '@/lib/utils/optimization'
import { formatUnit, capitalizeFirst } from '@/lib/utils/formatting'
import EmptyState from '@/components/shared/EmptyState'
import type { ConsolidatedIngredient } from '@/lib/types/models'

const CATEGORY_ICONS: Record<string, string> = {
  produce: '🥦', dairy: '🥛', meat: '🥩', bakery: '🍞',
  frozen: '🧊', canned: '🥫', pantry: '🫙', beverages: '🧃',
}

interface Props {
  items: ConsolidatedIngredient[]
  onToggle: (name: string, purchased: boolean) => void
  onUpdateQty: (name: string, qty: number) => void
}

export default function ShoppingList({ items, onToggle, onUpdateQty }: Props) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBasket className="w-12 h-12 text-gray-300" />}
        title="Shopping list is empty"
        description="Click Consolidate to generate your list from this week's meals"
      />
    )
  }

  const sorted = sortByAisle(items)

  // Group by category
  const groups: Record<string, ConsolidatedIngredient[]> = {}
  for (const item of sorted) {
    const cat = item.category || 'pantry'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {Object.entries(groups).map(([category, categoryItems]) => (
        <div key={category}>
          {/* Category header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-base">{CATEGORY_ICONS[category] ?? '📦'}</span>
            <span className="text-sm font-semibold text-gray-600 capitalize">{category}</span>
            <span className="text-xs text-gray-400 ml-auto">{categoryItems.length} items</span>
          </div>

          {/* Items */}
          {categoryItems.map((item, i) => (
            <div
              key={item.name}
              className={`flex items-center gap-3 px-4 py-3 ${i < categoryItems.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                onChange={e => onToggle(item.name, e.target.checked)}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{capitalizeFirst(item.name)}</p>
                {item.sources.length > 0 && (
                  <p className="text-xs text-gray-400 truncate">
                    from {item.sources.join(', ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {item.inPantry && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                    in pantry
                  </span>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {formatUnit(item.totalQty, item.unit)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
