'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

type UserProfile = {
  id: string
  email: string
  full_name: string | null
  location: { zipCode: string; lat: number; lng: number }
  dietary_preferences: {
    vegan: boolean
    keto: boolean
    glutenFree: boolean
    dairyFree: boolean
    nutFree: boolean
  }
  budget_per_week: number
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  profile: UserProfile | null
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createSupabaseClient())
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        setProfile(null)
        return
      }

      setProfile(data as UserProfile)
    },
    [supabase],
  )

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password })
      return { error: error as Error | null }
    },
    [supabase],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error: error as Error | null }
    },
    [supabase],
  )

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error: error as Error | null }
  }, [supabase])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error: error as Error | null }
  }, [supabase])

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) {
        return { error: new Error('No authenticated user') }
      }

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, ...data } : null))
      }

      return { error: error as Error | null }
    },
    [supabase, user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
