import React, { useState } from 'react'
import { StudentLayout } from '../../components/layout/StudentLayout'
import { useAuth } from '../../contexts/AuthContext'
import { updateStudentInfo } from '../../services/supabase'
import { Save, User, Ruler, FileText, Calendar } from 'lucide-react'

export function StudentSettings() {
  const { profile, refreshProfile } = useAuth()
  
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    birth_date: profile?.birth_date || '',
    due_date: profile?.due_date || '',
    weight: profile?.weight || '',
    height: profile?.height || '',
    circumferences: profile?.circumferences || {
      abdomen: '',
      hip: '',
      thigh: '',
      thorax: ''
    }
  })
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleCircumferenceChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      circumferences: {
        ...prev.circumferences,
        [key]: value
      }
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await updateStudentInfo(profile.id, {
        full_name: form.full_name,
        birth_date: form.birth_date || null,
        due_date: form.due_date || null,
        weight: form.weight ? Number(form.weight) : null,
        height: form.height ? Number(form.height) : null,
        circumferences: form.circumferences
      })
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
    <StudentLayout>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: 'var(--font-size-xl)' }}>Meu Perfil</h1>
            <p className="page-subtitle" style={{ color: 'var(--color-text-muted)' }}>Mantenha seus dados e medidas atualizados.</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          
          {/* Dados Pessoais */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <User size={18} color="var(--color-secondary)" />
              Dados Pessoais
            </div>
            
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Calendar size={14} /> Nasc. (Idade)
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.birth_date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(p => ({ ...p, birth_date: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Calendar size={14} /> Data Prevista (DPP)
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.due_date}
                    onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medidas Corporais */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Ruler size={18} color="var(--color-secondary)" />
              Medidas Corporais
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Peso Atual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="200"
                  className="form-input"
                  placeholder="Ex: 65.5"
                  value={form.weight}
                  onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Altura (m)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  max="2.50"
                  className="form-input"
                  placeholder="Ex: 1.65"
                  value={form.height}
                  onChange={e => setForm(p => ({ ...p, height: e.target.value }))}
                />
              </div>
            </div>

            <label className="form-label" style={{ marginBottom: 'var(--space-3)' }}>Circunferências (cm)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Tórax"
                  value={form.circumferences?.thorax || ''}
                  onChange={e => handleCircumferenceChange('thorax', e.target.value)}
                />
                <span className="form-sublabel">Tórax</span>
              </div>
              
              <div className="form-group">
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Abdômen"
                  value={form.circumferences?.abdomen || ''}
                  onChange={e => handleCircumferenceChange('abdomen', e.target.value)}
                />
                <span className="form-sublabel">Abdômen</span>
              </div>

              <div className="form-group">
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Quadril"
                  value={form.circumferences?.hip || ''}
                  onChange={e => handleCircumferenceChange('hip', e.target.value)}
                />
                <span className="form-sublabel">Quadril</span>
              </div>

              <div className="form-group">
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Coxa"
                  value={form.circumferences?.thigh || ''}
                  onChange={e => handleCircumferenceChange('thigh', e.target.value)}
                />
                <span className="form-sublabel">Coxa</span>
              </div>
            </div>
            
            <p className="form-sublabel" style={{ marginTop: 'var(--space-4)' }}>
              Essas informações aparecerão no laudo impresso do seu treinador.
            </p>
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
              ✓ Perfil atualizado com sucesso!
            </div>
          )}

          <button type="submit" className="btn btn-secondary btn-lg btn-full" disabled={saving}>
            {saving ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Salvando...</>
            ) : (
              <><Save size={18} /> Salvar Alterações</>
            )}
          </button>
          
          <div style={{ height: 'var(--space-4)' }} />
        </form>
      </div>
    </StudentLayout>
  )
}
