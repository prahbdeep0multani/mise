'use client'

import { useState } from 'react'
import type { PantryItem } from '@/lib/types/database'
import type { PantryItemInput } from '@/lib/types/api'

interface PantryFormProps {
  item?: PantryItem
  onSubmit: (data: PantryItemInput) => Promise<void>
  onCancel: () => void
}

const UNIT_OPTIONS = ['g', 'ml', 'cup', 'tbsp', 'tsp', 'whole', 'oz', 'lb'] as const
const CATEGORY_OPTIONS = [
  'produce',
  'dairy',
  'meat',
  'pantry',
  'frozen',
  'canned',
  'bakery',
  'beverages',
] as const

interface FormErrors {
  ingredient_name?: string
  quantity?: string
  unit?: string
  category?: string
}

export default function PantryForm({ item, onSubmit, onCancel }: PantryFormProps) {
  const [ingredientName, setIngredientName] = useState(item?.ingredient_name ?? '')
  const [quantity, setQuantity] = useState<string>(
    item?.quantity != null ? String(item.quantity) : '',
  )
  const [unit, setUnit] = useState(item?.unit ?? 'whole')
  const [category, setCategory] = useState(item?.category ?? 'pantry')
  const [expiresAt, setExpiresAt] = useState(item?.expires_at?.slice(0, 10) ?? '')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!ingredientName.trim()) {
      errs.ingredient_name = 'Ingredient name is required.'
    }
    const qty = parseFloat(quantity)
    if (!quantity || isNaN(qty) || qty <= 0) {
      errs.quantity = 'Quantity must be a positive number.'
    }
    if (!unit) {
      errs.unit = 'Please select a unit.'
    }
    if (!category) {
      errs.category = 'Please select a category.'
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      const payload: PantryItemInput = {
        ingredient_name: ingredientName.trim(),
        quantity: parseFloat(quantity),
        unit,
        category,
        ...(expiresAt ? { expires_at: expiresAt } : {}),
      }
      await onSubmit(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Ingredient Name */}
      <div>
        <label
          htmlFor="ingredient_name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Ingredient Name <span className="text-red-500">*</span>
        </label>
        <input
          id="ingredient_name"
          type="text"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
          placeholder="e.g. Chicken breast"
          className={[
            'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500',
            errors.ingredient_name ? 'border-red-400' : 'border-gray-300',
          ].join(' ')}
        />
        {errors.ingredient_name && (
          <p className="mt-1 text-xs text-red-500">{errors.ingredient_name}</p>
        )}
      </div>

      {/* Quantity + Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="quantity"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className={[
              'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500',
              errors.quantity ? 'border-red-400' : 'border-gray-300',
            ].join(' ')}
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="unit"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Unit <span className="text-red-500">*</span>
          </label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className={[
              'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500',
              errors.unit ? 'border-red-400' : 'border-gray-300',
            ].join(' ')}
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {errors.unit && (
            <p className="mt-1 text-xs text-red-500">{errors.unit}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={[
            'block w-full rounded-lg border px-3 py-2.5 text-sm capitalize text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500',
            errors.category ? 'border-red-400' : 'border-gray-300',
          ].join(' ')}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-red-500">{errors.category}</p>
        )}
      </div>

      {/* Expiry Date */}
      <div>
        <label
          htmlFor="expires_at"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Expiry Date <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="expires_at"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving…
            </>
          ) : item ? (
            'Save Changes'
          ) : (
            'Add Item'
          )}
        </button>
      </div>
    </form>
  )
}
