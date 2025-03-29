"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getBrowserClient } from "@/lib/supabase"
import type { UserProfile } from "@/lib/auth"

type AuthContextType = {
  user: UserProfile | null
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const supabase = getBrowserClient()

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          setError("Failed to get authentication session")
          setIsLoading(false)
          return
        }

        if (session?.user) {
          try {
            // Fetch user profile
            const { data, error: profileError } = await supabase
              .from("users")
              .select("id, username, email, avatar_url, bio")
              .eq("id", session.user.id)
              .single()

            if (profileError) {
              console.error("Error fetching user profile:", profileError)
              setError("Failed to fetch user profile")
            } else {
              setUser(data)
            }
          } catch (err) {
            console.error("Error in user profile fetch:", err)
            setError("An error occurred while fetching user data")
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Unexpected error in getInitialSession:", err)
        setError("An unexpected authentication error occurred")
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    try {
      const supabase = getBrowserClient()

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (session?.user) {
            // Fetch user profile
            const { data, error: profileError } = await supabase
              .from("users")
              .select("id, username, email, avatar_url, bio")
              .eq("id", session.user.id)
              .single()

            if (profileError) {
              console.error("Error fetching user profile on auth change:", profileError)
              setError("Failed to fetch user profile")
            } else {
              setUser(data)
            }
          } else {
            setUser(null)
          }

          setIsLoading(false)
        } catch (err) {
          console.error("Error in auth state change handler:", err)
          setError("An error occurred while processing authentication change")
          setIsLoading(false)
        }
      })

      return () => {
        subscription?.unsubscribe()
      }
    } catch (err) {
      console.error("Error setting up auth state change listener:", err)
      setError("Failed to initialize authentication")
      setIsLoading(false)
      return () => {}
    }
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, error }}>{children}</AuthContext.Provider>
}

