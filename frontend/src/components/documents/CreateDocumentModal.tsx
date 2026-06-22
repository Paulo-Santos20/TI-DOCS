import { useState } from 'react'
import LexicalEditor from '../editor/LexicalEditor'

interface Sector { id: number; name: string }
interface Category { id: number; name: string; parentId: number | null; sectorId: number | null }

interface Props {
  sectors: Sector[]
  categories: Category[]
  onSave: (data: { title: string; contentJson: any; sectorId: number; categoryId?: number }) => void
  onClose: () => void
}

export default function CreateDocumentModal({ sectors, categories, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    title: '',
    sectorId: sectors[0]?.id || 0,
    categoryId: 0,
  })
  const [content, setContent] = useState<any>(null)

  const filteredCats = categories.filter(c => !c.parentId || categories.some(p => p.id === c.parentId))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || form.title.length < 3) return
    onSave({
      title: form.title,
      contentJson: content || {},
      sectorId: form.sectorId,
      categoryId: form.categoryId > 0 ? form.categoryId : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Novo Documento</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none"
              placeholder="Ex: POP-023: Curativos Especiais" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Setor</label>
              <select value={form.sectorId} onChange={e => setForm(f => ({ ...f, sectorId: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none bg-white">
                {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pasta</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none bg-white">
                <option value={0}>Sem pasta</option>
                {filteredCats.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? '  └ ' : '📁 '}{c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo</label>
            <LexicalEditor onChange={(json) => setContent(json)} placeholder="Digite o conteúdo do documento..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Criar Documento</button>
          </div>
        </form>
      </div>
    </div>
  )
}
