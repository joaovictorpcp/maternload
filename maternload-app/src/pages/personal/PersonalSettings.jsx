import React, { useState } from 'react'
import { PersonalLayout } from '../../components/layout/PersonalLayout'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfile } from '../../services/supabase'
import { Save, User, FileText } from 'lucide-react'

export function PersonalSettings() {
  const { profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || 'João Victor Pinheiro Coelho Pedrosa',
    cref: profile?.cref || '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await updateProfile(profile.id, { full_name: form.full_name, cref: form.cref })
      await refreshProfile()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PersonalLayout>
      <div style={{ maxWidth: 640 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Configurações</h1>
            <p className="page-subtitle">Gerencie seus dados profissionais</p>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <User size={18} color="var(--color-secondary)" />
            Dados Profissionais
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">Nome Completo</label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                required
              />
              <span className="form-sublabel">Aparece no cabeçalho do Laudo Clínico PDF.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-cref">
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <FileText size={14} /> Número CREF
                </span>
              </label>
              <input
                id="settings-cref"
                type="text"
                className="form-input"
                value={form.cref}
                onChange={e => setForm(p => ({ ...p, cref: e.target.value }))}
                placeholder="Ex: 123456-G/XX"
              />
              <span className="form-sublabel">Aparece no rodapé do laudo como assinatura profissional.</span>
            </div>

            {error && (
              <div style={{
                background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
                padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: 'var(--color-success-bg)', color: 'var(--color-success)',
                padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)', fontWeight: 600
              }}>
                ✓ Dados salvos com sucesso!
              </div>
            )}

            <button type="submit" className="btn btn-secondary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Salvando...</>
              ) : (
                <><Save size={16} /> Salvar Alterações</>
              )}
            </button>
          </form>
        </div>

        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)' }}>
            ℹ️ Sobre o MaternLoad
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            Sistema desenvolvido para Personal Trainers especializados em treinamento de gestantes.
            Baseado nas diretrizes do <strong>ACOG</strong> (American College of Obstetricians and Gynecologists)
            e metodologias de controle de carga como <strong>EXOS</strong> e <strong>FMS/Gray Cook</strong>.
          </p>
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            <strong>Métricas calculadas:</strong> sRPE (Carga Interna) = Tempo Total × RPE | Meta ACOG = 150 min/semana |
            Monotonia = Média sRPE ÷ Desvio Padrão | Strain = Carga Média × Nº de Sessões
          </div>
        </div>
      </div>
    </PersonalLayout>
  )
}
