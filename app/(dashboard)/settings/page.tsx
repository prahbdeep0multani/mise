'use client'

import { useState } from 'react'
import { Save, User, MapPin, Store, Bell, Shield } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import BudgetForm from '@/components/forms/BudgetForm'
import PreferencesForm from '@/components/forms/PreferencesForm'
import type { DietaryPreferences } from '@/lib/types/models'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'dietary', label: 'Dietary', icon: Store },
  { id: 'location', label: 'Location & Stores', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
]

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [zipCode, setZipCode] = useState(profile?.location?.zipCode ?? '10001')
  const [budget, setBudget] = useState(profile?.budget_per_week ?? 80)
  const [dietary, setDietary] = useState<DietaryPreferences>(
    profile?.dietary_preferences ?? { vegan: false, keto: false, glutenFree: false, dairyFree: false, nutFree: false }
  )
  const [emailSummary, setEmailSummary] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [favoriteStores, setFavoriteStores] = useState<string[]>([])

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase
        .from('users')
        .update({
          full_name: fullName,
          location: { zipCode, lat: 0, lng: 0 },
          budget_per_week: budget,
          dietary_preferences: dietary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id ?? '')

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0">
        <nav className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                activeSection === id
                  ? 'bg-emerald-50 text-emerald-700 font-semibold border-r-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {activeSection === 'profile' && (
          <div className="max-w-lg space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Weekly Budget</label>
              <BudgetForm value={budget} onChange={setBudget} />
            </div>
          </div>
        )}

        {activeSection === 'dietary' && (
          <div className="max-w-lg space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Dietary Preferences</h2>
            <PreferencesForm preferences={dietary} onChange={setDietary} />
          </div>
        )}

        {activeSection === 'location' && (
          <div className="max-w-lg space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Location & Stores</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
                placeholder="10001"
                maxLength={5}
                className="w-48 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">Used to find nearby store prices</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Stores</label>
              <div className="flex flex-wrap gap-2">
                {["Whole Foods", "Trader Joe's", "Kroger", "Costco", "Amazon Fresh", "Instacart"].map(store => (
                  <button
                    key={store}
                    onClick={() => setFavoriteStores(prev =>
                      prev.includes(store) ? prev.filter(s => s !== store) : [...prev, store]
                    )}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      favoriteStores.includes(store)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="max-w-lg space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>

            {[
              { label: 'App notifications', sub: 'Expiry alerts, price drops', value: notifications, set: setNotifications },
              { label: 'Daily email summary', sub: 'What to cook today', value: emailSummary, set: setEmailSummary },
            ].map(({ label, sub, value, set }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <button
                  onClick={() => set(!value)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${value ? 'bg-emerald-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="max-w-lg space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Privacy</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Your meal plans, pantry, and grocery lists are private and only visible to you.</p>
              <p>We never share your personal data with third parties.</p>
              <div className="pt-4 space-y-3">
                <button className="text-red-500 hover:text-red-700 font-medium">Export my data</button>
                <br />
                <button className="text-red-500 hover:text-red-700 font-medium">Delete my account</button>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-8 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              saved
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
