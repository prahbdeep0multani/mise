'use client'

import type { DietaryPreferences } from '@/lib/types/models'

interface ToggleOption {
  key: keyof DietaryPreferences
  label: string
  description: string
}

const TOGGLE_OPTIONS: ToggleOption[] = [
  { key: 'vegan', label: 'Vegan', description: 'No animal products' },
  { key: 'keto', label: 'Keto', description: 'Low carb, high fat' },
  { key: 'glutenFree', label: 'Gluten-Free', description: 'No gluten-containing grains' },
  { key: 'dairyFree', label: 'Dairy-Free', description: 'No dairy products' },
  { key: 'nutFree', label: 'Nut-Free', description: 'No tree nuts or peanuts' },
]

interface PreferencesFormProps {
  preferences: DietaryPreferences
  onChange: (prefs: DietaryPreferences) => void
}

export default function PreferencesForm({ preferences, onChange }: PreferencesFormProps) {
  function handleToggle(key: keyof DietaryPreferences) {
    onChange({ ...preferences, [key]: !preferences[key] })
  }

  // Derive a comma-separated string from preferences if stored elsewhere;
  // here we use a local controlled textarea keyed to a separate prop pattern.
  // The ingredientsToAvoid field lives alongside DietaryPreferences in settings,
  // so we surface it as an uncontrolled textarea emitting change via a wrapper.
  // Since DietaryPreferences doesn't include ingredientsToAvoid, we cast safely.
  const extPrefs = preferences as DietaryPreferences & { ingredientsToAvoid?: string[] }
  const avoidText = (extPrefs.ingredientsToAvoid ?? []).join(', ')

  function handleAvoidChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const raw = e.target.value
    const items = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onChange({
      ...preferences,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ingredientsToAvoid: items,
    } as any)
  }

  return (
    <div className="space-y-6">
      {/* Dietary toggles */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Dietary Restrictions
        </h3>
        <ul className="space-y-3">
          {TOGGLE_OPTIONS.map(({ key, label, description }) => {
            const enabled = preferences[key]
            return (
              <li key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={label}
                  onClick={() => handleToggle(key)}
                  className={[
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                    enabled ? 'bg-green-600' : 'bg-gray-200',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      enabled ? 'translate-x-5' : 'translate-x-0',
                    ].join(' ')}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Ingredients to avoid */}
      <div>
        <label
          htmlFor="ingredients_to_avoid"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Ingredients to Avoid
        </label>
        <p className="mb-2 text-xs text-gray-500">
          Enter ingredients separated by commas (e.g. shellfish, mushrooms, cilantro)
        </p>
        <textarea
          id="ingredients_to_avoid"
          rows={3}
          defaultValue={avoidText}
          onChange={handleAvoidChange}
          placeholder="shellfish, mushrooms, cilantro…"
          className="block w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  )
}
