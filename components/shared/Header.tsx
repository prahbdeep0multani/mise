'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'

const titleMap: Record<string, string> = {
  planner: 'Meal Planner',
  groceries: 'Grocery List',
  pantry: 'Pantry',
  insights: 'AI Insights',
  settings: 'Settings',
}

function getPageTitle(pathname: string): string {
  for (const [segment, title] of Object.entries(titleMap)) {
    if (pathname.includes(`/${segment}`)) {
      return title
    }
  }
  return 'Dashboard'
}

function getInitials(email: string): string {
  const parts = email.split('@')[0].split(/[._-]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export default function Header() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const email = user?.email ?? ''
  const displayName = profile?.full_name ?? email.split('@')[0]
  const initials = email ? getInitials(email) : '??'
  const pageTitle = getPageTitle(pathname)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
              {initials}
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="truncate text-xs text-gray-500">{email}</p>
              </div>
              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    signOut()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 text-gray-400" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
