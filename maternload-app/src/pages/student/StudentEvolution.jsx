import React, { useEffect, useState } from 'react'
import { StudentLayout } from '../../components/layout/StudentLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getBodyMeasurements } from '../../services/supabase'
import { TrendingUp, Scale, Ruler, Calendar, History } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function StudentEvolution() {
  const { profile } = useAuth()
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      loadMeasurements()
    }
  }, [profile?.id])

  const loadMeasurements = async () => {
    try {
      const data = await getBodyMeasurements(profile.id)
      setMeasurements(data || [])
    } catch (err) {
      console.error('Erro ao carregar medidas:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </StudentLayout>
    )
  }

  const firstEntry = measurements[measurements.length - 1]
  const latestEntry = measurements[0]

  const calculateDelta = (key, current, first) => {
    if (!current || !first) return null
    const diff = (current - first).toFixed(1)
    const color = diff > 0 ? 'var(--color-danger)' : diff < 0 ? 'var(--color-success)' : 'var(--color-text-muted)'
    return { diff, color, prefix: diff > 0 ? '+' : '' }
  }

  const weightDelta = calculateDelta('weight', latestEntry?.weight, firstEntry?.weight)

  return (
    <StudentLayout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: 'var(--font-size-xl)' }}>Evolução Corporal</h1>
            <p className="page-subtitle" style={{ color: 'var(--color-text-muted)' }}>Acompanhe suas mudanças físicas durante a gestação.</p>
          </div>
        </div>

        {measurements.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>⚖️</div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Nenhuma medida registrada</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Atualize seu peso e circunferências na aba <strong>Perfil</strong> para começar a ver sua evolução aqui.
            </p>
          </div>
        ) : (
          <>
            {/* Resumo de Ganho */}
            <div className="grid-kpi" style={{ marginBottom: 'var(--space-8)' }}>
              <div className="kpi-card">
                <div className="kpi-label">Peso Inicial</div>
                <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>
                  {firstEntry?.weight || '—'} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>kg</span>
                </div>
                <Scale size={32} className="kpi-icon" />
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Peso Atual</div>
                <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>
                  {latestEntry?.weight || '—'} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>kg</span>
                </div>
                <TrendingUp size={32} className="kpi-icon" />
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Variação Total</div>
                <div className="kpi-value" style={{ 
                  fontSize: 'var(--font-size-2xl)',
                  color: weightDelta?.color || 'inherit'
                }}>
                  {weightDelta ? `${weightDelta.prefix}${weightDelta.diff}` : '0'} 
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}> kg</span>
                </div>
                <History size={32} className="kpi-icon" />
              </div>
            </div>

            {/* Histórico Detalhado */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', fontWeight: 700 }}>
                <History size={18} color="var(--color-secondary)" />
                Histórico de Medidas
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data / Semana</th>
                      <th>Peso</th>
                      <th>Abdômen</th>
                      <th>Quadril</th>
                      <th>Coxas (D/E)</th>
                      <th>Tórax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m, idx) => {
                      const prev = measurements[idx + 1]
                      const getCellDelta = (val, prevVal) => {
                        if (!val || !prevVal) return null
                        const d = (val - prevVal).toFixed(1)
                        if (d == 0) return null
                        return (
                          <span style={{ 
                            fontSize: '10px', 
                            marginLeft: '4px',
                            color: d > 0 ? 'var(--color-danger)' : 'var(--color-success)',
                            fontWeight: 700
                          }}>
                            {d > 0 ? '+' : ''}{d}
                          </span>
                        )
                      }

                      return (
                        <tr key={m.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 700 }}>{format(parseISO(m.measured_at), 'dd/MM/yyyy')}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 600 }}>
                              {m.gestational_weeks}ª sem. {m.gestational_days > 0 ? `+${m.gestational_days}d` : ''}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700 }}>{m.weight || '—'}</span>
                            {getCellDelta(m.weight, prev?.weight)}
                          </td>
                          <td>
                            {m.circumferences?.abdomen || '—'}
                            {getCellDelta(m.circumferences?.abdomen, prev?.circumferences?.abdomen)}
                          </td>
                          <td>
                            {m.circumferences?.hip || '—'}
                            {getCellDelta(m.circumferences?.hip, prev?.circumferences?.hip)}
                          </td>
                          <td>
                            {m.circumferences?.thighRight || '—'} / {m.circumferences?.thighLeft || '—'}
                          </td>
                          <td>
                            {m.circumferences?.thorax || '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .data-table td { padding: var(--space-4) var(--space-3); }
        .data-table th { padding: var(--space-3); font-size: 11px; }
      `}} />
    </StudentLayout>
  )
}
