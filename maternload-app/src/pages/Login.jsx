import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Heart, FlaskConical } from 'lucide-react'

export function Login() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      navigate('/')
    }
  }, [profile, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'E-mail ou senha inválidos.'
        : err.message || 'Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 40%, var(--color-secondary-dark) 100%)',
      padding: 'var(--space-5)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px',
        borderRadius: '50%', background: 'rgba(91,196,168,0.08)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-30%', left: '-15%', width: '700px', height: '700px',
        borderRadius: '50%', background: 'rgba(91,196,168,0.05)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
            borderRadius: 'var(--radius-xl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-5)',
            boxShadow: '0 12px 40px rgba(91, 196, 168, 0.4)',
          }}>
            <Heart size={32} color="white" fill="white" />
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)', fontWeight: 900,
            color: 'white', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em'
          }}>
            MaternLoad
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--font-size-sm)' }}>
            Monitoramento de carga para gestantes
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-lg)', fontWeight: 700,
            color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)'
          }}>
            Entrar no sistema
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {error && (
                <span className="form-error">⚠ {error}</span>
              )}
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-secondary btn-lg btn-full"
              disabled={loading}
              style={{ marginTop: 'var(--space-2)' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 'var(--space-6)',
            fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)'
          }}>
            Acesso restrito. Para obter acesso, entre em contato com seu personal trainer.
          </p>
        </div>
      </div>
    </div>
  )
}
