import { useState } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import CategoryFormModal from '../components/admin/CategoryFormModal'

interface Category {
  id: number; name: string; description: string | null
  parentId: number | null; sectorId: number | null
  children?: Category[]
}

const MOCK_SECTORS = [
  { id: 1, name: 'TI' },
  { id: 2, name: 'Enfermagem' },
  { id: 3, name: 'Medicina' },
  { id: 4, name: 'Administrativo' },
]

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'POPs', description: 'Procedimentos Operacionais Padrão', parentId: null, sectorId: null },
  { id: 2, name: 'Manuais', description: 'Manuais técnicos', parentId: null, sectorId: null },
  { id: 3, name: 'Protocolos', description: 'Protocolos clínicos', parentId: null, sectorId: null },
  { id: 4, name: 'Enfermagem', description: 'POPs de enfermagem', parentId: 1, sectorId: 2 },
  { id: 5, name: 'Medicina', description: 'POPs de medicina', parentId: 1, sectorId: 3 },
  { id: 6, name: 'CME', description: 'Central de Material Esterilizado', parentId: 2, sectorId: null },
]

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
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const tree = buildTree(categories)

  const handleSave = (data: { name: string; description?: string; parentId?: number; sectorId?: number }) => {
    if (editing) {
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, ...data } : c))
    } else {
      const newCat: Category = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        name: data.name,
        description: data.description || null,
        parentId: data.parentId || null,
        sectorId: data.sectorId || null,
      }
      setCategories(prev => [...prev, newCat])
    }
    setShowModal(false)
    setEditing(null)
  }

  const handleDelete = (id: number) => {
    const hasChildren = categories.some(c => c.parentId === id)
    if (hasChildren) { alert('Remova as subpastas antes de excluir esta pasta.'); return }
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const sectorName = (id: number | null) => id ? MOCK_SECTORS.find(s => s.id === id)?.name || '-' : 'Global'

  const renderTree = (nodes: Category[], depth = 0) => (
    nodes.map(cat => (
      <div key={cat.id}>
        <div
          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors group"
          style={{ paddingLeft: `${16 + depth * 24}px` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg shrink-0">{depth === 0 ? '📁' : '📂'}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{cat.name}</p>
              <p className="text-xs text-slate-400 truncate">{cat.description || 'Sem descrição'}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
              {sectorName(cat.sectorId)}
            </span>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => { setEditing(cat); setShowModal(true) }}
              className="text-xs text-slate-400 hover:text-clinical-600 transition-colors">
              Editar
            </button>
            <button onClick={() => handleDelete(cat.id)}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors">
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
        <h1 className="text-2xl font-bold text-slate-800">Administração</h1>
        <p className="text-slate-500 mt-1">Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{categories.length} categorias</p>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary text-sm">
          + Nova Pasta
        </button>
      </div>

      <div className="card p-4">
        {tree.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Nenhuma pasta criada ainda</p>
        ) : (
          renderTree(tree)
        )}
      </div>

      {showModal && (
        <CategoryFormModal
          categories={categories}
          sectors={MOCK_SECTORS}
          editing={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
