import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { insertDailyRecord, updateDailyRecord, deleteDailyRecord, getRecordById } from '../../services/supabase'
import { StudentLayout } from '../../components/layout/StudentLayout'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircle, XCircle, Save, AlertTriangle, Moon,
  Zap, Brain, Dumbbell, Heart, ChevronDown, Trash2, ArrowLeft
} from 'lucide-react'

// ─── RPE Color Helper ─────────────────────────────────────────────
function getRPEColor(val) {
  if (val <= 3) return '#38A169'
  if (val <= 5) return '#D97706'
  if (val <= 7) return '#DD6B20'
  return '#E53E3E'
}

function getRPELabel(val) {
  const labels = ['Repouso', 'Muito Leve', 'Leve', 'Leve', 'Moderado', 'Moderado', 'Difícil', 'Difícil', 'Muito Difícil', 'Extremo', 'Máximo']
  return labels[Math.round(val)] || ''
}

// ─── RPE Slider ────────────────────────────────────────────────────
function RPESlider({ value, onChange }) {
  const color = getRPEColor(value)
  const label = getRPELabel(value)
  const pct = (value / 10) * 100

  return (
    <div className="slider-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="form-label">Percepção de Esforço (RPE)</span>
        <div className="slider-value" style={{ background: color }}>{value}</div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-1)' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color }}>{label}</span>
      </div>
      <div className="slider-track">
        <input
          id="rpe-slider"
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="slider-input"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--color-border) ${pct}%)`
          }}
        />
      </div>
      <div className="slider-labels">
        <span>0 — Repouso</span>
        <span>10 — Máximo</span>
      </div>
    </div>
  )
}

// ─── Hooper Slider ─────────────────────────────────────────────────
function HooperSlider({ label, icon: Icon, value, onChange, id }) {
  const pct = ((value - 1) / 6) * 100
  const color = value <= 3 ? 'var(--color-success)' : value <= 5 ? 'var(--color-warning)' : 'var(--color-danger)'
  const desc = value <= 2 ? 'Ótimo' : value <= 4 ? 'Regular' : 'Ruim'

  return (
    <div style={{
      background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {Icon && <Icon size={16} color="var(--color-text-muted)" />}
          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{label}</span>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: 'var(--font-size-sm)'
        }}>
          {value}
        </div>
      </div>
      <input
        id={id}
        type="range"
        min="1"
        max="7"
        step="1"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="slider-input"
        style={{
          width: '100%',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--color-border) ${pct}%)`
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
        <span>1 — Ótimo</span>
        <span style={{ fontWeight: 600, color }}>{desc}</span>
        <span>7 — Péssimo</span>
      </div>
    </div>
  )
}

// ─── Alert Toggle ──────────────────────────────────────────────────
function AlertToggle({ label, emoji, checked, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      onClick={() => onChange(!checked)}
      className={`toggle-btn ${checked ? 'active-danger' : ''}`}
      style={{ minWidth: 0 }}
    >
      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.3 }}>{label}</span>
      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800 }}>
        {checked ? 'SIM' : 'NÃO'}
      </span>
    </button>
  )
}

