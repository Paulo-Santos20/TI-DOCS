import { useState } from 'react'

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
  const [form, setForm] = useState({
    name: editing?.name || '',
    description: editing?.description || '',
    parentId: editing?.parentId ?? 0,
    sectorId: editing?.sectorId ?? 0,
  })

  const topLevel = categories.filter(c => !c.parentId && c.id !== editing?.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return
    onSave({
      name: form.name,
      description: form.description || undefined,
      parentId: form.parentId > 0 ? form.parentId : undefined,
      sectorId: form.sectorId > 0 ? form.sectorId : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">
            {editing ? 'Editar Pasta' : 'Nova Pasta'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pasta Pai</label>
            <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none bg-white">
              <option value={0}>Nenhum (pasta raiz)</option>
              {topLevel.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {editing?.sectorId !== undefined && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Setor</label>
              <select value={form.sectorId} onChange={e => setForm(f => ({ ...f, sectorId: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none bg-white">
                <option value={0}>Global (todos os setores)</option>
                {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
