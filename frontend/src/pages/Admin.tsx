import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import { CardSkeleton } from '../components/ui/Skeleton'
import api from '../lib/api'

interface AdminStats {
  totalDocs: number; totalSectors: number; totalUsers: number
  totalCompleted: number; totalCategories: number; docsBySector: Record<string, number>
  publishedDocs: number; draftDocs: number
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data))
      .catch(() => setStats(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Painel Administrativo</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gerencie usuários, setores e documentos</p>
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Painel Administrativo</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total de Setores</span>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.totalSectors || 0}</p>
        </div>
        <div className="card">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Usuários Ativos</span>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.totalUsers || 0}</p>
        </div>
        <div className="card">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Documentos</span>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.totalDocs || 0}</p>
        </div>
        <div className="card">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Treinamentos</span>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.totalCompleted || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Publicados vs Rascunhos</h3>
          <div className="flex items-end gap-4 h-32">
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: 'var(--health-600)' }}>{stats?.publishedDocs || 0}</span>
              <div className="w-full rounded-t-lg transition-all" style={{
                height: `${Math.min((stats?.publishedDocs || 0) / Math.max((stats?.totalDocs || 1), 1) * 100, 100)}%`,
                background: 'color-mix(in srgb, var(--health-500) 20%, transparent)'
              }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Publicados</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: 'var(--amber-500)' }}>{stats?.draftDocs || 0}</span>
              <div className="w-full rounded-t-lg transition-all" style={{
                height: `${Math.min((stats?.draftDocs || 0) / Math.max((stats?.totalDocs || 1), 1) * 100, 100)}%`,
                background: 'color-mix(in srgb, var(--amber-500) 20%, transparent)'
              }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Rascunhos</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Documentos Recentes</h3>
          <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
            {stats && stats.totalDocs > 0
              ? `${stats.totalDocs} documentos no total`
              : 'Nenhum documento criado ainda'}
          </p>
        </div>
      </div>
    </div>
  )
}
