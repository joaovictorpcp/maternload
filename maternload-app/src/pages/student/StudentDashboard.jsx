import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getStudentRecords } from '../../services/supabase'
import { useGestationalAge } from '../../hooks/useGestationalAge'
import { useMetrics } from '../../hooks/useMetrics'
import { StudentLayout } from '../../components/layout/StudentLayout'
import { Link } from 'react-router-dom'
import { PlusCircle, AlertTriangle, CheckCircle, Clock, Activity, Heart, TrendingUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DEMO_STUDENT_SELF_RECORDS } from '../../mockData'

function WorkoutTypeIcon({ type }) {
  const map = { Cardio: '🏃', Força: '💪', Misto: '⚡' }
  return <span>{map[type] || '🏋'}</span>
}

export function StudentDashboard() {
  const { profile, isDemo } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const age = useGestationalAge(profile?.due_date)
  const metrics = useMetrics(records)

  useEffect(() => {
    if (isDemo) {
      setRecords(DEMO_STUDENT_SELF_RECORDS)
      setLoading(false)
      return
    }
    if (profile?.id) {
      loadRecords()
    }
  }, [profile, isDemo])

  const loadRecords = async () => {
    try {
      const data = await getStudentRecords(profile.id)
      setRecords(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Gestante'
  const hourNow = new Date().getHours()
  const greeting = hourNow < 12 ? 'Bom dia' : hourNow < 18 ? 'Boa tarde' : 'Boa noite'

  if (loading) {
    return (
      <StudentLayout>
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      {/* Greeting */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          {greeting},
        </p>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
          {firstName}! 🤰
        </h1>
      </div>

      {/* Gestational Week Hero */}
      {age.isValid && (
        <div className="week-hero">
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7, marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.08em', position: 'relative' }}>
            Semana Gestacional
          </div>
          <div className="week-hero-weeks">
            {age.weeks}<span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>ª</span>
          </div>
          <div className="week-hero-label">{age.days} dia{age.days !== 1 ? 's' : ''} desta semana</div>
          <div className="week-hero-trimester">{age.trimesterLabel}</div>
        </div>
      )}

      {/* Alert Banner */}
      {metrics.hasRecentAlert && (
        <div className="alert-banner alert-banner-danger" style={{ marginBottom: 'var(--space-5)' }}>
          <AlertTriangle size={18} />
          <span>Você registrou um sinal de alerta. Informe seu treinador imediatamente.</span>
        </div>
      )}

      {/* Quick Log Button */}
      <Link to="/student/log" style={{ display: 'block', textDecoration: 'none', marginBottom: 'var(--space-6)' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5) var(--space-6)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'white', boxShadow: '0 8px 30px rgba(46,139,122,0.35)',
          transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
        }}
          className="log-btn-hover"
        >
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.85, marginBottom: '4px' }}>
              Pronta para registrar?
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>
              Registrar Treino de Hoje
            </div>
          </div>
          <PlusCircle size={36} style={{ opacity: 0.9 }} />
        </div>
      </Link>

      {/* Weekly Summary */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)' }}>
          📊 Semana Atual
        </div>
        
        {/* ACOG Progress */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Meta ACOG (150 min/semana)
            </span>
            <span style={{ fontWeight: 800, color: metrics.acogPercent >= 100 ? 'var(--color-success)' : 'var(--color-secondary)' }}>
              {metrics.weeklyVolume} / 150 min
            </span>
          </div>
          <div className="progress-bar" style={{ height: 12 }}>
            <div
              className={`progress-fill ${metrics.acogPercent >= 100 ? 'achieved' : ''}`}
              style={{ width: `${metrics.acogPercent}%` }}
            />
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', textAlign: 'right' }}>
            {metrics.acogPercent >= 100 ? '🎉 Meta atingida!' : `${100 - metrics.acogPercent}% restante`}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div style={{
            background: 'rgba(91,196,168,0.08)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Cardio</div>
            <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', color: 'var(--color-secondary)' }}>
              {metrics.weeklyCardio}<span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}> min</span>
            </div>
          </div>
          <div style={{
            background: 'rgba(26,74,107,0.08)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Força</div>
            <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
              {metrics.weeklyStrength}<span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}> min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Workout */}
      {records.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)' }}>
            🏋 Último Treino
          </div>
          {(() => {
            const last = records[0]
            return (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <WorkoutTypeIcon type={last.workout_type} />
                    <span style={{ fontWeight: 700 }}>{last.workout_type}</span>
                    <span className={`badge ${last.has_alert ? 'badge-danger' : 'badge-success'}`}>
                      {last.has_alert ? <><AlertTriangle size={10} /> Alerta</> : <><CheckCircle size={10} /> OK</>}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {format(parseISO(last.workout_date), "dd 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Duração</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      {last.total_minutes ?? (last.cardio_minutes + last.strength_minutes)}<span style={{ fontSize: 10, fontWeight: 500 }}>min</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>RPE</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      {last.rpe}<span style={{ fontSize: 10, fontWeight: 500 }}>/10</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Hooper</div>
                    <div style={{ fontWeight: 800, color: last.hooper_total > 20 ? 'var(--color-danger)' : last.hooper_total > 14 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      {last.hooper_total ?? (last.hooper_sleep + last.hooper_fatigue + last.hooper_stress + last.hooper_muscle_pain)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {records.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🌱</div>
          <p style={{ fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            Nenhum treino registrado ainda
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Comece registrando seu primeiro treino!
          </p>
        </div>
      )}

      <style>{`
        .log-btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(46,139,122,0.45) !important;
        }
      `}</style>
    </StudentLayout>
  )
}
