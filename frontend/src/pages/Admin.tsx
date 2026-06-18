import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import { CardSkeleton } from '../components/ui/Skeleton'

interface AdminStats {
  totalDocs: number; totalSectors: number; totalUsers: number
  totalCompleted: number; totalCategories: number; docsBySector: Record<string, number>
  publishedDocs: number; draftDocs: number
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats').then(r => r.json()).then(setStats)
      .catch(() => setStats(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Painel Administrativo</h1>
        <p className="text-slate-500 mt-1">Gerencie usuários, setores e documentos</p>
      </div>
      <AdminTabs />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Painel Administrativo</h1>
        <p className="text-slate-500 mt-1">Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <span className="text-sm font-medium text-slate-500">Total de Setores</span>
          <p className="mt-2 text-3xl font-bold text-slate-800">{stats?.totalSectors || 0}</p>
        </div>
        <div className="card">
          <span className="text-sm font-medium text-slate-500">Usuários Ativos</span>
          <p className="mt-2 text-3xl font-bold text-slate-800">{stats?.totalUsers || 0}</p>
        </div>
        <div className="card">
          <span className="text-sm font-medium text-slate-500">Documentos</span>
          <p className="mt-2 text-3xl font-bold text-slate-800">{stats?.totalDocs || 0}</p>
        </div>
        <div className="card">
          <span className="text-sm font-medium text-slate-500">Treinamentos</span>
          <p className="mt-2 text-3xl font-bold text-slate-800">{stats?.totalCompleted || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Publicados vs Rascunhos</h3>
          <div className="flex items-end gap-4 h-32">
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-2xl font-bold text-health-600">{stats?.publishedDocs || 0}</span>
              <div className="w-full bg-health-100 rounded-t-lg transition-all" style={{ height: `${Math.min((stats?.publishedDocs || 0) / Math.max((stats?.totalDocs || 1), 1) * 100, 100)}%` }} />
              <span className="text-xs text-slate-500">Publicados</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-2xl font-bold text-amber-500">{stats?.draftDocs || 0}</span>
              <div className="w-full bg-amber-100 rounded-t-lg transition-all" style={{ height: `${Math.min((stats?.draftDocs || 0) / Math.max((stats?.totalDocs || 1), 1) * 100, 100)}%` }} />
              <span className="text-xs text-slate-500">Rascunhos</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Documentos Recentes</h3>
          <p className="text-sm text-slate-400 py-8 text-center">
            {stats && stats.totalDocs > 0
              ? `${stats.totalDocs} documentos no total`
              : 'Nenhum documento criado ainda'}
          </p>
        </div>
      </div>
    </div>
  )
}
