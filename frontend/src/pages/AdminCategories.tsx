import { useState, useEffect, useMemo } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import CategoryFormModal from '../components/admin/CategoryFormModal'
import { CardSkeleton } from '../components/ui/Skeleton'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import { FolderOpen, Folder } from 'lucide-react'

interface Category {
  id: number; name: string; description: string | null
  parentId: number | null; sectorId: number | null
  children?: Category[]
}
interface Sector { id: number; name: string }

function buildTree(cats: Category[]): (Category & { children: Category[] })[] {
  const map = new Map(cats.map(c => [c.id, { ...c, children: [] as Category[] }]))
  const roots: (Category & { children: Category[] })[] = []
  for (const cat of map.values()) {
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(cat)
    } else {
      roots.push(cat)
    }
  }
  return roots
}

export default function AdminCategories() {
  const { addToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => addToast('Erro ao carregar categorias', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])
  useEffect(() => { api.get('/sectors').then(({ data }) => setSectors(data)).catch(() => {}) }, [])

  const tree = useMemo(() => buildTree(categories), [categories])

  const handleSave = async (data: { name: string; description?: string; parentId?: number; sectorId?: number }) => {
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, data)
        addToast('Categoria atualizada', 'success')
      } else {
        await api.post('/categories', data)
        addToast('Categoria criada', 'success')
      }
      load()
    } catch {
      addToast('Erro ao salvar categoria', 'error')
    }
    setShowModal(false)
    setEditing(null)
  }

  const handleDelete = async (id: number) => {
    const hasChildren = categories.some(c => c.parentId === id)
    if (hasChildren) { addToast('Remova as subpastas antes de excluir esta pasta.', 'error'); return }
    try {
      await api.delete(`/categories/${id}`)
      addToast('Categoria excluída', 'success')
      load()
    } catch {
      addToast('Erro ao excluir categoria', 'error')
    }
  }

  const sectorName = (id: number | null) => id ? sectors.find(s => s.id === id)?.name || '-' : 'Global'

  const renderTree = (nodes: Category[], depth = 0) => (
    nodes.map(cat => (
      <div key={cat.id}>
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors group"
          style={{ paddingLeft: `${16 + depth * 24}px` }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-100)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {depth === 0
              ? <FolderOpen size={20} className="shrink-0" style={{ color: 'var(--clinical-500)' }} />
              : <Folder size={20} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
            }
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{cat.description || 'Sem descrição'}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ color: 'var(--text-muted)', background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)' }}>
              {sectorName(cat.sectorId)}
            </span>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => { setEditing(cat); setShowModal(true) }}
              className="text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--clinical-600)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
              Editar
            </button>
            <button onClick={() => handleDelete(cat.id)}
              className="text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--red-500)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
              Excluir
            </button>
          </div>
        </div>
        {cat.children && renderTree(cat.children, depth + 1)}
      </div>
    ))
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Administração</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{categories.length} categorias</p>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary text-sm">
          + Nova Pasta
        </button>
      </div>

      <div className="card p-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : tree.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhuma pasta criada ainda</p>
        ) : (
          renderTree(tree)
        )}
      </div>

      {showModal && (
        <CategoryFormModal
          categories={categories}
          sectors={sectors}
          editing={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
