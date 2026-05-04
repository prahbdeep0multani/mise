'use client'

const MIN_BUDGET = 20
const MAX_BUDGET = 300
const STEP = 5

interface BudgetFormProps {
  value: number
  onChange: (val: number) => void
}

export default function BudgetForm({ value, onChange }: BudgetFormProps) {
  const clampedValue = Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, value))

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value))
  }

  function handleNumber(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value)
    if (!isNaN(raw)) {
      onChange(Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, raw)))
    }
  }

  // Percentage for the gradient track fill
  const percent =
    ((clampedValue - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Weekly Budget:{' '}
          <span className="font-semibold text-green-600">${clampedValue}</span>
        </label>
        <input
          type="number"
          min={MIN_BUDGET}
          max={MAX_BUDGET}
          step={STEP}
          value={clampedValue}
          onChange={handleNumber}
          className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Weekly budget amount"
        />
      </div>

      <div className="relative">
        <input
          type="range"
          min={MIN_BUDGET}
          max={MAX_BUDGET}
          step={STEP}
          value={clampedValue}
          onChange={handleSlider}
          aria-label="Weekly budget slider"
          style={{
            background: `linear-gradient(to right, #16a34a ${percent}%, #d1d5db ${percent}%)`,
          }}
          className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-green-600 [&::-moz-range-thumb]:shadow-md"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>${MIN_BUDGET}</span>
          <span>${MAX_BUDGET}</span>
        </div>
      </div>
    </div>
  )
}
