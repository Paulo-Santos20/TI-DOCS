import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import StatCard from '../components/ui/StatCard'
import { CardSkeleton } from '../components/ui/Skeleton'

interface DashboardStats {
  totalDocs: number; publishedDocs: number; draftDocs: number; archivedDocs: number
  totalSectors: number; totalUsers: number; totalCompleted: number; totalCategories: number
}

const RECENT_DOCS = [
  { id: 1, title: 'POP-023: Curativos Especiais', sector: 'Enfermagem', updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, title: 'Manual CME - Instrumentais', sector: 'Medicina', updatedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 3, title: 'POP-045: Segurança do Paciente', sector: 'Enfermagem', updatedAt: new Date(Date.now() - 259200000).toISOString() },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data))
      .catch(() => setStats(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Bem-vindo, {user?.name}!
          {stats && ` ${stats.totalDocs} documentos, ${stats.totalCompleted} treinamentos concluídos`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Documentos" value={stats?.totalDocs ?? 0} color="text-slate-800" />
        <StatCard label="Publicados" value={stats?.publishedDocs ?? 0} color="text-slate-800" />
        <StatCard label="Rascunhos" value={stats?.draftDocs ?? 0} color="text-slate-800" />
        <StatCard label="Trein. Concluídos" value={stats?.totalCompleted ?? 0} color="text-slate-800" />
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Setores" value={stats?.totalSectors ?? 0} color="text-slate-800" />
          <StatCard label="Usuários" value={stats?.totalUsers ?? 0} color="text-slate-800" />
          <StatCard label="Categorias" value={stats?.totalCategories ?? 0} color="text-slate-800" />
          <StatCard label="Arquivados" value={stats?.archivedDocs ?? 0} color="text-slate-500" />
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">Documentos Recentes</h3>
          <button onClick={() => navigate('/documentos')} className="text-xs text-clinical-600 hover:underline">
            Ver todos
          </button>
        </div>
        {RECENT_DOCS.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Nenhum documento ainda</p>
        ) : (
          <div className="space-y-3">
            {RECENT_DOCS.map(doc => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0 cursor-pointer hover:bg-slate-50 -mx-4 px-4 rounded-xl transition-colors"
                onClick={() => navigate(`/documentos/${doc.id}`)}>
                <div>
                  <p className="text-sm font-medium text-slate-700">{doc.title}</p>
                  <p className="text-xs text-slate-400">{doc.sector}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
