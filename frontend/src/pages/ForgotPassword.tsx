import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Erro ao solicitar redefinição de senha', 'error')
    } finally {
      setLoading(false)
    }
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
          <div className="w-34 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 glass-strong">
            <img src="/logo.webp" alt="TI DOCS" className="w-26 h-16" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Redefinir senha
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {sent ? 'Verifique seu email' : 'Digite seu email para receber o link'}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'var(--clinical-50)' }}>
              <Mail size={32} style={{ color: 'var(--clinical-500)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Enviamos um link de redefinição para <strong>{email}</strong>.
              Verifique sua caixa de entrada e spam.
            </p>
            <button onClick={() => navigate('/login')} className="btn-primary w-full">
              Voltar para o login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm"
                placeholder="seuemail@hcpgestao.org.br"
                required
                autoComplete="email"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </motion.button>

            <Link to="/login"
              className="flex items-center justify-center gap-1 text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--clinical-500)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <ArrowLeft size={14} />
              Voltar para o login
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  )
}