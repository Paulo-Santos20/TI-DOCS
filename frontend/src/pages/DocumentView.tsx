import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import LexicalViewer from '../components/editor/LexicalViewer'
import EditDocumentModal from '../components/documents/EditDocumentModal'
import DocumentComments from '../components/documents/DocumentComments'
import { TableSkeleton } from '../components/ui/Skeleton'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { ArrowLeft, Folder, Book, CheckCircle } from 'lucide-react'

interface Doc { id: number; title: string; contentJson: any; contentType?: string; contentUrl?: string; imageUrl?: string | null; summary?: string | null; status: string; version: number; sectorId: number; categoryId?: number | null; updatedAt: string }
interface Category { id: number; name: string; parentId: number | null; sectorId: number | null }
interface Sector { id: number; name: string }

export default function DocumentView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const isAdmin = user?.role === 'admin'

  const [doc, setDoc] = useState<Doc | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadDoc = () => {
    if (!id) return
    setLoading(true)
    api.get(`/documents/${id}`).then(({ data }) => setDoc(data)).catch(() => navigate('/documentos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDoc() }, [id])
  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {}) }, [])
  useEffect(() => { api.get('/sectors').then(({ data }) => setSectors(data)).catch(() => {}) }, [])

  const handleDelete = async () => {
    try { await api.delete(`/documents/${id}`); addToast('Documento excluído', 'success'); navigate('/documentos') }
    catch { addToast('Erro ao excluir documento', 'error') }
  }

  const handleStatusChange = async (status: string) => {
    try { await api.patch(`/documents/${id}/status`, { status }); addToast('Status alterado', 'success'); loadDoc() }
    catch { addToast('Erro ao alterar status', 'error') }
  }

  const handleEditSave = async (data: { title: string; contentType?: string; contentUrl?: string; imageUrl?: string | null; summary?: string | null; contentJson: any; categoryId?: number }) => {
    try { await api.put(`/documents/${id}`, data); addToast('Documento atualizado', 'success'); setShowEditModal(false); loadDoc() }
    catch (e: any) { addToast(e.response?.data?.error || 'Erro ao atualizar', 'error') }
  }

  const handleMarkRead = async () => {
    try { await api.post(`/treinamentos/documentos/${id}/completar`, { status: 'completed' }); addToast('Treinamento concluído!', 'success') }
    catch { addToast('Erro ao marcar treinamento', 'error') }
  }

  if (loading) return <TableSkeleton rows={3} />

  if (!doc) return null

  const nextStatus = doc.status === 'draft' ? 'published' : doc.status === 'published' ? 'archived' : 'draft'
  const nextStatusLabel = doc.status === 'draft' ? 'Publicar' : doc.status === 'published' ? 'Arquivar' : 'Reabrir'
  const categoryName = doc.categoryId ? categories.find(c => c.id === doc.categoryId)?.name : null

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <button onClick={() => navigate('/documentos')}
        className="text-sm mb-4 flex items-center gap-1 transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
        <ArrowLeft size={14} />
        Voltar para Documentos
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{doc.title}</h1>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100" style={{ color: 'var(--text-muted)' }}>v{doc.version}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                doc.status === 'published' ? 'bg-health-50 text-health-600'
                : doc.status === 'archived' ? 'bg-slate-100'
                : 'bg-amber-50 text-amber-600'
              }`} style={{ color: doc.status === 'archived' ? 'var(--text-muted)' : undefined }}>
                {doc.status === 'published' ? 'Publicado' : doc.status === 'archived' ? 'Arquivado' : doc.status === 'review' ? 'Revisão' : 'Rascunho'}
              </span>
              {categoryName && (
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Folder size={12} /> {categoryName}
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
              <button onClick={() => setConfirmDelete(true)}
                className="text-sm px-4 py-2 rounded-xl font-medium bg-red-50 text-red-500 hover:bg-red-100">Excluir</button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2">
          {isAdmin && (
            <button onClick={() => navigate(`/documentos/${id}/versoes`)}
              className="text-xs hover:underline" style={{ color: 'var(--clinical-600)' }}>
              Histórico de Versões
            </button>
          )}
        </div>
      </div>

      {doc.summary && (
        <div className="card p-4 mb-6">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{doc.summary}</p>
        </div>
      )}
      {doc.imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden max-h-64">
          <img src={doc.imageUrl} alt={doc.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="card min-h-[300px]">
        {doc.contentType === 'pdf' && doc.contentUrl ? (
          <iframe src={doc.contentUrl} className="w-full h-[600px] rounded-xl" />
        ) : doc.contentType === 'pdf' ? (
          <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
            <Book size={48} className="mb-4" />
            <p className="text-sm">Documento em PDF</p>
          </div>
        ) : doc.contentType === 'video' && doc.contentUrl ? (
          <div className="aspect-video">
            <iframe src={doc.contentUrl.replace('watch?v=', 'embed/')} className="w-full h-full rounded-xl" allowFullScreen />
          </div>
        ) : doc.contentJson && typeof doc.contentJson === 'object' && doc.contentJson.root ? (
          <LexicalViewer contentJson={doc.contentJson} />
        ) : doc.contentJson?.text ? (
          <div className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{doc.contentJson.text}</div>
        ) : (
          <p className="italic" style={{ color: 'var(--text-muted)' }}>Nenhum conteúdo</p>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div />
        <button className="btn-primary flex items-center gap-2" onClick={handleMarkRead}>
          <CheckCircle size={16} />
          Marcar como Lido
        </button>
      </div>

      <DocumentComments documentId={parseInt(id!)} />

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir documento"
        message="Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => { setConfirmDelete(false); handleDelete() }}
        onCancel={() => setConfirmDelete(false)}
      />

      {showEditModal && (
        <EditDocumentModal
          doc={doc}
          sectors={sectors}
          categories={categories}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}
