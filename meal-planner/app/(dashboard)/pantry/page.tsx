'use client'

import { useState } from 'react'
import { Plus, Package, AlertTriangle, Tag } from 'lucide-react'
import { usePantry, useAddPantryItem, useDeletePantryItem, useUpdatePantryItem, useExpiringItems } from '@/lib/hooks/usePantry'
import PantryGrid from '@/components/pantry/PantryGrid'
import ExpiryAlerts from '@/components/pantry/ExpiryAlerts'
import Modal from '@/components/shared/Modal'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import PantryForm from '@/components/forms/PantryForm'
import type { PantryItem } from '@/lib/types/database'
import type { PantryItemInput } from '@/lib/types/api'

const CATEGORIES = ['All', 'produce', 'dairy', 'meat', 'pantry', 'frozen', 'canned', 'bakery', 'beverages']

export default function PantryPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState<PantryItem | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const { data: pantryItems = [], isLoading } = usePantry()
  const { data: expiringItems = [] } = useExpiringItems(3)
  const addItem = useAddPantryItem()
  const deleteItem = useDeletePantryItem()
  const updateItem = useUpdatePantryItem()

  const filtered = pantryItems.filter(item => {
    const matchesSearch = !search || item.ingredient_name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(pantryItems.map(i => i.category).filter(Boolean))]

  async function handleAdd(data: PantryItemInput) {
    await addItem.mutateAsync(data)
    setShowAddModal(false)
  }

  async function handleEdit(data: PantryItemInput) {
    if (!editItem) return
    await updateItem.mutateAsync({ id: editItem.id, updates: data })
    setEditItem(null)
  }

  async function handleDelete(id: string) {
    await deleteItem.mutateAsync(id)
  }

  return (
    <div className="flex flex-col h-full">
      <ExpiryAlerts expiringItems={expiringItems} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Items</p>
            <p className="text-xl font-bold text-gray-900">{pantryItems.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Expiring Soon</p>
            <p className="text-xl font-bold text-gray-900">{expiringItems.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Categories</p>
            <p className="text-xl font-bold text-gray-900">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Search pantry…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <PantryGrid
          items={filtered}
          onEdit={setEditItem}
          onDelete={handleDelete}
        />
      )}

      {/* Add modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Pantry Item">
        <PantryForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Pantry Item">
        {editItem && (
          <PantryForm
            item={editItem}
            onSubmit={handleEdit}
            onCancel={() => setEditItem(null)}
          />
        )}
      </Modal>
    </div>
  )
}
