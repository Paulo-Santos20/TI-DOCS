import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const { addToast } = useToast()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch {
      addToast('Credenciais inválidas', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-health-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
                    

          <div className="w-34 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"><img src="/logo.webp" alt="TI DOCS" className="w-26 h-8" /></div>
          <h1 className="text-3xl font-bold text-slate-800">TI DOCS</h1>
          <p className="text-slate-500 mt-2">Documentos HCP Gestão</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none transition-all"
              placeholder="seuemail@hcpgestao.org.br" required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none transition-all"
              placeholder="••••••••" required
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
