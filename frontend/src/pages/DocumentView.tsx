import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import LexicalViewer from '../components/editor/LexicalViewer'
import EditDocumentModal from '../components/documents/EditDocumentModal'
import DocumentComments from '../components/documents/DocumentComments'
import { TableSkeleton } from '../components/ui/Skeleton'

interface Doc { id: number; title: string; contentJson: any; contentType?: string; contentUrl?: string; status: string; version: number; sectorId: number; categoryId?: number | null; updatedAt: string }
interface Category { id: number; name: string; parentId: number | null; sectorId: number | null }
interface Sector { id: number; name: string }

const MOCK_SECTORS: Sector[] = [
  { id: 1, name: 'TI' }, { id: 2, name: 'Enfermagem' },
  { id: 3, name: 'Medicina' }, { id: 4, name: 'Administrativo' },
]

export default function DocumentView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [doc, setDoc] = useState<Doc | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadDoc = () => {
    if (!id) return
    setLoading(true)
    api.get(`/documents/${id}`).then(({ data }) => setDoc(data)).catch(() => navigate('/documentos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDoc() }, [id])
  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {}) }, [])

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) return
    try { await api.delete(`/documents/${id}`); navigate('/documentos') }
    catch { alert('Erro ao excluir documento') }
  }

  const handleStatusChange = async (status: string) => {
    try { await api.patch(`/documents/${id}/status`, { status }); loadDoc() }
    catch { alert('Erro ao alterar status') }
  }

  const handleEditSave = async (data: { title: string; contentType?: string; contentUrl?: string; contentJson: any; categoryId?: number }) => {
    try { await api.put(`/documents/${id}`, data); setShowEditModal(false); loadDoc() }
    catch (e: any) { alert(e.response?.data?.error || 'Erro ao atualizar') }
  }

  const handleMarkRead = async () => {
    try { await api.post(`/treinamentos/documentos/${id}/completar`, { status: 'completed' }); alert('Treinamento concluído!') }
    catch { alert('Erro ao marcar treinamento') }
  }

  if (loading) return <TableSkeleton rows={3} />

  if (!doc) return null

  const nextStatus = doc.status === 'draft' ? 'published' : doc.status === 'published' ? 'archived' : 'draft'
  const nextStatusLabel = doc.status === 'draft' ? 'Publicar' : doc.status === 'published' ? 'Arquivar' : 'Reabrir'
  const categoryName = doc.categoryId ? categories.find(c => c.id === doc.categoryId)?.name : null

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/documentos')}
        className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1 transition-colors">
        ← Voltar para Documentos
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-800">{doc.title}</h1>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">v{doc.version}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                doc.status === 'published' ? 'bg-health-50 text-health-600'
                : doc.status === 'archived' ? 'bg-slate-100 text-slate-500'
                : doc.status === 'review' ? 'bg-amber-50 text-amber-600'
                : 'bg-amber-50 text-amber-600'
              }`}>
                {doc.status === 'published' ? 'Publicado' : doc.status === 'archived' ? 'Arquivado' : doc.status === 'review' ? 'Revisão' : 'Rascunho'}
              </span>
              {categoryName && <span className="text-xs text-slate-400 flex items-center gap-1">📁 {categoryName}</span>}
            </div>
            <p className="text-sm text-slate-400">
              Atualizado em {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('pt-BR') : '-'}
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button onClick={() => setShowEditModal(true)} className="btn-secondary text-sm">Editar</button>
              <button onClick={() => handleStatusChange(nextStatus)}
                className={`text-sm px-4 py-2 rounded-xl font-medium transition-all ${
                  doc.status === 'published' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  : 'bg-health-50 text-health-600 hover:bg-health-100'
                }`}>{nextStatusLabel}</button>
              <button onClick={handleDelete}
                className="text-sm px-4 py-2 rounded-xl font-medium bg-red-50 text-red-500 hover:bg-red-100">Excluir</button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2">
          {isAdmin && (
            <button onClick={() => navigate(`/documentos/${id}/versoes`)}
              className="text-xs text-clinical-600 hover:underline">Histórico de Versões</button>
          )}
        </div>
      </div>

      <div className="card min-h-[300px]">
        {doc.contentType === 'pdf' && doc.contentUrl ? (
          <iframe src={doc.contentUrl} className="w-full h-[600px] rounded-xl" />
        ) : doc.contentType === 'pdf' ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <span className="text-5xl mb-4">📕</span>
            <p className="text-sm">Documento em PDF</p>
          </div>
        ) : doc.contentType === 'video' && doc.contentUrl ? (
          <div className="aspect-video">
            <iframe src={doc.contentUrl.replace('watch?v=', 'embed/')} className="w-full h-full rounded-xl" allowFullScreen />
          </div>
        ) : doc.contentJson && typeof doc.contentJson === 'object' && doc.contentJson.root ? (
          <LexicalViewer contentJson={doc.contentJson} />
        ) : doc.contentJson?.text ? (
          <div className="text-slate-700 whitespace-pre-wrap">{doc.contentJson.text}</div>
        ) : (
          <p className="text-slate-400 italic">Nenhum conteúdo</p>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div />
        <button className="btn-primary" onClick={handleMarkRead}>Marcar como Lido</button>
      </div>

      <DocumentComments documentId={parseInt(id!)} />

      {showEditModal && (
        <EditDocumentModal
          doc={doc}
          sectors={MOCK_SECTORS}
          categories={categories}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}
