import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Pages
import { Login } from './pages/Login'
import { PersonalDashboard } from './pages/personal/PersonalDashboard'
import { StudentDetail } from './pages/personal/StudentDetail'
import { PersonalSettings } from './pages/personal/PersonalSettings'
import { PersonalStudents } from './pages/personal/PersonalStudents'
import { PersonalReports } from './pages/personal/PersonalReports'
import { StudentDashboard } from './pages/student/StudentDashboard'
import { WorkoutLog } from './pages/student/WorkoutLog'
import { StudentHistory } from './pages/student/StudentHistory'
import { StudentSettings } from './pages/student/StudentSettings'
import { StudentEvolution } from './pages/student/StudentEvolution'

function RoleRedirect() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (profile?.role === 'personal') return <Navigate to="/personal" replace />
  if (profile?.role === 'gestante') return <Navigate to="/student" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Root redirect */}
          <Route path="/" element={<RoleRedirect />} />

          {/* ─── Personal Routes ──────────────────────────── */}
          <Route
            path="/personal"
            element={
              <ProtectedRoute allowedRole="personal">
                <PersonalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal/student/:studentId"
            element={
              <ProtectedRoute allowedRole="personal">
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal/students"
            element={
              <ProtectedRoute allowedRole="personal">
                <PersonalStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal/reports"
            element={
              <ProtectedRoute allowedRole="personal">
                <PersonalReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal/settings"
            element={
              <ProtectedRoute allowedRole="personal">
                <PersonalSettings />
              </ProtectedRoute>
            }
          />

          {/* ─── Student Routes ───────────────────────────── */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="gestante">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/log"
            element={
              <ProtectedRoute allowedRole="gestante">
                <WorkoutLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/history"
            element={
              <ProtectedRoute allowedRole="gestante">
                <StudentHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/evolution"
            element={
              <ProtectedRoute allowedRole="gestante">
                <StudentEvolution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <ProtectedRoute allowedRole="gestante">
                <StudentSettings />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
