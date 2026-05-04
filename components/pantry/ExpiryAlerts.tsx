'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { differenceInDays, parseISO, format } from 'date-fns'
import type { PantryItem } from '@/lib/types/database'

interface Props {
  expiringItems: PantryItem[]
}

export default function ExpiryAlerts({ expiringItems }: Props) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const key = `pantry-alert-dismissed-${format(new Date(), 'yyyy-MM-dd')}`
    if (localStorage.getItem(key)) setDismissed(true)
  }, [])

  if (dismissed || expiringItems.length === 0) return null

  function dismiss() {
    const key = `pantry-alert-dismissed-${format(new Date(), 'yyyy-MM-dd')}`
    localStorage.setItem(key, '1')
    setDismissed(true)
  }

  const labels = expiringItems.map(item => {
    const days = differenceInDays(parseISO(item.expires_at!), new Date())
    if (days === 0) return `${item.ingredient_name} (today)`
    if (days === 1) return `${item.ingredient_name} (tomorrow)`
    return `${item.ingredient_name} (${days}d)`
  })

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">
          {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring soon
        </p>
        <p className="text-sm text-amber-700 mt-0.5">
          {labels.join(', ')}
        </p>
      </div>
      <button
        onClick={dismiss}
        className="p-1 hover:bg-amber-100 rounded transition-colors text-amber-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
