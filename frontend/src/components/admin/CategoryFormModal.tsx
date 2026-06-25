import { useState } from 'react'
import { X, FolderOpen } from 'lucide-react'
import { useEscape } from '../../hooks/useEscape'

interface Category {
  id: number; name: string; description: string | null
  parentId: number | null; sectorId: number | null
}

interface Sector { id: number; name: string }

interface Props {
  categories: Category[]
  sectors: Sector[]
  editing: Category | null
  onSave: (data: { name: string; description?: string; parentId?: number; sectorId?: number }) => void
  onClose: () => void
}

export default function CategoryFormModal({ categories, sectors, editing, onSave, onClose }: Props) {
  useEscape(onClose)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: editing?.name || '',
    description: editing?.description || '',
    parentId: editing?.parentId ?? 0,
    sectorId: editing?.sectorId ?? 0,
  })

  const topLevel = categories.filter(c => !c.parentId && c.id !== editing?.id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return
    setSubmitting(true)
    try {
      await onSave({
        name: form.name,
        description: form.description || undefined,
        parentId: form.parentId > 0 ? form.parentId : undefined,
        sectorId: form.sectorId > 0 ? form.sectorId : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editing ? 'Editar Pasta' : 'Nova Pasta'}
          </h3>
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
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="glass-input w-full px-3 py-2 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Pasta Pai</label>
            <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: parseInt(e.target.value) }))}
              className="glass-input w-full px-3 py-2">
              <option value={0}>Nenhum (pasta raiz)</option>
              {topLevel.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Setor</label>
            <select value={form.sectorId} onChange={e => setForm(f => ({ ...f, sectorId: parseInt(e.target.value) }))}
              className="glass-input w-full px-3 py-2">
              <option value={0}>Global (todos os setores)</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Pastas setoriais só aparecem para usuários do setor correspondente
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? `${editing ? 'Salvando' : 'Criando'}...` : (editing ? 'Salvar' : 'Criar')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
