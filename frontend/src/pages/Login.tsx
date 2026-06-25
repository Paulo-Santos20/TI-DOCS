import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const { addToast } = useToast()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch (error: any) {
      const msg = error?.message || error?.response?.data?.error || 'Credenciais inválidas'
      const isNetworkError = error?.code === 'ERR_NETWORK' || (error?.message && error.message.includes('Network Error'))
      addToast(isNetworkError ? 'Erro de conexão com o servidor' : msg, 'error')
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
            TI DOCS
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Documentos HCP Gestão
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
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

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm pr-10"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn size={18} />
            {loading ? 'Entrando...' : 'Entrar'}
          </motion.button>
          <Link to="/esqueci-senha"
            className="block text-center text-sm mt-4 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--clinical-500)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            Esqueceu sua senha?
          </Link>
        </form>
      </motion.div>
    </div>
  )
}
