import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Eye, EyeOff } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarFile, setAvatarFile] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const avatarSrc = avatarFile || user?.avatarUrl || null

  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: user.name, email: user.email }))
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setAvatarFile(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage('Senhas não conferem'); return
    }
    setSaving(true)
    setMessage('')
    try {
      await api.put('/profile', {
        name: form.name,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      })
      updateUser({ name: form.name })
      setMessage('Perfil atualizado com sucesso!')
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Meu Perfil</h1>

      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => fileRef.current?.click()} className="relative group shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: 'var(--clinical-500)' }}>
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
              Alterar
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Nome</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="glass-input w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input type="email" value={form.email} disabled
              className="glass-input w-full px-3 py-2 opacity-60 cursor-not-allowed" />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email não pode ser alterado pelo perfil. Solicite ao administrador.</p>
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />
          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Alterar Senha</h3>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Senha Atual</label>
            <div className="relative">
              <input type={showCurrentPassword ? 'text' : 'password'}
                value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                className="glass-input w-full px-3 py-2 pr-10"
                autoComplete="current-password" />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" tabIndex={-1}
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Nova Senha</label>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'}
                  value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="glass-input w-full px-3 py-2 pr-10"
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" tabIndex={-1}
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Confirmar Senha</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="glass-input w-full px-3 py-2 pr-10"
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" tabIndex={-1}
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('sucesso') ? 'text-health-600' : 'text-red-500'}`}>{message}</p>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
