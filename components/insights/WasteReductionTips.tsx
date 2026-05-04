'use client'

import { useState } from 'react'
import { Leaf, RefreshCw } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'
import type { PantryItem } from '@/lib/types/database'

interface Props {
  pantryItems: PantryItem[]
}

export default function WasteReductionTips({ pantryItems }: Props) {
  const [tips, setTips] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const expiringItems = pantryItems.filter(item => {
    if (!item.expires_at) return false
    const days = differenceInDays(parseISO(item.expires_at), new Date())
    return days >= 0 && days <= 7
  })

  async function generateTips() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `I have these items expiring soon: ${expiringItems.map(i => `${i.ingredient_name} (${differenceInDays(parseISO(i.expires_at!), new Date())} days)`).join(', ')}. Give me 5 specific recipe ideas or tips to use them up before they expire. Be concise.`,
        }),
      })
      const text = await res.text()
      const lines = text.split('\n').filter(l => l.trim())
      setTips(lines)
    } catch {
      setTips(['Failed to load tips. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Expiring items */}
      {expiringItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Leaf className="w-4 h-4" /> Items to use up
          </h3>
          <div className="flex flex-wrap gap-2">
            {expiringItems.map(item => {
              const days = differenceInDays(parseISO(item.expires_at!), new Date())
              return (
                <span
                  key={item.id}
                  className={`text-sm px-2.5 py-1 rounded-full font-medium ${
                    days <= 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {item.ingredient_name} ({days === 0 ? 'today' : `${days}d`})
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={generateTips}
        disabled={loading || expiringItems.length === 0}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors font-medium"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles />}
        {loading ? 'Generating tips…' : 'Get Waste Reduction Tips'}
      </button>

      {expiringItems.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Leaf className="w-10 h-10 mx-auto mb-2 text-gray-200" />
          <p className="text-sm">No items expiring in the next 7 days. Great job!</p>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Suggestions</h3>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <p>{tip.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Sparkles() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 14l.75 2.25L8 17l-2.25.75L5 20l-.75-2.25L2 17l2.25-.75L5 14zM19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" />
    </svg>
  )
}
