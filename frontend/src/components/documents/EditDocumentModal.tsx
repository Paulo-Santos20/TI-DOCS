import { useState } from 'react'

interface Category { id: number; name: string; parentId: number | null; sectorId: number | null }
interface Sector { id: number; name: string }

interface Doc {
  id: number; title: string; contentJson: any; sectorId: number
  categoryId?: number | null; status: string
}

interface Props {
  doc: Doc
  sectors: Sector[]
  categories: Category[]
  onSave: (data: { title: string; contentJson: any; categoryId?: number }) => void
  onClose: () => void
}

export default function EditDocumentModal({ doc, sectors, categories, onSave, onClose }: Props) {
  const currentText = typeof doc.contentJson === 'object' && doc.contentJson?.text
    ? doc.contentJson.text : JSON.stringify(doc.contentJson || {}, null, 2)

  const [form, setForm] = useState({
    title: doc.title,
    contentJson: currentText === '{}' ? '' : currentText,
    categoryId: doc.categoryId || 0,
  })

  const filteredCats = categories.filter(c => c.sectorId === null || c.sectorId === doc.sectorId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || form.title.length < 3) return
    const content = form.contentJson ? { text: form.contentJson } : {}
    onSave({
      title: form.title,
      contentJson: content,
      categoryId: form.categoryId > 0 ? form.categoryId : undefined,
    })
  }

  const sectorName = sectors.find(s => s.id === doc.sectorId)?.name || '-'

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Editar Documento</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Setor</label>
              <input type="text" value={sectorName} disabled
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm outline-none" />
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
            <textarea value={form.contentJson} onChange={e => setForm(f => ({ ...f, contentJson: e.target.value }))}
              rows={10}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none resize-y font-mono text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
