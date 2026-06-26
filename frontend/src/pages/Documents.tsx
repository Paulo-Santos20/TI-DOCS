import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import CreateDocumentModal from '../components/documents/CreateDocumentModal'
import CreateTrilhaModal from '../components/documents/CreateTrilhaModal'
import {
  Folder, FolderOpen, FileText, Video, File, Plus, X, Menu, Search,
  LayoutGrid, List, Calendar, Clock, ImageIcon, BookMarked,
} from 'lucide-react'

interface Doc {
  id: number; title: string; status: string; version: number
  sectorName: string; categoryId?: number | null; categoryName?: string | null
  contentType: string; imageUrl?: string | null; summary?: string | null
  authorName?: string; createdAt: string; updatedAt: string
}
interface Category { id: number; name: string; description?: string | null; parentId: number | null; sectorId: number | null }
interface Sector { id: number; name: string }
interface Trilha extends Category { documents: Doc[]; children: (Category & { documents: Doc[] })[] }

const contentTypeIcons: Record<string, React.ReactNode> = {
  pdf: <File size={16} className="text-red-500" />,
  video: <Video size={16} className="text-blue-500" />,
  'rich-text': <FileText size={16} className="text-slate-400" />,
}
const contentTypeIconLarge: Record<string, React.ReactNode> = {
  pdf: <File size={24} className="text-red-500" />,
  video: <Video size={24} className="text-blue-500" />,
  'rich-text': <FileText size={24} className="text-slate-400" />,
}

