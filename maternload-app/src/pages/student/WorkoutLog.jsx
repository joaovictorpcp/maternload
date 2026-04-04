import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { insertDailyRecord } from '../../services/supabase'
import { StudentLayout } from '../../components/layout/StudentLayout'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, XCircle, Save, AlertTriangle, Moon,
  Zap, Brain, Dumbbell, Heart, ChevronDown
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
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    workout_date: new Date().toISOString().split('T')[0],
    workout_type: 'Misto',
    cardio_minutes: 0,
    cardio_description: '',
    strength_minutes: 0,
    avg_heart_rate: '',
    rpe: 5,
    talk_test: true,
    // Hooper (escala 1-7, onde 1 = bom, 7 = ruim)
    hooper_sleep: 2,
    hooper_fatigue: 2,
    hooper_stress: 2,
    hooper_muscle_pain: 2,
    // Alerts
    alert_bleeding: false,
    alert_dizziness: false,
    alert_fluid_loss: false,
    alert_pelvic_pain: false,
    notes: '',
  })

  const totalMinutes = form.cardio_minutes + form.strength_minutes

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
      await insertDailyRecord({
        student_id: profile.id,
        workout_date: form.workout_date,
        workout_type: form.workout_type,
        cardio_minutes: form.cardio_minutes,
        cardio_description: form.cardio_description || null,
        strength_minutes: form.strength_minutes,
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
      })
      setSuccess(true)
      setTimeout(() => navigate('/student'), 2000)
    } catch (err) {
      if (err.message?.includes('unique')) {
        setError('Você já registrou um treino para hoje. Só é permitido um registro por dia.')
      } else {
        setError(err.message || 'Erro ao salvar. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
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
          <h2 style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>Treino Registrado!</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Ótimo trabalho! Seus dados foram salvos com sucesso.
          </p>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Registrar Treino</h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Preencha com cuidado — seus dados ajudam seu treinador a cuidar melhor de você! 💛
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Data */}
          <div className="card card-sm">
            <div className="form-group">
              <label className="form-label" htmlFor="workout-date">Data do Treino</label>
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

          {/* Tipo de Treino */}
          <div className="card card-sm">
            <div className="form-group">
              <label className="form-label">Tipo de Treino</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {['Cardio', 'Força', 'Misto'].map(type => (
                  <button
                    key={type}
                    type="button"
                    id={`workout-type-${type.toLowerCase()}`}
                    onClick={() => setField('workout_type', type)}
                    style={{
                      flex: 1, padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${form.workout_type === type ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                      background: form.workout_type === type ? 'rgba(46,139,122,0.08)' : 'var(--color-surface)',
                      color: form.workout_type === type ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                      fontWeight: 700, fontSize: 'var(--font-size-sm)', cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {type === 'Cardio' ? '🏃' : type === 'Força' ? '💪' : '⚡'} {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duração */}
          <div className="card card-sm">
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Heart size={16} color="var(--color-secondary)" /> Duração do Treino
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="cardio-minutes">Cardio (min)</label>
                <input
                  id="cardio-minutes"
                  type="number"
                  min="0"
                  max="180"
                  className="form-input"
                  value={form.cardio_minutes}
                  onChange={e => setField('cardio_minutes', Math.max(0, Number(e.target.value)))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="strength-minutes">Força (min)</label>
                <input
                  id="strength-minutes"
                  type="number"
                  min="0"
                  max="180"
                  className="form-input"
                  value={form.strength_minutes}
                  onChange={e => setField('strength_minutes', Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>
            
            <div style={{
              marginTop: 'var(--space-4)', padding: 'var(--space-3)',
              background: 'rgba(46,139,122,0.08)', borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                ⏱ Total: {totalMinutes} minutos
              </span>
            </div>

            {(form.workout_type === 'Cardio' || form.workout_type === 'Misto') && (
              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <label className="form-label" htmlFor="cardio-desc">Qual cardio foi feito?</label>
                <input
                  id="cardio-desc"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Caminhada, Bicicleta estacionária..."
                  value={form.cardio_description}
                  onChange={e => setField('cardio_description', e.target.value)}
                />
              </div>
            )}

            <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
              <label className="form-label" htmlFor="avg-hr">FC Média (BPM) — opcional</label>
              <input
                id="avg-hr"
                type="number"
                min="60"
                max="220"
                className="form-input"
                placeholder="Ex: 140"
                value={form.avg_heart_rate}
                onChange={e => setField('avg_heart_rate', e.target.value)}
              />
            </div>
          </div>

          {/* RPE Slider */}
          <div className="card card-sm">
            <RPESlider value={form.rpe} onChange={v => setField('rpe', v)} />
          </div>

          {/* Talk Test */}
          <div className="card card-sm">
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              💬 Talk Test — você conseguia conversar durante o treino?
            </div>
            <div className="toggle-group">
              <button
                id="talk-test-yes"
                type="button"
                className={`toggle-btn ${form.talk_test ? 'active-success' : ''}`}
                onClick={() => setField('talk_test', true)}
              >
                <CheckCircle size={24} />
                Sim, conseguia conversar
              </button>
              <button
                id="talk-test-no"
                type="button"
                className={`toggle-btn ${!form.talk_test ? 'active-danger' : ''}`}
                onClick={() => setField('talk_test', false)}
              >
                <XCircle size={24} />
                Não, estava sem fôlego
              </button>
            </div>
          </div>

          {/* Hooper Index */}
          <div className="card card-sm">
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              🧠 Como você está se sentindo?
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                (1 = Ótimo, 7 = Péssimo)
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <HooperSlider label="Sono" icon={Moon} value={form.hooper_sleep} id="hooper-sleep"
                onChange={v => setField('hooper_sleep', v)} />
              <HooperSlider label="Fadiga" icon={Zap} value={form.hooper_fatigue} id="hooper-fatigue"
                onChange={v => setField('hooper_fatigue', v)} />
              <HooperSlider label="Estresse" icon={Brain} value={form.hooper_stress} id="hooper-stress"
                onChange={v => setField('hooper_stress', v)} />
              <HooperSlider label="Dor Muscular" icon={Dumbbell} value={form.hooper_muscle_pain} id="hooper-muscle"
                onChange={v => setField('hooper_muscle_pain', v)} />
            </div>
            <div style={{
              marginTop: 'var(--space-4)', padding: 'var(--space-3)',
              background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Hooper Total</span>
              <span style={{
                fontWeight: 800, fontSize: 'var(--font-size-lg)',
                color: (form.hooper_sleep + form.hooper_fatigue + form.hooper_stress + form.hooper_muscle_pain) > 20
                  ? 'var(--color-danger)' : (form.hooper_sleep + form.hooper_fatigue + form.hooper_stress + form.hooper_muscle_pain) > 14
                    ? 'var(--color-warning)' : 'var(--color-success)'
              }}>
                {form.hooper_sleep + form.hooper_fatigue + form.hooper_stress + form.hooper_muscle_pain} / 28
              </span>
            </div>
          </div>

          {/* Sinais de Alerta */}
          <div className="card card-sm" style={{ border: hasAnyAlert ? '2px solid var(--color-danger)' : '1px solid var(--color-border-light)' }}>
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <AlertTriangle size={18} color={hasAnyAlert ? 'var(--color-danger)' : 'var(--color-text-muted)'} />
              Sinais de Alerta
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              Toque em SIM se sentiu qualquer um dos sintomas abaixo durante ou após o treino.
              Em caso de dúvida, marque SIM e avise seu treinador.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <AlertToggle id="alert-bleeding" label="Sangramento" emoji="🩸"
                checked={form.alert_bleeding} onChange={v => setField('alert_bleeding', v)} />
              <AlertToggle id="alert-dizziness" label="Tontura" emoji="😵"
                checked={form.alert_dizziness} onChange={v => setField('alert_dizziness', v)} />
              <AlertToggle id="alert-fluid" label="Perda de Líquido" emoji="💧"
                checked={form.alert_fluid_loss} onChange={v => setField('alert_fluid_loss', v)} />
              <AlertToggle id="alert-pelvic" label="Dor Pélvica/Lombar" emoji="⚠️"
                checked={form.alert_pelvic_pain} onChange={v => setField('alert_pelvic_pain', v)} />
            </div>
            {hasAnyAlert && (
              <div className="alert-banner alert-banner-danger" style={{ marginTop: 'var(--space-4)' }}>
                <AlertTriangle size={16} />
                Avise seu treinador sobre estes sintomas!
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="card card-sm">
            <div className="form-group">
              <label className="form-label" htmlFor="notes">Observações (opcional)</label>
              <textarea
                id="notes"
                className="form-input"
                placeholder="Como foi o treino? Alguma observação para o seu treinador?"
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
              padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
            }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button
            id="submit-workout"
            type="submit"
            className="btn btn-secondary btn-lg btn-full"
            disabled={loading || totalMinutes === 0}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Salvando...</>
            ) : (
              <><Save size={18} /> Salvar Treino</>
            )}
          </button>

          <div style={{ height: 'var(--space-4)' }} />
        </form>
      </div>
    </StudentLayout>
  )
}
