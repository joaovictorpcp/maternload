import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, Users, Settings, LogOut, Heart, FileText
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Painel', to: '/personal' },
  { icon: Users, label: 'Gestantes', to: '/personal/students' },
  { icon: FileText, label: 'Relatórios', to: '/personal/reports' },
  { icon: Settings, label: 'Configurações', to: '/personal/settings' },
]

export function PersonalLayout({ children }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'JV'

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Heart size={20} color="white" fill="white" />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">MaternLoad</span>
            <span className="sidebar-logo-tagline">Personal Trainer</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/personal'}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {profile?.full_name?.split(' ')[0] || 'Personal'}
              </span>
              <span className="sidebar-user-role">Personal Trainer</span>
            </div>
          </div>

          <button
            className="sidebar-nav-item"
            onClick={handleSignOut}
            style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex' }}
          >
            <LogOut size={18} className="nav-icon" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
