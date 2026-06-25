import { useState } from 'react'
import LexicalEditor from '../editor/LexicalEditor'
import api from '../../lib/api'
import { X, FolderOpen } from 'lucide-react'
import { useEscape } from '../../hooks/useEscape'

interface Category { id: number; name: string; parentId: number | null; sectorId: number | null }
interface Sector { id: number; name: string }

interface Doc {
  id: number; title: string; contentJson: any; sectorId: number
  categoryId?: number | null; status: string; contentType?: string; contentUrl?: string
}

interface Props {
  doc: Doc
  sectors: Sector[]
  categories: Category[]
  onSave: (data: { title: string; contentType?: string; contentUrl?: string; contentJson: any; categoryId?: number }) => void
  onClose: () => void
}

export default function EditDocumentModal({ doc, sectors, categories, onSave, onClose }: Props) {
  useEscape(onClose)
  const [submitting, setSubmitting] = useState(false)
  const hasRoot = doc.contentJson?.root
  const initialJson = hasRoot ? doc.contentJson : undefined

  const [form, setForm] = useState({
    title: doc.title,
    categoryId: doc.categoryId || 0,
    contentType: (doc.contentType || 'rich-text') as 'rich-text' | 'pdf' | 'video',
  })
  const [content, setContent] = useState<any>(null)
  const [contentUrl, setContentUrl] = useState(doc.contentUrl || '')
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const sectorCats = categories.filter(c => c.sectorId === null || c.sectorId === doc.sectorId)
  const filteredCats = [...sectorCats].sort((a, b) => {
    if (!a.parentId && b.parentId) return -1
    if (a.parentId && !b.parentId) return 1
    return a.name.localeCompare(b.name)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || form.title.length < 3) return
    const payload: any = {
      title: form.title,
      contentType: form.contentType,
      categoryId: form.categoryId > 0 ? form.categoryId : undefined,
    }
    setSubmitting(true)
    try {
      if (form.contentType === 'rich-text') {
        payload.contentJson = content || doc.contentJson
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
        } else if (contentUrl) {
          payload.contentUrl = contentUrl
        }
      } else if (form.contentType === 'video') {
        payload.contentJson = {}
        payload.contentUrl = contentUrl
      }
      await onSave(payload)
    } finally {
      setSubmitting(false)
    }
  }

  const sectorName = sectors.find(s => s.id === doc.sectorId)?.name || '-'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Editar Documento</h3>
          <button onClick={onClose}
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Título</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="glass-input w-full px-3 py-2" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Setor</label>
              <input type="text" value={sectorName} disabled
                className="glass-input w-full px-3 py-2 opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Pasta</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: parseInt(e.target.value) }))}
                className="glass-input w-full px-3 py-2">
                <option value={0}>Sem pasta</option>
                {filteredCats.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? '    └ ' : <><FolderOpen size={14} className="inline" /> </>}{c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Tipo de Conteúdo</label>
            <div className="flex gap-4 mb-3">
              {(['rich-text', 'pdf', 'video'] as const).map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-sm"
                  style={{ color: 'var(--text-primary)' }}>
                  <input type="radio" name="contentType" value={type}
                    checked={form.contentType === type}
                    onChange={e => setForm(f => ({ ...f, contentType: e.target.value as any }))} />
                  {type === 'rich-text' ? 'Texto Rico' : type === 'pdf' ? 'PDF' : 'Vídeo'}
                </label>
              ))}
            </div>
            {form.contentType === 'rich-text' && (
              <LexicalEditor initialJson={initialJson} onChange={(json) => setContent(json)}
                placeholder="Edite o conteúdo do documento..." />
            )}
            {form.contentType === 'pdf' && (
              <div>
                {doc.contentUrl && (
                  <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>PDF atual:</span>
                    <a href={doc.contentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline"
                      style={{ color: 'var(--clinical-600)' }}>Visualizar</a>
                  </div>
                )}
                <div className="border-2 border-dashed rounded-xl p-8 text-center"
                  style={{ borderColor: 'var(--glass-border-strong)' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Selecione um novo arquivo PDF para substituir</p>
                  <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium"
                    style={{ color: 'var(--text-secondary)' }} />
                </div>
              </div>
            )}
            {form.contentType === 'video' && (
              <input type="url" value={contentUrl} onChange={e => setContentUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="glass-input w-full px-3 py-2 text-sm" />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
