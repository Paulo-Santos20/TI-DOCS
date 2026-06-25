import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import { CheckCircle, Send, Trash2, MessageSquare } from 'lucide-react'

interface Comment {
  id: number; content: string; userId: number
  resolved: boolean; createdAt: string
}

interface Props { documentId: number }

export default function DocumentComments({ documentId }: Props) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    api.get(`/comments/${documentId}`).then(({ data }) => setComments(data)).catch(() => addToast('Erro ao carregar comentários', 'error'))
  }, [documentId])

  const handleAdd = async () => {
    if (!newComment.trim()) return
    try {
      const { data } = await api.post(`/comments/${documentId}`, { content: newComment })
      setComments(prev => [data, ...prev])
      setNewComment('')
    } catch { addToast('Erro ao adicionar comentário', 'error') }
  }

  const handleResolve = async (id: number) => {
    try {
      await api.patch(`/comments/${id}/resolve`, { resolved: true })
      setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: true } : c))
    } catch { addToast('Erro ao resolver comentário', 'error') }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/comments/${id}`)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch { addToast('Erro ao excluir comentário', 'error') }
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <MessageSquare size={18} />
        Comentários
      </h3>

      <div className="flex gap-3 mb-6">
        <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
          placeholder="Adicionar comentário..."
          rows={2}
          className="flex-1 glass-input px-3 py-2 resize-none text-sm" />
        <button onClick={handleAdd} disabled={!newComment.trim()}
          className="btn-primary self-end text-sm flex items-center gap-1">
          <Send size={14} />
          Comentar
        </button>
      </div>

      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className={`card p-4 ${c.resolved ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')} às {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {c.resolved && (
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--health-500)' }}>
                      <CheckCircle size={12} /> Resolvido
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{c.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!c.resolved && (user?.role === 'admin' || c.userId === user?.id) && (
                  <button onClick={() => handleResolve(c.id)}
                    className="text-xs transition-colors"
                    style={{ color: 'var(--health-500)' }}
                    onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                    onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}>
                    Resolver
                  </button>
                )}
                {(user?.role === 'admin' || c.userId === user?.id) && (
                  <button onClick={() => handleDelete(c.id)}
                    className="text-xs transition-colors"
                    style={{ color: 'var(--red-500)' }}
                    onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                    onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}>
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>Seja o primeiro a comentar</p>
        )}
      </div>
    </div>
  )
}
