import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import UserFormModal from '../components/admin/UserFormModal'
import { TableSkeleton } from '../components/ui/Skeleton'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'

interface User { id: number; name: string; email: string; role: string; sectorId: number; sectorName: string; isActive: boolean }
interface Sector { id: number; name: string }

export default function AdminUsers() {
  const { addToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/users').then(({ data }) => setUsers(data.data)),
      api.get('/sectors').then(({ data }) => setSectors(data)),
    ]).catch(() => addToast('Erro ao carregar usuários', 'error')).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (data: { name: string; email: string; password?: string; role: string; sectorId: number }) => {
    try {
      await api.post('/users', data)
      addToast('Usuário criado', 'success')
      load()
    } catch {
      addToast('Erro ao criar usuário', 'error')
    }
    setShowModal(false)
  }

  const handleEdit = async (data: { name: string; email: string; password?: string; role: string; sectorId: number }) => {
    if (!editingUser) return
    try {
      await api.put(`/users/${editingUser.id}`, data)
      addToast('Usuário atualizado', 'success')
      load()
    } catch {
      addToast('Erro ao atualizar usuário', 'error')
    }
    setEditingUser(null)
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await api.patch(`/users/${id}/status`, { isActive: !isActive })
      addToast(isActive ? 'Usuário desativado' : 'Usuário ativado', 'success')
      load()
    } catch {
      addToast('Erro ao alterar status', 'error')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Administração</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{users.length} usuários</p>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">+ Novo Usuário</button>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
      <div className="card p-0 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border-strong)' }}>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nome</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Setor</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Permissão</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border-strong)' }}
                className="transition-colors"
                onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 30%, transparent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{user.sectorName}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                    background: user.role === 'admin' ? 'color-mix(in srgb, var(--purple-600) 15%, transparent)' : 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
                    color: user.role === 'admin' ? 'var(--purple-600)' : 'var(--text-secondary)',
                  }}>
                    {user.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-sm" style={{
                    color: user.isActive ? 'var(--health-600)' : 'var(--red-500)',
                  }}>
                    <span className="w-2 h-2 rounded-full" style={{
                      background: user.isActive ? 'var(--health-500)' : 'var(--red-500)',
                    }} />
                    {user.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingUser(user)}
                      className="text-xs font-medium transition-colors"
                      style={{ color: 'var(--clinical-600)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--clinical-700)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--clinical-600)' }}>
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className="text-xs font-medium transition-colors"
                      style={{ color: user.isActive ? 'var(--red-500)' : 'var(--health-600)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = user.isActive ? 'var(--red-700)' : 'var(--health-500)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = user.isActive ? 'var(--red-500)' : 'var(--health-600)' }}
                    >
                      {user.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {showModal && (
        <UserFormModal
          sectors={sectors}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}

      {editingUser && (
        <UserFormModal
          user={editingUser}
          sectors={sectors}
          onSave={handleEdit}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  )
}
