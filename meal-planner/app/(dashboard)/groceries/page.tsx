'use client'

import { useState } from 'react'
import { ShoppingCart, TrendingDown, Download, RefreshCw, Store } from 'lucide-react'
import { useMealStore } from '@/lib/stores/mealStore'
import { useGroceryStore } from '@/lib/stores/groceryStore'
import { useGroceryList, useConsolidateGroceries, useComparePrices, useExportList } from '@/lib/hooks/useGroceries'
import { formatCurrency } from '@/lib/utils/formatting'
import ShoppingList from '@/components/groceries/ShoppingList'
import PriceComparison from '@/components/groceries/PriceComparison'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { StoreType } from '@/lib/types/models'
import { findCheapestBasket } from '@/lib/utils/optimization'

const STORE_OPTIONS: { label: string; value: StoreType }[] = [
  { label: "Whole Foods", value: StoreType.WholeFoods },
  { label: "Trader Joe's", value: StoreType.TradersJoes },
  { label: "Kroger", value: StoreType.Kroger },
  { label: "Costco", value: StoreType.Costco },
  { label: "Amazon Fresh", value: StoreType.AmazonFresh },
]

export default function GroceriesPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'prices'>('list')
  const [zipCode, setZipCode] = useState('10001')
  const [selectedStores, setSelectedStores] = useState<StoreType[]>([StoreType.WholeFoods, StoreType.TradersJoes, StoreType.Kroger])

  const { currentWeek } = useMealStore()
  const { consolidatedItems, setConsolidatedItems, priceComparisons, setPriceComparisons } = useGroceryStore()

  const { data: groceryList, isLoading } = useGroceryList(currentWeek)
  const consolidate = useConsolidateGroceries()
  const comparePrices = useComparePrices()
  const exportList = useExportList()

  const purchasedCount = groceryList?.items.filter(i => i.is_purchased).length ?? 0
  const totalCount = groceryList?.items.length ?? 0
  const progress = totalCount > 0 ? (purchasedCount / totalCount) * 100 : 0

  async function handleConsolidate() {
    const result = await consolidate.mutateAsync({ weekStarting: currentWeek, mealIds: [] })
    setConsolidatedItems(result ?? [])
  }

  async function handleCompare() {
    if (!consolidatedItems.length) return
    const result = await comparePrices.mutateAsync({ items: consolidatedItems, zipCode, stores: selectedStores })
    setPriceComparisons(result ?? [])
    setActiveTab('prices')
  }

  async function handleExport() {
    await exportList.mutateAsync({ weekStarting: currentWeek, format: 'csv' })
  }

  function toggleStore(store: StoreType) {
    setSelectedStores(prev =>
      prev.includes(store) ? prev.filter(s => s !== store) : [...prev, store]
    )
  }

  const cheapestBasket = priceComparisons.length > 0 ? findCheapestBasket(priceComparisons) : null

  return (
    <div className="flex flex-col h-full">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Items</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          <p className="text-xs text-gray-400">{purchasedCount} purchased</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Est. Cost</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(groceryList?.total_cost_estimated ?? 0)}
          </p>
          <p className="text-xs text-gray-400">this week</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Progress</p>
          <p className="text-2xl font-bold text-emerald-600">{Math.round(progress)}%</p>
          <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-1.5" />
            Shopping List
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'prices' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            <TrendingDown className="w-4 h-4 inline mr-1.5" />
            Price Comparison
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConsolidate}
            disabled={consolidate.isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${consolidate.isPending ? 'animate-spin' : ''}`} />
            Consolidate
          </button>
          <button
            onClick={handleExport}
            disabled={exportList.isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'list' && (
          isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : (
            <ShoppingList
              items={consolidatedItems}
              onToggle={() => {}}
              onUpdateQty={() => {}}
            />
          )
        )}

        {activeTab === 'prices' && (
          <div>
            {/* Store + zip controls */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {STORE_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => toggleStore(s.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedStores.includes(s.value)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      {s.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                  placeholder="Zip code"
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleCompare}
                  disabled={comparePrices.isPending || consolidatedItems.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                >
                  {comparePrices.isPending ? <LoadingSpinner size="sm" /> : <TrendingDown className="w-4 h-4" />}
                  Compare Now
                </button>
              </div>
            </div>

            <PriceComparison
              comparisons={priceComparisons}
              cheapestBasket={cheapestBasket}
              isLoading={comparePrices.isPending}
            />
          </div>
        )}
      </div>
    </div>
  )
}
