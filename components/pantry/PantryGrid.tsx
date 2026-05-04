'use client'

import { Pencil, Trash2, Package } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatting'
import EmptyState from '@/components/shared/EmptyState'
import type { PantryItem } from '@/lib/types/database'
import { differenceInDays, parseISO } from 'date-fns'

const CATEGORY_ICONS: Record<string, string> = {
  produce: '🥦', dairy: '🥛', meat: '🥩', bakery: '🍞',
  frozen: '🧊', canned: '🥫', pantry: '🫙', beverages: '🧃',
}

interface Props {
  items: PantryItem[]
  onEdit: (item: PantryItem) => void
  onDelete: (id: string) => void
}

function ExpiryBadge({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) return null

  const days = differenceInDays(parseISO(expiresAt), new Date())

  if (days < 0) {
    return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Expired</span>
  }
  if (days === 0) {
    return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Today</span>
  }
  if (days <= 3) {
    return <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">{days}d left</span>
  }
  if (days <= 7) {
    return <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">{days}d left</span>
  }
  return <span className="text-xs text-gray-400">{formatDate(expiresAt)}</span>
}

export default function PantryGrid({ items, onEdit, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-12 h-12 text-gray-300" />}
        title="Pantry is empty"
        description="Add items you already have to subtract them from your shopping list"
        action={{ label: 'Add First Item', onClick: () => {} }}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map(item => (
        <div
          key={item.id}
          className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-2xl">{CATEGORY_ICONS[item.category ?? ''] ?? '📦'}</span>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(item)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="font-medium text-gray-900 text-sm leading-tight capitalize">
            {item.ingredient_name}
          </p>

          <p className="text-xs text-gray-500 mt-0.5">
            {item.quantity} {item.unit}
          </p>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">
              {item.category}
            </span>
            <ExpiryBadge expiresAt={item.expires_at} />
          </div>
        </div>
      ))}
    </div>
  )
}
