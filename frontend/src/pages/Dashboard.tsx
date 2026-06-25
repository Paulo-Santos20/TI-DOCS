import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import StatCard from '../components/ui/StatCard'
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton'
import { FileText, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardStats {
  totalDocs: number
  publishedDocs: number
  draftDocs: number
  archivedDocs: number
  totalSectors: number
  totalUsers: number
  totalCompleted: number
  totalCategories: number
}

interface RecentDoc {
  id: number; title: string; sectorName?: string; contentType: string; updatedAt: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState(false)
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([])
  const [docsLoading, setDocsLoading] = useState(true)

  const loadStats = () => {
    setStatsLoading(true)
    setStatsError(false)
    api.get('/dashboard/stats')
      .then(({ data }) => {
        console.debug('[Dashboard] stats received', data)
        setStats(data)
      })
      .catch((err) => { console.error('[Dashboard] stats error', err.message); setStats(null); setStatsError(true); addToast('Erro ao carregar estatísticas', 'error') })
      .finally(() => setStatsLoading(false))
  }

  useEffect(loadStats, [])

  useEffect(() => {
    api.get('/documents', { params: { limit: 5 } })
      .then(({ data }) => {
        console.debug('[Dashboard] recent docs received', data)
        setRecentDocs(data.data || [])
      })
      .catch((err) => { console.error('[Dashboard] recent docs error', err.message); addToast('Erro ao carregar documentos recentes', 'error') })
      .finally(() => setDocsLoading(false))
  }, [])

  if (statsLoading && !stats) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-8 w-48 rounded-lg animate-shimmer" style={{ background: 'var(--glass-clear)' }} />
          <div className="h-5 w-72 rounded-lg animate-shimmer mt-2" style={{ background: 'var(--glass-clear)' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Bem-vindo, {user?.name}!
          {stats && ` ${stats.totalDocs} documentos, ${stats.totalCompleted} treinamentos concluídos`}
        </p>
      </div>

      {statsError ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center mb-8"
        >
          <AlertTriangle size={32} className="mx-auto mb-3" style={{ color: 'var(--amber-500)' }} />
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Erro ao carregar estatísticas do servidor
          </p>
          <button onClick={loadStats} className="btn-primary text-sm inline-flex items-center gap-2">
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Documentos" value={stats?.totalDocs ?? 0} index={0} />
            <StatCard label="Publicados" value={stats?.publishedDocs ?? 0} index={1} />
            <StatCard label="Rascunhos" value={stats?.draftDocs ?? 0} index={2} />
            <StatCard label="Trein. Concluídos" value={stats?.totalCompleted ?? 0} index={3} />
          </div>

          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <StatCard label="Setores" value={stats?.totalSectors ?? 0} index={4} />
              <StatCard label="Usuários" value={stats?.totalUsers ?? 0} index={5} />
              <StatCard label="Categorias" value={stats?.totalCategories ?? 0} index={6} />
              <StatCard label="Arquivados" value={stats?.archivedDocs ?? 0} index={7} />
            </motion.div>
          )}
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Documentos Recentes
          </h3>
          <button
            onClick={() => navigate('/documentos')}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: 'var(--clinical-600)' }}
          >
            Ver todos
            <ArrowRight size={14} />
          </button>
        </div>
        {docsLoading ? (
          <TableSkeleton rows={3} />
        ) : recentDocs.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Nenhum documento ainda
          </p>
        ) : (
          <div className="space-y-1">
            {recentDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => navigate(`/documentos/${doc.id}`)}
                className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl cursor-pointer transition-all duration-200"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-clear)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="shrink-0" style={{ color: 'var(--clinical-500)' }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{doc.sectorName}</p>
                  </div>
                </div>
                <span className="text-xs shrink-0 ml-3" style={{ color: 'var(--text-muted)' }}>
                  {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
