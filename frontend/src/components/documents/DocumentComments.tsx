import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../lib/api'

interface Comment {
  id: number; content: string; userId: number
  resolved: boolean; createdAt: string
}

interface Props { documentId: number }

export default function DocumentComments({ documentId }: Props) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    api.get(`/comments/${documentId}`).then(({ data }) => setComments(data)).catch(() => {})
  }, [documentId])

  const handleAdd = async () => {
    if (!newComment.trim()) return
    try {
      const { data } = await api.post(`/comments/${documentId}`, { content: newComment })
      setComments(prev => [data, ...prev])
      setNewComment('')
    } catch { alert('Erro ao adicionar comentário') }
  }

  const handleResolve = async (id: number) => {
    await api.patch(`/comments/${id}/resolve`, { resolved: true })
    setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: true } : c))
  }

  const handleDelete = async (id: number) => {
    await api.delete(`/comments/${id}`)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Comentários</h3>

      <div className="flex gap-3 mb-6">
        <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
          placeholder="Adicionar comentário..."
          rows={2}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none resize-none text-sm" />
        <button onClick={handleAdd} disabled={!newComment.trim()}
          className="btn-primary self-end text-sm">Comentar</button>
      </div>

      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className={`card p-4 ${c.resolved ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')} às {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {c.resolved && <span className="text-xs text-health-600">✓ Resolvido</span>}
                </div>
                <p className="text-sm text-slate-700">{c.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!c.resolved && (user?.role === 'admin' || c.userId === 1) && (
                  <button onClick={() => handleResolve(c.id)}
                    className="text-xs text-health-600 hover:underline">Resolver</button>
                )}
                {(user?.role === 'admin' || c.userId === 1) && (
                  <button onClick={() => handleDelete(c.id)}
                    className="text-xs text-red-500 hover:underline">Excluir</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">Nenhum comentário ainda</p>
        )}
      </div>
    </div>
  )
}
