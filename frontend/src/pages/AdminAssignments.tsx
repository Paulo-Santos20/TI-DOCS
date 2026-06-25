import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import { TableSkeleton } from '../components/ui/Skeleton'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { X } from 'lucide-react'

interface User { id: number; name: string }
interface Document { id: number; title: string }
interface Assignment { id: number; userId: number; documentId: number; dueDate: string | null; createdAt: string }

export default function AdminAssignments() {
  const { addToast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newAssign, setNewAssign] = useState({ userId: 0, documentId: 0, dueDate: '' })
  const [removeTarget, setRemoveTarget] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/assignments').then(({ data }) => setAssignments(data.data)),
      api.get('/users').then(({ data }) => setUsers(data.data)),
      api.get('/documents').then(({ data }) => setDocs(data.data)),
    ]).catch(() => addToast('Erro ao carregar atribuições', 'error')).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const userName = (id: number) => users.find(u => u.id === id)?.name || `#${id}`
  const docTitle = (id: number) => docs.find(d => d.id === id)?.title || `#${id}`

  const handleCreate = async () => {
    if (!newAssign.userId || !newAssign.documentId) return
    try {
      await api.post('/assignments', newAssign)
      addToast('Treinamento atribuído', 'success')
      load()
    } catch {
      addToast('Erro ao atribuir treinamento', 'error')
    }
    setNewAssign({ userId: 0, documentId: 0, dueDate: '' })
    setShowForm(false)
  }

  const handleRemove = async () => {
    if (removeTarget === null) return
    try {
      await api.delete(`/assignments/${removeTarget}`)
      addToast('Atribuição removida', 'success')
      load()
    } catch {
      addToast('Erro ao remover atribuição', 'error')
    }
    setRemoveTarget(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Administração</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{assignments.length} atribuições</p>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Atribuir Treinamento</button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
      <div className="card p-0 overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border-strong)' }}>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Usuário</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Documento</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Data Limite</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Atribuído em</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--glass-border-strong)' }}
                className="transition-colors"
                onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 30%, transparent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{userName(a.userId)}</td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{docTitle(a.documentId)}</td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {a.dueDate ? new Date(a.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setRemoveTarget(a.id)}
                    className="text-xs transition-colors"
                    style={{ color: 'var(--red-500)' }}
                    onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                    onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Nenhuma atribuição de treinamento
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remover atribuição"
        message="Remover esta atribuição de treinamento?"
        confirmLabel="Remover"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-elevated rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Atribuir Treinamento</h3>
              <button onClick={() => setShowForm(false)} className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Usuário</label>
                <select value={newAssign.userId} onChange={e => setNewAssign(f => ({ ...f, userId: parseInt(e.target.value) }))}
                  className="glass-input w-full px-3 py-2">
                  <option value={0}>Selecione...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Documento</label>
                <select value={newAssign.documentId} onChange={e => setNewAssign(f => ({ ...f, documentId: parseInt(e.target.value) }))}
                  className="glass-input w-full px-3 py-2">
                  <option value={0}>Selecione...</option>
                  {docs.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Data Limite (opcional)</label>
                <input type="date" value={newAssign.dueDate} onChange={e => setNewAssign(f => ({ ...f, dueDate: e.target.value }))}
                  className="glass-input w-full px-3 py-2" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={handleCreate} className="btn-primary flex-1">Atribuir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
