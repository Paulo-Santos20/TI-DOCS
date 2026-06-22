import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import UserFormModal from '../components/admin/UserFormModal'
import api from '../lib/api'

interface User { id: number; name: string; email: string; role: string; sectorName: string; isActive: boolean }
interface Sector { id: number; name: string }

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [showModal, setShowModal] = useState(false)

  const load = () => {
    api.get('/users').then(({ data }) => setUsers(data)).catch(() => {})
    api.get('/sectors').then(({ data }) => setSectors(data)).catch(() => {})
  }

  useEffect(load, [])

  const handleCreate = async (data: { name: string; email: string; password: string; role: string; sectorId: number }) => {
    try {
      await api.post('/users', data)
      load()
    } catch {}
    setShowModal(false)
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await api.patch(`/users/${id}/status`, { isActive: !isActive })
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
        <p className="text-sm text-slate-500">{users.length} usuários</p>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">+ Novo Usuário</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Nome</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Email</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Setor</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Permissão</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{user.sectorName}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-sm ${
                    user.isActive ? 'text-health-600' : 'text-red-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-health-500' : 'bg-red-500'}`} />
                    {user.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    className={`text-xs font-medium transition-colors ${
                      user.isActive ? 'text-red-500 hover:text-red-700' : 'text-health-600 hover:text-health-700'
                    }`}
                  >
                    {user.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserFormModal
          sectors={sectors}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
