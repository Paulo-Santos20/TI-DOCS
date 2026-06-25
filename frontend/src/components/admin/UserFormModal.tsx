import { useState } from 'react'
import { X } from 'lucide-react'
import { useEscape } from '../../hooks/useEscape'

interface UserFormData {
  name: string
  email: string
  password?: string
  role: 'admin' | 'user'
  sectorId: number
}

interface User {
  id: number; name: string; email: string; role: string; sectorId: number; sectorName: string; isActive: boolean
}

interface Sector {
  id: number; name: string
}

interface UserFormModalProps {
  user?: User
  onClose: () => void
  onSave: (data: UserFormData) => void
  sectors: Sector[]
}

export default function UserFormModal({ user, onClose, onSave, sectors }: UserFormModalProps) {
  useEscape(onClose)
  const isEdit = !!user
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: (user?.role as 'admin' | 'user') || 'user',
    sectorId: user?.sectorId ?? (sectors[0]?.id || 0),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.sectorId) return
    if (!isEdit && !form.password) return
    setSubmitting(true)
    try {
      await onSave(form)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <button onClick={onClose} className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Nome</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="glass-input w-full px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="glass-input w-full px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Senha {isEdit && <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(deixe em branco para manter)</span>}
            </label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="glass-input w-full px-3 py-2" required={!isEdit} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Setor</label>
            <select value={form.sectorId} onChange={e => setForm(f => ({ ...f, sectorId: parseInt(e.target.value) }))}
              className="glass-input w-full px-3 py-2">
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Permissão</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'user' }))}
              className="glass-input w-full px-3 py-2">
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? `${isEdit ? 'Salvando' : 'Criando'}...` : (isEdit ? 'Salvar' : 'Criar')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
