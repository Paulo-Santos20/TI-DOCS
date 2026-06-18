import { useState } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import SectorFormModal from '../components/admin/SectorFormModal'

interface Sector { id: number; name: string; createdAt: string; userCount: number }

export default function AdminSectors() {
  const [sectors, setSectors] = useState<Sector[]>([
    { id: 1, name: 'TI', createdAt: '2024-01-01', userCount: 1 },
    { id: 2, name: 'Enfermagem', createdAt: '2024-01-01', userCount: 1 },
    { id: 3, name: 'Medicina', createdAt: '2024-01-01', userCount: 1 },
    { id: 4, name: 'Administrativo', createdAt: '2024-01-02', userCount: 0 },
  ])
  const [showModal, setShowModal] = useState(false)

  const handleCreate = (name: string) => {
    const newSector: Sector = {
      id: sectors.length + 1,
      name,
      createdAt: new Date().toISOString().split('T')[0],
      userCount: 0,
    }
    setSectors(prev => [...prev, newSector])
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
        <p className="text-sm text-slate-500">{sectors.length} setores</p>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">+ Novo Setor</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Nome</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Criado em</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Usuários</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map(sector => (
              <tr key={sector.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{sector.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(sector.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{sector.userCount}</td>
                <td className="px-6 py-4">
                  <button className="text-sm text-red-500 hover:text-red-700 transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <SectorFormModal onSave={handleCreate} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
