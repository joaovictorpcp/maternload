import React from 'react'
import { PersonalLayout } from '../../components/layout/PersonalLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getAllStudents } from '../../services/supabase'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGestationalAge } from '../../hooks/useGestationalAge'
import { ChevronRight, Plus, UserCheck } from 'lucide-react'
import { InviteStudentModal } from '../../components/modals/InviteStudentModal'

function StudentRow({ student }) {
  const age = useGestationalAge(student.due_date)
  return (
    <Link to={`/personal/student/${student.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-light)',
        boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800
        }}>
          {student.full_name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{student.full_name}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {age.isValid ? `🤰 ${age.weeks}ª semana — ${age.trimesterLabel}` : 'DPP não informada'}
          </div>
        </div>
        <span className={`badge ${student.status === 'ativa' ? 'badge-success' : 'badge-secondary'}`}>
          {student.status === 'ativa' ? 'Ativa' : 'Inativa'}
        </span>
        <ChevronRight size={16} color="var(--color-text-muted)" />
      </div>
    </Link>
  )
}

export function PersonalStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    getAllStudents().then(d => setStudents(d || [])).finally(() => setLoading(false))
  }, [])

  return (
    <PersonalLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestantes</h1>
          <p className="page-subtitle">{students.length} gestant{students.length !== 1 ? 'es' : 'e'} cadastrada{students.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowInvite(true)}>
          <Plus size={16} /> Adicionar Gestante
        </button>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : students.length === 0 ? (
        <div className="card empty-state">
          <UserCheck size={40} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
          <div className="empty-state-title">Nenhuma gestante cadastrada</div>
          <button className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setShowInvite(true)}>
            <Plus size={16} /> Adicionar Gestante
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {students.map(s => <StudentRow key={s.id} student={s} />)}
        </div>
      )}

      {showInvite && <InviteStudentModal onClose={() => setShowInvite(false)} onSuccess={() => { setShowInvite(false); getAllStudents().then(d => setStudents(d || [])) }} />}
    </PersonalLayout>
  )
}
