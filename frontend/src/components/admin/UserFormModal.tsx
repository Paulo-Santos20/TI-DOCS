import { useState } from 'react'

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
  const isEdit = !!user
  const [form, setForm] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: (user?.role as 'admin' | 'user') || 'user',
    sectorId: user?.sectorId ?? (sectors[0]?.id || 0),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.sectorId) return
    if (!isEdit && !form.password) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha {isEdit && <span className="text-slate-400 font-normal">(deixe em branco para manter)</span>}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none"
              required={!isEdit} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Setor</label>
            <select value={form.sectorId} onChange={e => setForm(f => ({ ...f, sectorId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none bg-white">
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Permissão</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'user' }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none bg-white">
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">{isEdit ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
