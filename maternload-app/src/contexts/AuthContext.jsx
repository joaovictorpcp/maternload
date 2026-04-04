import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getProfile } from '../services/supabase'
import { DEMO_PERSONAL, DEMO_STUDENT_SELF } from '../mockData'

const AuthContext = createContext(null)
const DEMO_SESSION = { user: { id: 'demo' }, demo: true }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    // Verifica se há sessão demo salva
    const savedDemo = sessionStorage.getItem('maternload_demo_role')
    if (savedDemo) {
      setIsDemo(true)
      setSession(DEMO_SESSION)
      setProfile(savedDemo === 'personal' ? DEMO_PERSONAL : DEMO_STUDENT_SELF)
      setLoading(false)
      return
    }

    // Sessão real do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    try {
      const data = await getProfile(userId)
      setProfile(data)
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  // Login demo offline — sem Supabase
  const signInDemo = (role) => {
    const demoProfile = role === 'personal' ? DEMO_PERSONAL : DEMO_STUDENT_SELF
    sessionStorage.setItem('maternload_demo_role', role)
    setIsDemo(true)
    setSession(DEMO_SESSION)
    setProfile(demoProfile)
  }

  const signOut = async () => {
    if (isDemo) {
      sessionStorage.removeItem('maternload_demo_role')
      setIsDemo(false)
      setSession(null)
      setProfile(null)
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (isDemo) return
    if (session?.user?.id) {
      await loadProfile(session.user.id)
    }
  }

  const value = {
    session,
    profile,
    loading,
    isDemo,
    isPersonal: profile?.role === 'personal',
    isStudent: profile?.role === 'gestante',
    signIn,
    signInDemo,
    signOut,
    refreshProfile,
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
