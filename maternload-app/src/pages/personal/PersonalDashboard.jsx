import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllStudents, getAllStudentsWithAlerts } from '../../services/supabase'
import { useMetrics } from '../../hooks/useMetrics'
import { useGestationalAge } from '../../hooks/useGestationalAge'
import { PersonalLayout } from '../../components/layout/PersonalLayout'
import { InviteStudentModal } from '../../components/modals/InviteStudentModal'
import { AlertTriangle, Plus, Users, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '../../contexts/AuthContext'
import { DEMO_STUDENTS, DEMO_ALERTS } from '../../mockData'

function StudentCard({ student, hasAlert }) {
  const age = useGestationalAge(student.due_date)
  
  return (
    <Link to={`/personal/student/${student.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        border: `1.5px solid ${hasAlert ? 'var(--color-danger)' : 'var(--color-border-light)'}`,
        boxShadow: hasAlert ? '0 0 0 3px rgba(229,62,62,0.08)' : 'var(--shadow-sm)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        transition: 'all var(--transition-base)', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        animation: hasAlert ? 'pulseAlert 2s ease-in-out infinite' : 'none',
      }}
        className="student-card-hover"
      >
        {/* Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: hasAlert
            ? 'linear-gradient(135deg, var(--color-danger), #FC8181)'
            : 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: 'var(--font-size-md)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
        }}>
          {student.full_name.charAt(0)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)' }}>
              {student.full_name}
            </span>
            {hasAlert && (
              <span className="badge badge-danger" style={{ animation: 'pulseAlert 2s ease-in-out infinite' }}>
                <AlertTriangle size={10} />
                Alerta
              </span>
            )}
            <span className={`badge ${student.status === 'ativa' ? 'badge-success' : 'badge-secondary'}`}>
              {student.status === 'ativa' ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-1)', flexWrap: 'wrap' }}>
            {age.isValid ? (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary)', fontWeight: 600 }}>
                🤰 {age.weeks}ª semana — {age.trimesterLabel}
              </span>
            ) : student.due_date ? (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                DPP: {format(parseISO(student.due_date), 'dd/MM/yyyy')}
              </span>
            ) : (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                DPP não informada
              </span>
            )}
          </div>
        </div>

        <ChevronRight size={18} color="var(--color-text-muted)" />
      </div>
    </Link>
  )
}

export function PersonalDashboard() {
  const [students, setStudents] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const { isDemo } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (isDemo) {
      setStudents(DEMO_STUDENTS)
      setAlerts(DEMO_ALERTS)
      setLoading(false)
      return
    }
    try {
      const [studs, alertData] = await Promise.all([
        getAllStudents(),
        getAllStudentsWithAlerts()
      ])
      setStudents(studs || [])
      setAlerts(alertData || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const alertStudentIds = new Set(alerts.map(a => a.student_id))
  const activeStudents = students.filter(s => s.status === 'ativa')
  const alertCount = alertStudentIds.size

  if (loading) {
    return (
      <PersonalLayout>
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </PersonalLayout>
    )
  }

  return (
    <PersonalLayout>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Painel do Treinador</h1>
          <p className="page-subtitle">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <button
          id="invite-student-btn"
          className="btn btn-secondary"
          onClick={() => setShowInvite(true)}
        >
          <Plus size={18} />
          Adicionar Gestante
        </button>
      </div>

      {/* Alert Banner */}
      {alertCount > 0 && (
        <div className="alert-banner alert-banner-danger" style={{ marginBottom: 'var(--space-6)' }}>
          <AlertTriangle size={20} />
          <span>
            {alertCount} gestante{alertCount > 1 ? 's' : ''} com sinal de alerta esta semana.
            Verifique imediatamente.
          </span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid-kpi" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: 'rgba(46,139,122,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={22} color="var(--color-secondary)" />
            </div>
            <div>
              <div className="kpi-label">Gestantes Ativas</div>
              <div className="kpi-value" style={{ fontSize: 'var(--font-size-xl)' }}>
                {activeStudents.length}
              </div>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: 'rgba(229,62,62,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={22} color="var(--color-danger)" />
            </div>
            <div>
              <div className="kpi-label">Alertas Esta Semana</div>
              <div className="kpi-value" style={{ fontSize: 'var(--font-size-xl)', color: alertCount > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                {alertCount}
              </div>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: 'rgba(26,74,107,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <TrendingUp size={22} color="var(--color-primary)" />
            </div>
            <div>
              <div className="kpi-label">Total Cadastradas</div>
              <div className="kpi-value" style={{ fontSize: 'var(--font-size-xl)' }}>
                {students.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Gestantes</h2>
          {alertCount > 0 && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              🔴 = alerta ativo
            </span>
          )}
        </div>

        {students.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">🤰</div>
            <div className="empty-state-title">Nenhuma gestante cadastrada</div>
            <p style={{ marginBottom: 'var(--space-5)' }}>Comece adicionando sua primeira aluna gestante ao sistema.</p>
            <button className="btn btn-secondary" onClick={() => setShowInvite(true)}>
              <Plus size={16} />
              Adicionar Primeira Gestante
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {/* Alertas primeiro */}
            {students
              .sort((a, b) => {
                const aAlert = alertStudentIds.has(a.id)
                const bAlert = alertStudentIds.has(b.id)
                return bAlert - aAlert
              })
              .map(student => (
                <StudentCard
                  key={student.id}
                  student={student}
                  hasAlert={alertStudentIds.has(student.id)}
                />
              ))
            }
          </div>
        )}
      </div>

      {showInvite && (
        <InviteStudentModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => { setShowInvite(false); loadData() }}
        />
      )}

      <style>{`
        .student-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg) !important;
        }
      `}</style>
    </PersonalLayout>
  )
}