export function WorkoutLog() {
  const { profile } = useAuth()
  const { recordId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!recordId)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    workout_date: new Date().toISOString().split('T')[0],
    workout_type: 'Misto',
    cardio_minutes: '',
    cardio_description: '',
    strength_minutes: '',
    avg_heart_rate: '',
    rpe: 5,
    talk_test: true,
    hooper_sleep: 2,
    hooper_fatigue: 2,
    hooper_stress: 2,
    hooper_muscle_pain: 2,
    alert_bleeding: false,
    alert_dizziness: false,
    alert_fluid_loss: false,
    alert_pelvic_pain: false,
    notes: '',
  })

  useEffect(() => {
    if (recordId) {
      loadRecordData()
    }
  }, [recordId])

  const loadRecordData = async () => {
    try {
      setFetching(true)
      const data = await getRecordById(recordId)
      if (data) {
        setForm({
          workout_date: data.workout_date,
          workout_type: data.workout_type,
          cardio_minutes: data.cardio_minutes || '',
          cardio_description: data.cardio_description || '',
          strength_minutes: data.strength_minutes || '',
          avg_heart_rate: data.avg_heart_rate || '',
          rpe: data.rpe,
          talk_test: data.talk_test,
          hooper_sleep: data.hooper_sleep,
          hooper_fatigue: data.hooper_fatigue,
          hooper_stress: data.hooper_stress,
          hooper_muscle_pain: data.hooper_muscle_pain,
          alert_bleeding: data.alert_bleeding,
          alert_dizziness: data.alert_dizziness,
          alert_fluid_loss: data.alert_fluid_loss,
          alert_pelvic_pain: data.alert_pelvic_pain,
          notes: data.notes || '',
        })
      }
    } catch (err) {
      setError('Erro ao carregar o treino.')
    } finally {
      setFetching(false)
    }
  }

  const totalMinutes = (Number(form.cardio_minutes) || 0) + (Number(form.strength_minutes) || 0)
  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }))
  const hasAnyAlert = form.alert_bleeding || form.alert_dizziness || form.alert_fluid_loss || form.alert_pelvic_pain

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (totalMinutes === 0) {
      setError('Informe pelo menos o tempo de cardio ou de força.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const recordData = {
        student_id: profile.id,
        workout_date: form.workout_date,
        workout_type: form.workout_type,
        cardio_minutes: Number(form.cardio_minutes) || 0,
        cardio_description: form.cardio_description || null,
        strength_minutes: Number(form.strength_minutes) || 0,
        avg_heart_rate: form.avg_heart_rate ? Number(form.avg_heart_rate) : null,
        rpe: form.rpe,
        talk_test: form.talk_test,
        hooper_sleep: form.hooper_sleep,
        hooper_fatigue: form.hooper_fatigue,
        hooper_stress: form.hooper_stress,
        hooper_muscle_pain: form.hooper_muscle_pain,
        alert_bleeding: form.alert_bleeding,
        alert_dizziness: form.alert_dizziness,
        alert_fluid_loss: form.alert_fluid_loss,
        alert_pelvic_pain: form.alert_pelvic_pain,
        notes: form.notes || null,
      }

      if (recordId) {
        await updateDailyRecord(recordId, recordData)
      } else {
        await insertDailyRecord(recordData)
      }

      setSuccess(true)
      setTimeout(() => navigate('/student/history'), 2000)
    } catch (err) {
      if (err.message?.includes('unique')) {
        setError('Você já registrou um treino para esta data.')
      } else {
        setError(err.message || 'Erro ao salvar. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este treino?')) return
    setLoading(true)
    try {
      await deleteDailyRecord(recordId)
      navigate('/student/history')
    } catch (err) {
      setError('Erro ao excluir treino.')
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <StudentLayout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      </StudentLayout>
    )
  }

  if (success) {
    return (
      <StudentLayout>
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 'var(--space-4)'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 12px rgba(56,161,105,0.1)'
          }}>
            <CheckCircle size={42} color="var(--color-success)" />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>
            {recordId ? 'Treino Atualizado!' : 'Treino Registrado!'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Seus dados foram salvos com sucesso.
          </p>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          {recordId && (
            <button 
              onClick={() => navigate('/student/history')}
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: 'var(--space-2)', padding: '0.25rem 0.5rem' }}
            >
              <ArrowLeft size={14} /> Voltar
            </button>
          )}
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
            {recordId ? 'Editar Treino' : 'Registrar Treino'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card card-sm">
            <div className="form-group">
              <label className="form-label" htmlFor="workout-date">Data</label>
              <input
                id="workout-date"
                type="date"
                className="form-input"
                value={form.workout_date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setField('workout_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="card card-sm">
            <label className="form-label">Tipo de Treino</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['Cardio', 'Força', 'Misto'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setField('workout_type', type)
                    if (type === 'Cardio') setField('strength_minutes', '')
                    if (type === 'Força') {
                      setField('cardio_minutes', '')
                      setField('cardio_description', '')
                    }
                  }}
                  style={{
                    flex: 1, padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${form.workout_type === type ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    background: form.workout_type === type ? 'rgba(46,139,122,0.08)' : 'var(--color-surface)',
                    color: form.workout_type === type ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                    fontWeight: 700, fontSize: 'var(--font-size-sm)', cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="card card-sm">
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Duração (minutos)</div>
            <div style={{ display: 'grid', gridTemplateColumns: form.workout_type === 'Misto' ? '1fr 1fr' : '1fr', gap: 'var(--space-4)' }}>
              {(form.workout_type === 'Cardio' || form.workout_type === 'Misto') && (
                <div className="form-group">
                  <label className="form-label">Cardio</label>
                  <input type="number" className="form-input" value={form.cardio_minutes} onChange={e => setField('cardio_minutes', e.target.value)} />
                </div>
              )}
              {(form.workout_type === 'Força' || form.workout_type === 'Misto') && (
                <div className="form-group">
                  <label className="form-label">Força</label>
                  <input type="number" className="form-input" value={form.strength_minutes} onChange={e => setField('strength_minutes', e.target.value)} />
                </div>
              )}
            </div>
          </div>

          {(form.workout_type === 'Cardio' || form.workout_type === 'Misto') && (
            <div className="card card-sm">
              <label className="form-label">Qual cardio?</label>
              <input type="text" className="form-input" value={form.cardio_description} onChange={e => setField('cardio_description', e.target.value)} />
            </div>
          )}

          <div className="card card-sm">
            <RPESlider value={form.rpe} onChange={v => setField('rpe', v)} />
          </div>

          <div className="card card-sm">
            <label className="form-label">Talk Test</label>
            <div className="toggle-group">
              <button type="button" className={`toggle-btn ${form.talk_test ? 'active-success' : ''}`} onClick={() => setField('talk_test', true)}>Sim</button>
              <button type="button" className={`toggle-btn ${!form.talk_test ? 'active-danger' : ''}`} onClick={() => setField('talk_test', false)}>Não</button>
            </div>
          </div>

          <div className="card card-sm">
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Índice de Hooper</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <HooperSlider label="Sono" icon={Moon} value={form.hooper_sleep} onChange={v => setField('hooper_sleep', v)} />
              <HooperSlider label="Fadiga" icon={Zap} value={form.hooper_fatigue} onChange={v => setField('hooper_fatigue', v)} />
              <HooperSlider label="Estresse" icon={Brain} value={form.hooper_stress} onChange={v => setField('hooper_stress', v)} />
              <HooperSlider label="Dor" icon={Dumbbell} value={form.hooper_muscle_pain} onChange={v => setField('hooper_muscle_pain', v)} />
            </div>
          </div>

          <div className="card card-sm" style={{ border: hasAnyAlert ? '2px solid var(--color-danger)' : '1px solid var(--color-border)' }}>
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Sinais de Alerta</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <AlertToggle label="Sangramento" emoji="🩸" checked={form.alert_bleeding} onChange={v => setField('alert_bleeding', v)} />
              <AlertToggle label="Tontura" emoji="😵" checked={form.alert_dizziness} onChange={v => setField('alert_dizziness', v)} />
              <AlertToggle label="Líquido" emoji="💧" checked={form.alert_fluid_loss} onChange={v => setField('alert_fluid_loss', v)} />
              <AlertToggle label="Dor" emoji="⚠️" checked={form.alert_pelvic_pain} onChange={v => setField('alert_pelvic_pain', v)} />
            </div>
          </div>

          <div className="card card-sm">
            <label className="form-label">Notas</label>
            <textarea className="form-input" value={form.notes} onChange={e => setField('notes', e.target.value)} rows={3} />
          </div>

          {error && <div className="alert-banner alert-banner-danger">{error}</div>}

          <button type="submit" className="btn btn-secondary btn-lg btn-full" disabled={loading || totalMinutes === 0}>
            {loading ? 'Salvando...' : (recordId ? 'Atualizar' : 'Salvar')}
          </button>

          {recordId && (
            <button type="button" onClick={handleDelete} className="btn btn-ghost btn-full" style={{ color: 'var(--color-danger)' }} disabled={loading}>
              <Trash2 size={18} /> Excluir Treino
            </button>
          )}
        </form>
      </div>
    </StudentLayout>
  )
}
