import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import api from '../lib/api'

interface User { id: number; name: string }
interface Document { id: number; title: string }
interface Assignment { id: number; userId: number; documentId: number; dueDate: string | null; createdAt: string }

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [docs, setDocs] = useState<Document[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newAssign, setNewAssign] = useState({ userId: 0, documentId: 0, dueDate: '' })

  const load = () => {
    api.get('/assignments').then(({ data }) => setAssignments(data.data)).catch(() => {})
    api.get('/users').then(({ data }) => setUsers(data.data)).catch(() => {})
    api.get('/documents').then(({ data }) => setDocs(data.data)).catch(() => {})
  }

  useEffect(load, [])

  const userName = (id: number) => users.find(u => u.id === id)?.name || `#${id}`
  const docTitle = (id: number) => docs.find(d => d.id === id)?.title || `#${id}`

  const handleCreate = async () => {
    if (!newAssign.userId || !newAssign.documentId) return
    try {
      await api.post('/assignments', newAssign)
      load()
    } catch {}
    setNewAssign({ userId: 0, documentId: 0, dueDate: '' })
    setShowForm(false)
  }

  const handleRemove = async (id: number) => {
    if (!confirm('Remover esta atribuição?')) return
    try {
      await api.delete(`/assignments/${id}`)
      load()
    } catch {}
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Administração</h1>
        <p className="text-slate-500 mt-1">Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{assignments.length} atribuições</p>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Atribuir Treinamento</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Usuário</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Documento</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Data Limite</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Atribuído em</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{userName(a.userId)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{docTitle(a.documentId)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {a.dueDate ? new Date(a.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleRemove(a.id)}
                    className="text-xs text-red-500 hover:underline">Remover</button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                Nenhuma atribuição de treinamento
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Atribuir Treinamento</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
                <select value={newAssign.userId} onChange={e => setNewAssign(f => ({ ...f, userId: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white">
                  <option value={0}>Selecione...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Documento</label>
                <select value={newAssign.documentId} onChange={e => setNewAssign(f => ({ ...f, documentId: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white">
                  <option value={0}>Selecione...</option>
                  {docs.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Limite (opcional)</label>
                <input type="date" value={newAssign.dueDate} onChange={e => setNewAssign(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none" />
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
