import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarFile, setAvatarFile] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
        email: form.email,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      })
      updateUser({ name: form.name, email: form.email })
      setMessage('Perfil atualizado com sucesso!')
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Meu Perfil</h1>

      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => fileRef.current?.click()} className="relative group shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-clinical-500 flex items-center justify-center text-white text-2xl font-bold">
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
              className="w-full px-3 py-2 rounded-xl border outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />
          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Alterar Senha</h3>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Senha Atual</label>
            <input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Nova Senha</label>
              <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Confirmar Senha</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
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
