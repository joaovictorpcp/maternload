import React, { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { X, Mail, User, Calendar, Send } from 'lucide-react'

export function InviteStudentModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ full_name: '', email: '', due_date: '' })
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
          due_date: form.due_date || null,
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
                <Calendar size={14} /> Data Prevista do Parto (DPP)
              </span>
            </label>
            <input
              type="date"
              name="due_date"
              className="form-input"
              value={form.due_date}
              onChange={handleChange}
            />
            <span className="form-sublabel">Opcional — pode ser adicionada depois no perfil da aluna.</span>
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
