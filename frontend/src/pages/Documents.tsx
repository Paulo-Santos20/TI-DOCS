import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import CreateDocumentModal from '../components/documents/CreateDocumentModal'
import { Folder, FolderOpen, FileText, Video, File, Plus, X, Menu } from 'lucide-react'

interface Doc { id: number; title: string; status: string; version: number; sectorName: string; categoryId?: number | null; categoryName?: string | null; contentType: string; updatedAt: string }
interface Category { id: number; name: string; parentId: number | null; sectorId: number | null }
interface Sector { id: number; name: string }

const contentTypeIcons: Record<string, React.ReactNode> = {
  pdf: <File size={16} className="text-red-500" />,
  video: <Video size={16} className="text-blue-500" />,
  'rich-text': <FileText size={16} className="text-slate-400" />,
}

export default function Documents() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [docs, setDocs] = useState<Doc[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    api.get('/documents', { params: { categoryId: selectedCategory } })
      .then(({ data }) => setDocs(data.data)).catch(() => addToast('Erro ao carregar documentos', 'error'))
  }, [selectedCategory])

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {})
  }, [])
  useEffect(() => {
    api.get('/sectors').then(({ data }) => setSectors(data)).catch(() => {})
  }, [])

  const treeCats = useMemo(() => categories.filter(c => !c.parentId), [categories])
  const childCats = useMemo(() => (parentId: number) => categories.filter(c => c.parentId === parentId), [categories])
  const currentCategoryName = useMemo(() => selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name
    : null, [selectedCategory, categories])

  const handleCreateDoc = async (data: { title: string; contentJson: any; contentType?: string; contentUrl?: string; sectorId: number; categoryId?: number }) => {
    try {
      const payload: any = { title: data.title, contentJson: data.contentJson, contentType: data.contentType || 'rich-text', sectorId: data.sectorId }
      if (data.contentUrl) payload.contentUrl = data.contentUrl
      if (data.categoryId) payload.categoryId = data.categoryId
      await api.post('/documents', payload)
      addToast('Documento criado com sucesso', 'success')
      setShowCreateModal(false)
      const { data: refreshed } = await api.get('/documents', { params: { categoryId: selectedCategory } })
      setDocs(refreshed.data)
    } catch (e: any) {
      addToast(e.response?.data?.error || 'Erro ao criar documento', 'error')
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl transition-colors glass-clear">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Documentos</h1>
            {currentCategoryName && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Pasta: {currentCategoryName}</p>
            )}
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} />
            Novo Documento
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {sidebarOpen && (
          <div className="w-64 shrink-0">
            <div className="card p-3 sticky top-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Pastas
                </span>
                <button onClick={() => setSelectedCategory(undefined)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-clinical-50 text-clinical-600 font-medium' : ''
                  }`}
                  style={{ color: selectedCategory ? 'var(--text-muted)' : undefined }}>
                  Todas
                </button>
              </div>

              {treeCats.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  {isAdmin ? 'Crie pastas em Admin > Categorias' : 'Nenhuma pasta disponível'}
                </p>
              ) : (
                <div className="space-y-0.5">
                  {treeCats.map(cat => (
                    <div key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.id === selectedCategory ? undefined : cat.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors text-left ${
                          selectedCategory === cat.id
                            ? 'bg-clinical-50 text-clinical-700 font-medium'
                            : ''
                        }`}
                        style={{ color: selectedCategory === cat.id ? undefined : 'var(--text-secondary)' }}
                        onMouseEnter={e => {
                          if (selectedCategory !== cat.id) e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 40%, transparent)'
                        }}
                        onMouseLeave={e => {
                          if (selectedCategory !== cat.id) e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <FolderOpen size={16} className="shrink-0" style={{ color: 'var(--clinical-500)' }} />
                        <span className="truncate">{cat.name}</span>
                      </button>
                      {selectedCategory === cat.id && childCats(cat.id).map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedCategory(sub.id)}
                          className={`w-full flex items-center gap-2 pl-10 pr-3 py-1.5 text-sm rounded-xl transition-colors text-left ${
                            selectedCategory === sub.id
                              ? 'bg-clinical-50 text-clinical-700 font-medium'
                              : ''
                          }`}
                          style={{ color: selectedCategory === sub.id ? undefined : 'var(--text-secondary)' }}
                          onMouseEnter={e => {
                            if (selectedCategory !== sub.id) e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 40%, transparent)'
                          }}
                          onMouseLeave={e => {
                            if (selectedCategory !== sub.id) e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Folder size={16} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
                          <span className="truncate">{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="card p-0 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--glass-border-strong)' }}>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Título</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Pasta</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Setor</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Versão</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc.id} className="border-b cursor-pointer transition-colors"
                    style={{ borderColor: 'var(--glass-border-strong)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-100)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    onClick={() => navigate(`/documentos/${doc.id}`)}>
                    <td className="px-6 py-4 text-sm font-medium flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}>
                      <span title={
                        doc.contentType === 'pdf' ? 'PDF' :
                        doc.contentType === 'video' ? 'Vídeo' : 'Texto'
                      }>
                        {contentTypeIcons[doc.contentType] || <FileText size={16} />}
                      </span>
                      {doc.title}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{doc.categoryName || '—'}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{doc.sectorName}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>v{doc.version}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        doc.status === 'published' ? 'bg-health-50 text-health-600'
                        : doc.status === 'archived' ? 'bg-slate-100'
                        : 'bg-amber-50 text-amber-600'
                      }`} style={{ color: doc.status === 'archived' ? 'var(--text-muted)' : undefined }}>
                        {doc.status === 'published' ? 'Publicado' : doc.status === 'archived' ? 'Arquivado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center">
                    <p style={{ color: 'var(--text-muted)' }}>
                      {selectedCategory ? 'Nenhum documento nesta pasta' : 'Nenhum documento encontrado'}
                    </p>
                    {isAdmin && !selectedCategory && (
                      <button onClick={() => setShowCreateModal(true)}
                        className="text-sm mt-2 hover:underline"
                        style={{ color: 'var(--clinical-600)' }}>
                        Criar primeiro documento
                      </button>
                    )}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateDocumentModal
          sectors={sectors}
          categories={categories}
          onSave={handleCreateDoc}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
