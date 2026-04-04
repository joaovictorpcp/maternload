import React, { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { X, Mail, User, Calendar, Send } from 'lucide-react'

export function InviteStudentModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ full_name: '', email: '', gestationalWeeks: '', gestationalDays: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Calcula a DPP baseada na idade gestacional
      let due_date = null;
      if (form.gestationalWeeks !== '' || form.gestationalDays !== '') {
        const weeks = parseInt(form.gestationalWeeks) || 0;
        const days = parseInt(form.gestationalDays) || 0;
        const totalDays = weeks * 7 + days;
        const daysLeft = 280 - totalDays;
        
        const dpp = new Date();
        dpp.setDate(dpp.getDate() + daysLeft);
        due_date = dpp.toISOString().split('T')[0];
      }

      // Convida via Supabase Admin (Magic Link)
      const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        form.email,
        { data: { full_name: form.full_name, role: 'gestante' } }
      )

      if (inviteError) throw inviteError

      // Atualiza perfil com DPP e nome correto
      if (data?.user?.id) {
        await supabase.from('profiles').update({
          full_name: form.full_name,
          due_date: due_date,
          role: 'gestante',
        }).eq('id', data.user.id)
      }

      onSuccess()
    } catch (err) {
      // Se o usuário já existe, tenta apenas atualizar
      if (err.message?.includes('already been registered')) {
        setError('Este e-mail já está cadastrado no sistema.')
      } else {
        setError(err.message || 'Erro ao enviar convite. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>Adicionar Gestante</h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Um convite será enviado para o e-mail informado.
            </p>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <User size={14} /> Nome Completo
              </span>
            </label>
            <input
              type="text"
              name="full_name"
              className="form-input"
              placeholder="Nome da aluna gestante"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Mail size={14} /> E-mail
              </span>
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Calendar size={14} /> Idade Gestacional Atual (Semanas e Dias)
              </span>
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  name="gestationalWeeks"
                  className="form-input"
                  placeholder="Ex: 20 (Semanas)"
                  min="0"
                  max="42"
                  value={form.gestationalWeeks}
                  onChange={handleChange}
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  name="gestationalDays"
                  className="form-input"
                  placeholder="Ex: 3 (Dias)"
                  min="0"
                  max="6"
                  value={form.gestationalDays}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {(form.gestationalWeeks !== '' || form.gestationalDays !== '') && (
              <span style={{ 
                marginTop: 'var(--space-2)', 
                display: 'block', 
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-primary)' 
              }}>
                ↳ DPP Estimada: {
                  (() => {
                    const weeks = parseInt(form.gestationalWeeks) || 0;
                    const days = parseInt(form.gestationalDays) || 0;
                    const totalDays = weeks * 7 + days;
                    const daysLeft = 280 - totalDays;
                    const dpp = new Date();
                    dpp.setDate(dpp.getDate() + daysLeft);
                    return dpp.toLocaleDateString('pt-BR');
                  })()
                }
              </span>
            )}
            <span className="form-sublabel">Opcional — a Data Prevista do Parto será calculada automaticamente.</span>
          </div>

          {error && (
            <div style={{
              background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
              padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)', fontWeight: 500
            }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Enviando...</>
              ) : (
                <><Send size={16} /> Enviar Convite</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
