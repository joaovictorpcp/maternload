import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, PlusCircle, ClipboardList, LogOut, Heart } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Início', to: '/student' },
  { icon: PlusCircle, label: 'Registrar', to: '/student/log' },
  { icon: ClipboardList, label: 'Histórico', to: '/student/history' },
]

export function StudentLayout({ children }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-logo">
          <Heart size={20} color="var(--color-accent)" fill="var(--color-accent)" />
          MaternLoad
        </div>
        <button
          onClick={handleSignOut}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
            borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-size-xs)', fontWeight: 600
          }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </header>

      {/* Page Content */}
      <main className="student-content">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="mobile-nav">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/student'}
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
