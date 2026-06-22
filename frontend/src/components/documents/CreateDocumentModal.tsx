import { useState } from 'react'
import LexicalEditor from '../editor/LexicalEditor'
import api from '../../lib/api'

interface Sector { id: number; name: string }
interface Category { id: number; name: string; parentId: number | null; sectorId: number | null }

interface Props {
  sectors: Sector[]
  categories: Category[]
  onSave: (data: { title: string; contentJson: any; contentType?: string; contentUrl?: string; sectorId: number; categoryId?: number }) => void
  onClose: () => void
}

export default function CreateDocumentModal({ sectors, categories, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    title: '',
    sectorId: sectors[0]?.id || 0,
    categoryId: 0,
    contentType: 'rich-text' as 'rich-text' | 'pdf' | 'video',
  })
  const [content, setContent] = useState<any>(null)
  const [contentUrl, setContentUrl] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const flat = categories.filter(c => !c.parentId || categories.some(p => p.id === c.parentId))
  const filteredCats = [...flat].sort((a, b) => {
    if (!a.parentId && b.parentId) return -1
    if (a.parentId && !b.parentId) return 1
    return a.name.localeCompare(b.name)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || form.title.length < 3) return

    let payload: any = {
      title: form.title,
      contentType: form.contentType,
      sectorId: form.sectorId,
      categoryId: form.categoryId > 0 ? form.categoryId : undefined,
    }

    if (form.contentType === 'rich-text') {
      payload.contentJson = content || {}
    } else if (form.contentType === 'pdf') {
      payload.contentJson = {}
      if (pdfFile) {
        const fd = new FormData()
        fd.append('file', pdfFile)
        try {
          const { data: uploadResult } = await api.post('/files/upload', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          payload.contentUrl = uploadResult.url
        } catch {
          alert('Erro ao enviar PDF')
          return
        }
      }
    } else if (form.contentType === 'video') {
      payload.contentJson = {}
      payload.contentUrl = contentUrl
    }

    onSave(payload)
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
                    {c.parentId ? '    └ ' : '📁 '}{c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Conteúdo</label>
            <div className="flex gap-4 mb-3">
              {(['rich-text', 'pdf', 'video'] as const).map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input type="radio" name="contentType" value={type}
                    checked={form.contentType === type}
                    onChange={e => setForm(f => ({ ...f, contentType: e.target.value as any }))} />
                  {type === 'rich-text' ? 'Texto Rico' : type === 'pdf' ? 'PDF' : 'Vídeo'}
                </label>
              ))}
            </div>
            {form.contentType === 'rich-text' && (
              <LexicalEditor onChange={(json) => setContent(json)} placeholder="Digite o conteúdo do documento..." />
            )}
            {form.contentType === 'pdf' && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                <p className="text-sm text-slate-400 mb-2">Selecione o arquivo PDF</p>
                <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-clinical-50 file:text-clinical-600 hover:file:bg-clinical-100" />
              </div>
            )}
            {form.contentType === 'video' && (
              <input type="url" value={contentUrl} onChange={e => setContentUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none text-sm" />
            )}
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
