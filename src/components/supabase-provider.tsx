'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type SupabaseContext = {
  supabase: SupabaseClient
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: unknown) => {
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        // Session expired, redirect to login
        if (window.location.pathname !== '/login') {
          await supabase.auth.signOut()
          router.push('/login')
        }
      }
    })

    // Global error handler for auth errors
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', async (event) => {
        const error = event.reason
        if (
          error?.message?.includes('Refresh Token') ||
          error?.message?.includes('Invalid Refresh Token') ||
          error?.status === 401
        ) {
          event.preventDefault()
          // Clear session and redirect
          await supabase.auth.signOut()
          if (window.location.pathname !== '/login') {
            router.push('/login')
          }
        }
      })
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <Context.Provider value={{ supabase }}>
      <>{children}</>
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }

  return context
}