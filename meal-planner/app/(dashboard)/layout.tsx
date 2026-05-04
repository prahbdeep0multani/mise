'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import Sidebar from '@/components/shared/Sidebar'
import Header from '@/components/shared/Header'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Fixed sidebar */}
      <div className="fixed inset-y-0 left-0 z-10 w-64">
        <Sidebar />
      </div>

      {/* Main content — offset by sidebar width */}
      <div className="ml-64 flex flex-1 flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
