import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import SectorFormModal from '../components/admin/SectorFormModal'
import api from '../lib/api'

interface Sector { id: number; name: string; createdAt: string }

export default function AdminSectors() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [showModal, setShowModal] = useState(false)

  const load = () => {
    api.get('/sectors').then(({ data }) => setSectors(data)).catch(() => {})
  }

  useEffect(load, [])

  const handleCreate = async (name: string) => {
    try {
      await api.post('/sectors', { name })
      load()
    } catch {}
    setShowModal(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este setor?')) return
    try {
      await api.delete(`/sectors/${id}`)
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
        <p className="text-sm text-slate-500">{sectors.length} setores</p>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">+ Novo Setor</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Nome</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Criado em</th>
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
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(sector.id)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors">
                    Excluir
                  </button>
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
