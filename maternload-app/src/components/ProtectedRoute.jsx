import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, allowedRole }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Carregando...
        </p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && profile?.role !== allowedRole) {
    // Redireciona para a dashboard correta conforme o papel
    if (profile?.role === 'personal') return <Navigate to="/personal" replace />
    if (profile?.role === 'gestante') return <Navigate to="/student" replace />
    return <Navigate to="/login" replace />
  }

  return children
}
