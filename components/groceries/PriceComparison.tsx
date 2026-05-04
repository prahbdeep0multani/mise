'use client'

import { TrendingDown, Loader2 } from 'lucide-react'
import { formatCurrency, capitalizeFirst } from '@/lib/utils/formatting'
import { calculateSplitShoppingSavings } from '@/lib/utils/optimization'
import EmptyState from '@/components/shared/EmptyState'
import type { PriceComparison as PriceComp, StoreBasket } from '@/lib/types/models'

interface Props {
  comparisons: PriceComp[]
  cheapestBasket: StoreBasket | null
  isLoading: boolean
}

export default function PriceComparison({ comparisons, cheapestBasket, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm text-gray-500">Checking prices at nearby stores…</p>
      </div>
    )
  }

  if (comparisons.length === 0) {
    return (
      <EmptyState
        icon={<TrendingDown className="w-12 h-12 text-gray-300" />}
        title="No price data yet"
        description="Select stores and click Compare Now to see price comparison"
      />
    )
  }

  const allStores = [...new Set(comparisons.flatMap(c => c.stores.map(s => s.storeName)))]
  const splitSavings = calculateSplitShoppingSavings(comparisons)

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      {cheapestBasket && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-600 mb-1">Cheapest Single Store</p>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(cheapestBasket.total)}</p>
            <p className="text-sm text-emerald-600 font-medium mt-0.5">{cheapestBasket.storeName}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-600 mb-1">Split Shopping Savings</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(splitSavings)}</p>
            <p className="text-sm text-blue-600 mt-0.5">by mixing stores</p>
          </div>
        </div>
      )}

      {/* Price table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ingredient</th>
              {allStores.map(store => (
                <th key={store} className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                  {store}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comp, i) => {
              const minPrice = Math.min(...comp.stores.map(s => s.price))
              return (
                <tr key={comp.ingredient} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{capitalizeFirst(comp.ingredient)}</td>
                  {allStores.map(storeName => {
                    const storeData = comp.stores.find(s => s.storeName === storeName)
                    const isCheapest = storeData && storeData.price === minPrice
                    return (
                      <td
                        key={storeName}
                        className={`px-4 py-2.5 text-right ${isCheapest ? 'text-emerald-600 font-semibold bg-emerald-50' : 'text-gray-600'}`}
                      >
                        {storeData ? formatCurrency(storeData.price) : <span className="text-gray-300">—</span>}
                        {storeData?.salePrice && (
                          <span className="ml-1 text-xs line-through text-gray-400">{formatCurrency(storeData.salePrice)}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}

            {/* Totals row */}
            <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
              <td className="px-4 py-3 text-gray-800">Total</td>
              {allStores.map(storeName => {
                const total = comparisons.reduce((sum, c) => {
                  const s = c.stores.find(s => s.storeName === storeName)
                  return sum + (s?.price ?? 0)
                }, 0)
                return (
                  <td key={storeName} className="px-4 py-3 text-right text-gray-800">
                    {total > 0 ? formatCurrency(total) : '—'}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
