import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonalLayout } from '../../components/layout/PersonalLayout'
import { useAuth } from '../../contexts/AuthContext'
import { DEMO_STUDENTS, DEMO_RECORDS_MAP } from '../../mockData'
import { ClinicalReportButton } from '../../components/pdf/ClinicalReportButton'
import { useMetrics } from '../../hooks/useMetrics'
import { useGestationalAge } from '../../hooks/useGestationalAge'
import { FileText, ExternalLink } from 'lucide-react'

function StudentReportRow({ student }) {
  const records = DEMO_RECORDS_MAP[student.id] || []
  const metrics = useMetrics(records)
  const age = useGestationalAge(student.due_date)
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
      padding: 'var(--space-4)', background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-light)',
      boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap'
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontSize: 'var(--font-size-base)'
      }}>
        {student.full_name.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700 }}>{student.full_name}</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {age.isValid ? `${age.weeks}ª semana` : '—'} · {records.length} sessões · {metrics.weeklyVolume} min esta semana
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/personal/student/${student.id}`)}>
          <ExternalLink size={14} /> Ver Dashboard
        </button>
        <ClinicalReportButton student={student} records={records} metrics={metrics} age={age} />
      </div>
    </div>
  )
}

export function PersonalReports() {
  const { isDemo } = useAuth()
  const students = isDemo ? DEMO_STUDENTS : []

  return (
    <PersonalLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Gere o Laudo Clínico PDF para cada gestante</p>
        </div>
      </div>

      {!isDemo && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>
          <FileText size={40} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
          <p>Configure o Supabase para ver as gestantes ativas aqui.</p>
        </div>
      )}

      {isDemo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{
            padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
            background: 'rgba(46,139,122,0.08)', fontSize: 'var(--font-size-sm)',
            color: 'var(--color-secondary)', fontWeight: 500, marginBottom: 'var(--space-2)'
          }}>
            💡 No modo demo, o PDF é gerado com dados fictícios reais — você pode baixar e ver o layout do laudo.
          </div>
          {students.map(s => <StudentReportRow key={s.id} student={s} />)}
        </div>
      )}
    </PersonalLayout>
  )
}
