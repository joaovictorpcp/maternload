import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getStudentRecords } from '../../services/supabase'
import { StudentLayout } from '../../components/layout/StudentLayout'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, CheckCircle, XCircle, Clock, Edit2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function WorkoutTypeIcon({ type }) {
  const map = { Cardio: '🏃', Força: '💪', Misto: '⚡' }
  return <span>{map[type] || '🏋'}</span>
}

export function StudentHistory() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) loadRecords()
  }, [profile])

  const loadRecords = async () => {
    try {
      const data = await getStudentRecords(profile.id)
      setRecords(data || [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="loading-screen" style={{ minHeight: '50vh' }}>
          <div className="spinner" />
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Histórico</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          {records.length} registro{records.length !== 1 ? 's' : ''} de treino
        </p>
      </div>

      {records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>📋</div>
          <p style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Nenhum treino registrado ainda</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {records.map(rec => {
            const total = rec.total_minutes ?? (rec.cardio_minutes + rec.strength_minutes)
            const hooper = rec.hooper_total ?? (rec.hooper_sleep + rec.hooper_fatigue + rec.hooper_stress + rec.hooper_muscle_pain)
            const rpeColor = rec.rpe >= 8 ? 'var(--color-danger)' : rec.rpe >= 6 ? 'var(--color-warning)' : 'var(--color-success)'
            const hooperColor = hooper > 20 ? 'var(--color-danger)' : hooper > 14 ? 'var(--color-warning)' : 'var(--color-success)'

            return (
              <div key={rec.id} className="card card-sm" style={{
                borderLeft: `4px solid ${rec.has_alert ? 'var(--color-danger)' : 'var(--color-secondary)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <WorkoutTypeIcon type={rec.workout_type} />
                    <span style={{ fontWeight: 700 }}>{rec.workout_type}</span>
                    {rec.has_alert && (
                      <span className="badge badge-danger">
                        <AlertTriangle size={9} /> Alerta
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {format(parseISO(rec.workout_date), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </span>
                    <button 
                      onClick={() => navigate(`/student/log/${rec.id}`)}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--color-secondary)' }}
                      title="Editar Treino"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                  <div style={{ textAlign: 'center', background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)' }}>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tempo</div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>
                      {total}
                      <span style={{ fontSize: 9, fontWeight: 500 }}>min</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)' }}>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>RPE</div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', color: rpeColor }}>
                      {rec.rpe}
                      <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--color-text-muted)' }}>/10</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)' }}>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hooper</div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', color: hooperColor }}>
                      {hooper}
                      <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--color-text-muted)' }}>/28</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Talk</div>
                    {rec.talk_test
                      ? <CheckCircle size={18} color="var(--color-success)" />
                      : <XCircle size={18} color="var(--color-danger)" />
                    }
                  </div>
                </div>

                {rec.notes && (
                  <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    💬 {rec.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </StudentLayout>
  )
}
