import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import CreateDocumentModal from '../components/documents/CreateDocumentModal'

interface Doc { id: number; title: string; status: string; version: number; sectorName: string; categoryId?: number | null; updatedAt: string }
interface Category { id: number; name: string; parentId: number | null; sectorId: number | null }
interface Sector { id: number; name: string }

const MOCK_SECTORS: Sector[] = [
  { id: 1, name: 'TI' }, { id: 2, name: 'Enfermagem' },
  { id: 3, name: 'Medicina' }, { id: 4, name: 'Administrativo' },
]

export default function Documents() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()

  const [docs, setDocs] = useState<Doc[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    api.get('/documents', { params: { categoryId: selectedCategory } })
      .then(({ data }) => setDocs(data)).catch(() => {})
  }, [selectedCategory])

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  const treeCats = categories.filter(c => !c.parentId)
  const childCats = (parentId: number) => categories.filter(c => c.parentId === parentId)

  const currentCategoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name
    : null

  const handleCreateDoc = async (data: { title: string; contentJson: string; sectorId: number; categoryId?: number }) => {
    try {
      const payload: any = { title: data.title, contentJson: data.contentJson, sectorId: data.sectorId }
      if (data.categoryId) payload.categoryId = data.categoryId
      await api.post('/documents', payload)
      setShowCreateModal(false)
      const { data: refreshed } = await api.get('/documents', { params: { categoryId: selectedCategory } })
      setDocs(refreshed)
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erro ao criar documento')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Documentos</h1>
            {currentCategoryName && (
              <p className="text-sm text-slate-400 mt-0.5">Pasta: {currentCategoryName}</p>
            )}
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm">
            + Novo Documento
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {sidebarOpen && (
          <div className="w-64 shrink-0">
            <div className="card p-3 sticky top-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pastas</span>
                <button onClick={() => setSelectedCategory(undefined)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-clinical-50 text-clinical-600 font-medium' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  Todas
                </button>
              </div>

              {treeCats.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
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
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>📁</span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                      {selectedCategory === cat.id && childCats(cat.id).map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedCategory(sub.id)}
                          className={`w-full flex items-center gap-2 pl-10 pr-3 py-1.5 text-sm rounded-xl transition-colors text-left ${
                            selectedCategory === sub.id
                              ? 'bg-clinical-50 text-clinical-700 font-medium'
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span>📂</span>
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
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Título</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Setor</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Versão</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc.id} className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/documentos/${doc.id}`)}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{doc.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{doc.sectorName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">v{doc.version}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        doc.status === 'published' ? 'bg-health-50 text-health-600'
                        : doc.status === 'archived' ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-50 text-amber-600'
                      }`}>
                        {doc.status === 'published' ? 'Publicado' : doc.status === 'archived' ? 'Arquivado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-400">
                      {selectedCategory ? 'Nenhum documento nesta pasta' : 'Nenhum documento encontrado'}
                    </p>
                    {isAdmin && !selectedCategory && (
                      <button onClick={() => setShowCreateModal(true)}
                        className="text-clinical-600 text-sm mt-2 hover:underline">
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
          sectors={MOCK_SECTORS}
          categories={categories}
          onSave={handleCreateDoc}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
