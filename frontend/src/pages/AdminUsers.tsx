import { useState } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import UserFormModal from '../components/admin/UserFormModal'

interface User { id: number; name: string; email: string; role: string; sectorName: string; isActive: boolean }

const MOCK_SECTORS = [
  { id: 1, name: 'TI' },
  { id: 2, name: 'Enfermagem' },
  { id: 3, name: 'Medicina' },
  { id: 4, name: 'Administrativo' },
]

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Administrador', email: 'admin@tidocs.com', role: 'admin', sectorName: 'TI', isActive: true },
    { id: 2, name: 'Maria Silva', email: 'maria@tidocs.com', role: 'user', sectorName: 'Enfermagem', isActive: true },
    { id: 3, name: 'Carlos Santos', email: 'carlos@tidocs.com', role: 'user', sectorName: 'Medicina', isActive: true },
  ])
  const [showModal, setShowModal] = useState(false)

  const handleCreate = (data: { name: string; email: string; role: string; sectorId: number }) => {
    const sector = MOCK_SECTORS.find(s => s.id === data.sectorId)
    const newUser: User = {
      id: users.length + 1,
      name: data.name,
      email: data.email,
      role: data.role,
      sectorName: sector?.name || '',
      isActive: true,
    }
    setUsers(prev => [...prev, newUser])
    setShowModal(false)
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserFormModal
          sectors={MOCK_SECTORS}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
