import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudentById, getStudentRecords, getBodyMeasurements } from '../../services/supabase'
import { useMetrics } from '../../hooks/useMetrics'
import { useGestationalAge } from '../../hooks/useGestationalAge'
import { PersonalLayout } from '../../components/layout/PersonalLayout'
import { VolumeBarChart } from '../../components/charts/VolumeBarChart'
import { RPELineChart } from '../../components/charts/RPELineChart'
import { HooperRadarChart } from '../../components/charts/HooperRadarChart'
import { ClinicalReportButton } from '../../components/pdf/ClinicalReportButton'
import {
  AlertTriangle, ArrowLeft, Calendar, Heart, Activity,
  TrendingUp, Clock, CheckCircle, XCircle, Edit2, ToggleLeft
} from 'lucide-react'
import { format, parseISO, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { updateStudentStatus, updateStudentInfo } from '../../services/supabase'
import { useAuth } from '../../contexts/AuthContext'

function AlertDot({ active }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: active ? 'var(--color-danger)' : 'var(--color-success)',
      boxShadow: active ? '0 0 6px var(--color-danger)' : 'none',
      animation: active ? 'pulseAlert 1.5s infinite' : 'none',
    }} />
  )
}

function HooperIndicator({ label, value }) {
  const pct = ((value - 1) / 6) * 100
  const color = value <= 3 ? 'var(--color-success)' : value <= 5 ? 'var(--color-warning)' : 'var(--color-danger)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color }}>{value?.toFixed(1) ?? '—'}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export function StudentDetail() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [records, setRecords] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDueDate, setEditingDueDate] = useState(false)
  const [newDueDate, setNewDueDate] = useState('')

  useEffect(() => {
    loadData()
  }, [studentId])

  const loadData = async () => {
    try {
      const threeMonthsAgo = subMonths(new Date(), 3).toISOString().split('T')[0]
      const [stud, recs, meas] = await Promise.all([
        getStudentById(studentId),
        getStudentRecords(studentId, { from: threeMonthsAgo }),
        getBodyMeasurements(studentId)
      ])
      setStudent(stud)
      setRecords(recs || [])
      setMeasurements(meas || [])
      setNewDueDate(stud?.due_date || '')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = student.status === 'ativa' ? 'inativa' : 'ativa'
    await updateStudentStatus(studentId, newStatus)
    setStudent(prev => ({ ...prev, status: newStatus }))
  }

  const handleSaveDueDate = async () => {
    await updateStudentInfo(studentId, { due_date: newDueDate || null })
    setStudent(prev => ({ ...prev, due_date: newDueDate || null }))
    setEditingDueDate(false)
  }

  const metrics = useMetrics(records)
  const age = useGestationalAge(student?.due_date)

  if (loading) {
    return (
      <PersonalLayout>
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </PersonalLayout>
    )
  }

  if (!student) {
    return (
      <PersonalLayout>
        <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
          <p>Gestante não encontrada.</p>
          <button className="btn btn-ghost" onClick={() => navigate('/personal')}>Voltar</button>
        </div>
      </PersonalLayout>
    )
  }

  const lastRecord = records[0]
  const recentAlertTypes = lastRecord ? [
    lastRecord.alert_bleeding && 'Sangramento',
    lastRecord.alert_dizziness && 'Tontura',
    lastRecord.alert_fluid_loss && 'Perda de Líquido',
    lastRecord.alert_pelvic_pain && 'Dor Pélvica/Lombar',
  ].filter(Boolean) : []

  return (
    <PersonalLayout>
      {/* Back + Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button
          onClick={() => navigate('/personal')}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 'var(--space-4)' }}
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
              background: metrics.hasRecentAlert
                ? 'linear-gradient(135deg, var(--color-danger), #FC8181)'
                : 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 'var(--font-size-xl)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
            }}>
              {student.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="page-title" style={{ fontSize: 'var(--font-size-xl)' }}>{student.full_name}</h1>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)', flexWrap: 'wrap' }}>
                <span className={`badge ${student.status === 'ativa' ? 'badge-success' : 'badge-secondary'}`}>
                  {student.status === 'ativa' ? '✓ Ativa' : '— Inativa'}
                </span>
                {age.isValid && (
                  <span className="badge badge-primary">
                    🤰 {age.weeks}ª semana — {age.trimesterLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={handleToggleStatus}>
              <ToggleLeft size={16} />
              {student.status === 'ativa' ? 'Tornar Inativa' : 'Reativar'}
            </button>
            <ClinicalReportButton student={student} records={records} metrics={metrics} age={age} />
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {metrics.hasRecentAlert && (
        <div className="alert-banner alert-banner-danger" style={{ marginBottom: 'var(--space-6)' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Sinal de alerta registrado!</strong>
            {recentAlertTypes.length > 0 && (
              <span style={{ marginLeft: 'var(--space-2)' }}>
                Última sessão: {recentAlertTypes.join(', ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* DPP Editor */}
      <div className="card card-sm" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Calendar size={18} color="var(--color-secondary)" />
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Data Prevista do Parto</span>
          </div>
          {editingDueDate ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <input
                type="date"
                className="form-input"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: 'var(--font-size-sm)' }}
              />
              <button className="btn btn-secondary btn-sm" onClick={handleSaveDueDate}>Salvar</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingDueDate(false)}>Cancelar</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                {student.due_date ? format(parseISO(student.due_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '—'}
              </span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditingDueDate(true)}>
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid-kpi" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="kpi-card">
          <div className="kpi-label">Volume Semanal</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
            <div className="kpi-value">{metrics.weeklyVolume}</div>
            <div className="kpi-unit">/ 150 min</div>
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <div className="progress-bar">
              <div className={`progress-fill ${metrics.acogPercent >= 100 ? 'achieved' : ''}`}
                style={{ width: `${metrics.acogPercent}%` }} />
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
              {metrics.acogPercent}% da meta ACOG
            </span>
          </div>
          <Clock size={36} className="kpi-icon" />
        </div>

        <div className="kpi-card">
          <div className="kpi-label">RPE Médio (7 dias)</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
            <div className="kpi-value">{metrics.avgRPE ?? '—'}</div>
            <div className="kpi-unit">/ 10</div>
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
            sRPE acum.: {metrics.avgLoad} u.a.
          </div>
          <Activity size={36} className="kpi-icon" />
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Hooper Médio</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
            <div className="kpi-value"
              style={{ color: metrics.avgHooper > 20 ? 'var(--color-danger)' : metrics.avgHooper > 14 ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {metrics.avgHooper ?? '—'}
            </div>
            <div className="kpi-unit">/ 28</div>
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
            {metrics.avgHooper <= 14 ? 'Bem-estar bom' : metrics.avgHooper <= 20 ? 'Atenção moderada' : 'Sobrecarga — verificar!'}
          </div>
          <Heart size={36} className="kpi-icon" />
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Monotonia</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
            <div className="kpi-value"
              style={{ color: metrics.monotony > 2 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
              {metrics.monotony || '—'}
            </div>
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
            Strain: {metrics.strain} u.a. | {metrics.monotony > 2 ? '⚠ Muito monótono' : 'Variação adequada'}
          </div>
          <TrendingUp size={36} className="kpi-icon" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid-charts" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="chart-card">
          <div className="chart-title">Volume Semanal vs Meta ACOG (150 min)</div>
          <VolumeBarChart data={metrics.weeklyData} />
        </div>
        <div className="chart-card">
          <div className="chart-title">RPE × sRPE por Semana</div>
          <RPELineChart data={metrics.weeklyData} />
        </div>
      </div>

      {/* Hooper Components */}
      {metrics.hooperComponents && (
        <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="chart-title">Hooper Index — Componentes Médios (7 dias)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
            <HooperIndicator label="Sono" value={metrics.hooperComponents.sleep} />
            <HooperIndicator label="Fadiga" value={metrics.hooperComponents.fatigue} />
            <HooperIndicator label="Estresse" value={metrics.hooperComponents.stress} />
            <HooperIndicator label="Dor Muscular" value={metrics.hooperComponents.musclePain} />
          </div>
          <div style={{
            marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Total Hooper</span>
            <span style={{
              fontWeight: 800, fontSize: 'var(--font-size-lg)',
              color: metrics.avgHooper > 20 ? 'var(--color-danger)' : metrics.avgHooper > 14 ? 'var(--color-warning)' : 'var(--color-success)'
            }}>
              {metrics.avgHooper} / 28
            </span>
          </div>
        </div>
      )}

      {/* Evolução Corporal Section */}
      <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div className="chart-title" style={{ marginBottom: 0 }}>Histórico de Evolução Corporal</div>
          <TrendingUp size={20} color="var(--color-secondary)" />
        </div>
        
        {measurements.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-8)' }}>
            Nenhuma medição registrada para esta aluna.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso</th>
                  <th>Abdômen</th>
                  <th>Quadril</th>
                  <th>Coxas</th>
                  <th>Tórax</th>
                </tr>
              </thead>
              <tbody>
                {measurements.slice(0, 5).map((m, idx) => {
                  const prev = measurements[idx + 1]
                  const getDiff = (cur, old) => {
                    if (!cur || !old) return null
                    const d = (cur - old).toFixed(1)
                    if (d == 0) return null
                    return <span style={{ color: d > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontSize: '10px', marginLeft: '4px', fontWeight: 700 }}>({d > 0 ? '+' : ''}{d})</span>
                  }
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{format(parseISO(m.measured_at), 'dd/MM/yyyy')}</td>
                      <td>{m.weight}kg {getDiff(m.weight, prev?.weight)}</td>
                      <td>{m.circumferences?.abdomen}cm {getDiff(m.circumferences?.abdomen, prev?.circumferences?.abdomen)}</td>
                      <td>{m.circumferences?.hip}cm {getDiff(m.circumferences?.hip, prev?.circumferences?.hip)}</td>
                      <td>{m.circumferences?.thighRight} / {m.circumferences?.thighLeft}</td>
                      <td>{m.circumferences?.thorax}cm</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Records */}
      <div className="card">
        <div className="chart-title">Últimas Sessões</div>
        {records.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Sem registros ainda</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Duração</th>
                  <th>RPE</th>
                  <th>sRPE</th>
                  <th>Hooper</th>
                  <th>Talk Test</th>
                  <th>Alerta</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 15).map(rec => (
                  <tr key={rec.id}>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {format(parseISO(rec.workout_date), 'dd/MM/yyyy')}
                    </td>
                    <td>
                      <span className={`badge ${rec.workout_type === 'Cardio' ? 'badge-secondary' : rec.workout_type === 'Força' ? 'badge-primary' : 'badge-warning'}`}>
                        {rec.workout_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{rec.total_minutes ?? (rec.cardio_minutes + rec.strength_minutes)} min</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: rec.rpe >= 8 ? 'var(--color-danger)' : rec.rpe >= 6 ? 'var(--color-warning)' : 'var(--color-success)'
                      }}>
                        {rec.rpe}
                      </span>
                    </td>
                    <td>{rec.srpe ?? ((rec.cardio_minutes + rec.strength_minutes) * rec.rpe)}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: rec.hooper_total > 20 ? 'var(--color-danger)' : rec.hooper_total > 14 ? 'var(--color-warning)' : 'var(--color-success)'
                      }}>
                        {rec.hooper_total ?? (rec.hooper_sleep + rec.hooper_fatigue + rec.hooper_stress + rec.hooper_muscle_pain)}
                      </span>
                    </td>
                    <td>
                      {rec.talk_test
                        ? <CheckCircle size={16} color="var(--color-success)" />
                        : <XCircle size={16} color="var(--color-danger)" />
                      }
                    </td>
                    <td>
                      <AlertDot active={rec.has_alert} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PersonalLayout>
  )
}
