import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getProfile } from '../services/supabase'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        setSession(session)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const [profileError, setProfileError] = useState(null)

  const loadProfile = async (userId) => {
    try {
      setProfileError(null)
      const data = await getProfile(userId)
      setProfile(data)
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
      setProfileError(err.message || 'Erro de permissão no banco de dados (RLS).')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await loadProfile(session.user.id)
    }
  }

  const value = {
    session,
    profile,
    loading,
    isPersonal: profile?.role === 'personal',
    isStudent: profile?.role === 'gestante',
    signIn,
    signOut,
    refreshProfile,
    profileError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
