import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import SectorFormModal from '../components/admin/SectorFormModal'
import { TableSkeleton } from '../components/ui/Skeleton'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'

interface Sector { id: number; name: string; createdAt: string }

export default function AdminSectors() {
  const { addToast } = useToast()
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/sectors').then(({ data }) => setSectors(data)).catch(() => addToast('Erro ao carregar setores', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (name: string) => {
    try {
      await api.post('/sectors', { name })
      addToast('Setor criado', 'success')
      load()
    } catch {
      addToast('Erro ao criar setor', 'error')
    }
    setShowModal(false)
  }

  const handleDelete = async () => {
    if (deleteTarget === null) return
    try {
      await api.delete(`/sectors/${deleteTarget}`)
      addToast('Setor excluído', 'success')
      load()
    } catch {
      addToast('Erro ao excluir setor', 'error')
    }
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Administração</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{sectors.length} setores</p>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">+ Novo Setor</button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
      <div className="card p-0 overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border-strong)' }}>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nome</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Criado em</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map(sector => (
              <tr key={sector.id} style={{ borderBottom: '1px solid var(--glass-border-strong)' }}
                className="transition-colors"
                onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 30%, transparent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sector.name}</td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(sector.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setDeleteTarget(sector.id)}
                    className="text-sm transition-colors"
                    style={{ color: 'var(--red-500)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--red-700)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--red-500)' }}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir setor"
        message="Tem certeza que deseja excluir este setor?"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showModal && (
        <SectorFormModal onSave={handleCreate} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
