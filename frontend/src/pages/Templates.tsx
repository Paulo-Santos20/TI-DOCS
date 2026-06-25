import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import CreateDocumentModal from '../components/documents/CreateDocumentModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useEscape } from '../hooks/useEscape'
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react'

interface Template { id: number; title: string; contentJson: any; sectorId: number; createdAt: string }

export default function Templates() {
  const { addToast } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Template | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)

  useEscape(() => setShowCreate(false), showCreate)
  useEscape(() => setEditing(null), !!editing)

  const loadTemplates = () => {
    setLoading(true)
    api.get('/templates').then(({ data }) => {
      setTemplates(data)
    }).catch(() => addToast('Erro ao carregar modelos', 'error')).finally(() => setLoading(false))
  }

  useEffect(() => { loadTemplates() }, [])

  const createFromTemplate = (t: Template) => {
    navigate('/documentos', { state: { fromTemplate: t } })
  }

  const handleCreate = async (data: any) => {
    try {
      await api.post('/templates', data)
      addToast('Modelo criado com sucesso', 'success')
      setShowCreate(false)
      loadTemplates()
    } catch { addToast('Erro ao criar modelo', 'error') }
  }

  const handleEdit = async (data: any) => {
    if (!editing) return
    try {
      await api.put(`/templates/${editing.id}`, data)
      addToast('Modelo atualizado com sucesso', 'success')
      setEditing(null)
      loadTemplates()
    } catch { addToast('Erro ao atualizar modelo', 'error') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/templates/${deleteTarget.id}`)
      addToast('Modelo excluído', 'success')
      loadTemplates()
    } catch { addToast('Erro ao excluir modelo', 'error') }
    setDeleteTarget(null)
  }

  const [sectors, setSectors] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    if (showCreate || editing) {
      api.get('/sectors').then(({ data }) => setSectors(data)).catch(() => {})
      api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {})
    }
  }, [showCreate, editing])

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Modelos de Documento</h1>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} />
            Novo Modelo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl animate-shimmer" style={{ background: 'var(--glass-clear)' }} />
        )) : templates.map(t => (
          <div key={t.id} className="card transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-start gap-3 mb-3 cursor-pointer" onClick={() => createFromTemplate(t)}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--clinical-50)' }}>
                <FileText size={20} style={{ color: 'var(--clinical-500)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t.title}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Criado em {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
              {t.contentJson?.text ? t.contentJson.text.slice(0, 100) : 'Sem conteúdo'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => createFromTemplate(t)}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'var(--clinical-50)', color: 'var(--clinical-600)' }}>
                Usar Modelo
              </button>
              {isAdmin && (
                <>
                  <button onClick={() => setEditing(t)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'var(--glass-clear)', color: 'var(--text-secondary)' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(t)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'var(--glass-clear)', color: 'var(--red-500)' }}>
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <p className="mb-3">Nenhum modelo disponível</p>
            {isAdmin && (
              <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-2 mx-auto">
                <Plus size={16} />
                Criar primeiro modelo
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir modelo"
        message={deleteTarget ? `Excluir o modelo "${deleteTarget.title}"?` : ''}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-elevated rounded-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Novo Modelo</h3>
              <button onClick={() => setShowCreate(false)}
                className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <TemplateForm sectors={sectors} onSave={handleCreate} onClose={() => setShowCreate(false)} />
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-elevated rounded-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Editar Modelo</h3>
              <button onClick={() => setEditing(null)}
                className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <TemplateForm
              sectors={sectors}
              initial={{ title: editing.title, sectorId: editing.sectorId }}
              onSave={handleEdit}
              onClose={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateForm({ sectors, initial, onSave, onClose }: {
  sectors: any[]
  initial?: { title: string; sectorId: number }
  onSave: (data: any) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(initial?.title || '')
  const [sectorId, setSectorId] = useState(initial?.sectorId || sectors[0]?.id || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || title.length < 3) return
    onSave({ title, sectorId, contentJson: {} })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Título</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          className="glass-input w-full px-3 py-2"
          placeholder="Ex: POP-023: Curativos Especiais" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Setor</label>
        <select value={sectorId} onChange={e => setSectorId(parseInt(e.target.value))}
          className="glass-input w-full px-3 py-2">
          {sectors.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" className="btn-primary flex-1">Salvar</button>
      </div>
    </form>
  )
}