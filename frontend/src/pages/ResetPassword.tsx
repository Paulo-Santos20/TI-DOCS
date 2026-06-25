import { useState, FormEvent } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      addToast('Senha deve ter no mínimo 6 caracteres', 'error')
      return
    }
    if (password !== confirm) {
      addToast('Senhas não conferem', 'error')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Erro ao redefinir senha', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-elevated rounded-3xl p-8 w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Link inválido</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            O link de redefinição de senha está incompleto ou inválido.
          </p>
          <Link to="/login" className="btn-primary w-full inline-block text-center">Voltar</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-elevated rounded-3xl p-8 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 glass-strong">
            <img src="/logo.webp" alt="TI DOCS" className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {done ? 'Senha redefinida' : 'Nova senha'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {done ? 'Sua senha foi alterada com sucesso' : 'Digite sua nova senha'}
          </p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'var(--clinical-50)' }}>
              <CheckCircle size={32} style={{ color: 'var(--clinical-500)' }} />
            </div>
            <button onClick={() => navigate('/login')} className="btn-primary w-full">
              Fazer login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Nova senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 text-sm pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                  tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Confirmar senha
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm"
                placeholder="Repita a senha"
                required
                autoComplete="new-password"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Salvando...' : 'Redefinir senha'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  )
}