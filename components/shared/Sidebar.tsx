'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  ShoppingCart,
  Package,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
}

const navItems: NavItem[] = [
  {
    href: '/dashboard/planner',
    icon: <CalendarDays className="h-5 w-5" />,
    label: 'Meal Planner',
  },
  {
    href: '/dashboard/groceries',
    icon: <ShoppingCart className="h-5 w-5" />,
    label: 'Grocery List',
  },
  {
    href: '/dashboard/pantry',
    icon: <Package className="h-5 w-5" />,
    label: 'Pantry',
  },
  {
    href: '/dashboard/insights',
    icon: <Sparkles className="h-5 w-5" />,
    label: 'AI Insights',
  },
  {
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
]

function getInitials(email: string): string {
  const parts = email.split('@')[0].split(/[._-]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const email = user?.email ?? ''
  const initials = email ? getInitials(email) : '??'

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-gray-200 px-6 py-5">
        <span className="text-2xl" aria-hidden="true">
          🌿
        </span>
        <span className="text-xl font-bold text-gray-900">MealPlan</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-700',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