export default function Documents() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [trilhas, setTrilhas] = useState<Trilha[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set())
  const [activeCat, setActiveCat] = useState<number | undefined>(undefined)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateTrilha, setShowCreateTrilha] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState<number | undefined>(undefined)
  const [viewMode, setViewMode] = useState<'container' | 'list'>('container')
  const [loading, setLoading] = useState(true)

  const fetchTrilhas = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (sectorFilter) params.sectorId = sectorFilter
      const { data } = await api.get('/trilhas', { params })
      setTrilhas(data)
    } catch {
      addToast('Erro ao carregar trilhas', 'error')
    } finally {
      setLoading(false)
    }
  }, [sectorFilter])

  useEffect(() => { fetchTrilhas() }, [fetchTrilhas])

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {})
  }, [])
  useEffect(() => {
    api.get('/sectors').then(({ data }) => setSectors(data)).catch(() => {})
  }, [])

  const rootCats = useMemo(() => categories.filter(c => !c.parentId), [categories])
  const childrenOf = useMemo(() => (parentId: number) => categories.filter(c => c.parentId === parentId), [categories])

  const toggleCat = (id: number) => {
    setExpandedCats(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCatFilter = (id: number | undefined) => {
    setActiveCat(id)
  }

  const handleClearFilters = () => {
    setActiveCat(undefined)
    setSearchTerm('')
    setSectorFilter(undefined)
  }

  const currentCategoryName = useMemo(() => activeCat
    ? categories.find(c => c.id === activeCat)?.name
    : null, [activeCat, categories])

  const filteredTrilhas = useMemo(() => {
    let list = trilhas
    if (activeCat) {
      const cat = categories.find(c => c.id === activeCat)
      if (cat?.parentId) {
        const parent = categories.find(c => c.id === cat.parentId)
        if (parent) list = trilhas.filter(t => t.id === parent.id)
      } else {
        list = trilhas.filter(t => t.id === activeCat)
      }
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.map(t => ({
        ...t,
        documents: t.documents.filter(d => d.title.toLowerCase().includes(q)),
        children: t.children.map(c => ({
          ...c,
          documents: c.documents.filter(d => d.title.toLowerCase().includes(q)),
        })),
      }))
    }
    return list
  }, [trilhas, activeCat, searchTerm, categories])

  const handleCreateDoc = async (data: { title: string; contentJson: any; contentType?: string; contentUrl?: string; imageUrl?: string; summary?: string; sectorId: number; categoryId?: number }) => {
    try {
      const payload: any = {
        title: data.title, contentJson: data.contentJson,
        contentType: data.contentType || 'rich-text',
        sectorId: data.sectorId,
      }
      if (data.contentUrl) payload.contentUrl = data.contentUrl
      if (data.imageUrl) payload.imageUrl = data.imageUrl
      if (data.summary) payload.summary = data.summary
      if (data.categoryId) payload.categoryId = data.categoryId
      await api.post('/documents', payload)
      addToast('Documento criado com sucesso', 'success')
      setShowCreateModal(false)
      fetchTrilhas()
    } catch (e: any) {
      addToast(e.response?.data?.error || 'Erro ao criar documento', 'error')
    }
  }

  const handleTrilhaCreated = () => {
    fetchTrilhas()
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {})
  }

  const hasActiveFilters = searchTerm || sectorFilter || activeCat

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR')

  const totalDocCount = useMemo(() => {
    let count = 0
    for (const t of filteredTrilhas) {
      count += t.documents.length
      for (const c of t.children) count += c.documents.length
    }
    return count
  }, [filteredTrilhas])

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
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Trilha: {currentCategoryName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/30 rounded-xl p-0.5 border" style={{ borderColor: 'var(--glass-border-strong)' }}>
            <button
              onClick={() => setViewMode('container')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'container' ? 'bg-white shadow-sm' : ''}`}
              title="Visualização em container"
              style={{ color: viewMode === 'container' ? 'var(--clinical-600)' : 'var(--text-muted)' }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              title="Visualização em lista"
              style={{ color: viewMode === 'list' ? 'var(--clinical-600)' : 'var(--text-muted)' }}
            >
              <List size={16} />
            </button>
          </div>
          {isAdmin && (
            <>
              <button onClick={() => setShowCreateTrilha(true)} className="btn-secondary text-sm flex items-center gap-2">
                <BookMarked size={16} />
                Nova Trilha
              </button>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm flex items-center gap-2">
                <Plus size={16} />
                Novo Documento
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome..."
            className="glass-input w-full pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <select
          value={sectorFilter || ''}
          onChange={e => setSectorFilter(e.target.value ? parseInt(e.target.value) : undefined)}
          className="glass-input px-3 py-2 text-sm"
        >
          <option value="">Todos os setores</option>
          {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {hasActiveFilters && (
          <button onClick={handleClearFilters}
            className="text-xs px-3 py-2 rounded-xl transition-colors"
            style={{ color: 'var(--clinical-600)' }}>
            Limpar filtros
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
                <button onClick={() => handleCatFilter(undefined)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    !activeCat && !hasActiveFilters ? 'bg-clinical-50 text-clinical-600 font-medium' : ''
                  }`}
                  style={{ color: activeCat || hasActiveFilters ? 'var(--text-muted)' : undefined }}>
                  Todas
                </button>
              </div>

              {rootCats.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  {isAdmin ? 'Crie pastas em Admin > Categorias' : 'Nenhuma pasta disponível'}
                </p>
              ) : (
                <div className="space-y-0.5">
                  {rootCats.map(cat => (
                    <div key={cat.id}>
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleCat(cat.id)}
                          className="p-1 rounded-lg transition-colors shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                          aria-label={expandedCats.has(cat.id) ? 'Recolher' : 'Expandir'}
                        >
                          <FolderOpen size={14} />
                        </button>
                        <button
                          onClick={() => handleCatFilter(cat.id)}
                          className={`flex-1 text-left px-2 py-1.5 text-sm rounded-xl transition-colors ${
                            activeCat === cat.id ? 'bg-clinical-50 font-medium' : ''
                          }`}
                          style={{
                            color: activeCat === cat.id ? 'var(--clinical-700)' : 'var(--text-secondary)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 40%, transparent)' }}
                          onMouseLeave={e => { if (activeCat !== cat.id) e.currentTarget.style.background = 'transparent' }}
                        >
                          <span className="truncate">{cat.name}</span>
                        </button>
                      </div>
                      {expandedCats.has(cat.id) && childrenOf(cat.id).map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleCatFilter(sub.id)}
                          className={`w-full flex items-center gap-2 pl-10 pr-3 py-1.5 text-sm rounded-xl transition-colors text-left ${
                            activeCat === sub.id ? 'bg-clinical-50 font-medium' : ''
                          }`}
                          style={{
                            color: activeCat === sub.id ? 'var(--clinical-700)' : 'var(--text-secondary)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 40%, transparent)' }}
                          onMouseLeave={e => { if (activeCat !== sub.id) e.currentTarget.style.background = 'transparent' }}
                        >
                          <Folder size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
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
          {loading ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="card p-0 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--glass-border-strong)' }}>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}></th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Título</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Trilha</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Setor</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Versão</th>
                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrilhas.flatMap(t => [
                    ...t.documents.map(d => ({ ...d, _trilha: t.name })),
                    ...t.children.flatMap(c => c.documents.map(d => ({ ...d, _trilha: `${t.name} > ${c.name}` }))),
                  ]).map(doc => (
                    <tr key={doc.id} className="border-b cursor-pointer transition-colors"
                      style={{ borderColor: 'var(--glass-border-strong)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-100)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      onClick={() => navigate(`/documentos/${doc.id}`)}>
                      <td className="px-4 py-3">
                        {doc.imageUrl ? (
                          <img src={doc.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                            {contentTypeIconLarge[doc.contentType] || <FileText size={18} className="text-slate-400" />}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        <div className="flex items-center gap-2">
                          {contentTypeIcons[doc.contentType]}
                          <span className="truncate max-w-[200px]">{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{(doc as any)._trilha}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{doc.sectorName}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>v{doc.version}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(doc.updatedAt)}</td>
                    </tr>
                  ))}
                  {totalDocCount === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center">
                      <p style={{ color: 'var(--text-muted)' }}>
                        {activeCat ? 'Nenhum documento nesta pasta' : 'Nenhum documento encontrado'}
                      </p>
                      {isAdmin && !activeCat && (
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
          ) : (
            <div className="space-y-10">
              {filteredTrilhas.length === 0 && (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-muted)' }}>
                    {activeCat ? 'Nenhum documento nesta pasta' : 'Nenhum documento encontrado'}
                  </p>
                  {isAdmin && !activeCat && (
                    <button onClick={() => setShowCreateModal(true)}
                      className="text-sm mt-2 hover:underline"
                      style={{ color: 'var(--clinical-600)' }}>
                      Criar primeiro documento
                    </button>
                  )}
                </div>
              )}
              {filteredTrilhas.map(trilha => {
                const allTrilhaDocs = [
                  ...trilha.documents.map(d => ({ ...d, _sub: null })),
                  ...trilha.children.flatMap(c => c.documents.map(d => ({ ...d, _sub: c.name }))),
                ]
                if (allTrilhaDocs.length === 0 && !activeCat) return null
                return (
                  <section key={trilha.id}>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2"
                        style={{ color: 'var(--text-primary)' }}>
                        <FolderOpen size={20} style={{ color: 'var(--clinical-500)' }} />
                        {trilha.name}
                      </h2>
                      {trilha.description && (
                        <p className="text-sm mt-1 ml-8" style={{ color: 'var(--text-muted)' }}>
                          {trilha.description}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allTrilhaDocs.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => navigate(`/documentos/${doc.id}`)}
                          className="card p-0 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
                        >
                          {doc.imageUrl ? (
                            <div className="h-36 overflow-hidden">
                              <img src={doc.imageUrl} alt={doc.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                          ) : (
                            <div className="h-36 flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                              {contentTypeIconLarge[doc.contentType] || <FileText size={36} className="text-slate-400" />}
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              {contentTypeIcons[doc.contentType]}
                              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)' }}>
                                v{doc.version}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold mb-1 line-clamp-2 group-hover:text-clinical-600 transition-colors"
                              style={{ color: 'var(--text-primary)' }}>
                              {doc.title}
                            </h3>
                            {doc.summary && (
                              <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                                {doc.summary}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(doc.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDate(doc.updatedAt)}
                              </span>
                            </div>
                            {doc._sub && (
                              <div className="mt-2 text-xs" style={{ color: 'var(--clinical-500)' }}>
                                <Folder size={12} className="inline mr-1" />
                                {doc._sub}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
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
      {showCreateTrilha && (
        <CreateTrilhaModal
          sectors={sectors}
          onCreated={handleTrilhaCreated}
          onClose={() => setShowCreateTrilha(false)}
        />
      )}
    </div>
  )
}
