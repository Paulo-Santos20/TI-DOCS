import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import ReportFilters, { FilterState } from '../components/reports/ReportFilters'
import ExportButton from '../components/reports/ExportButton'
import { AlertTriangle } from 'lucide-react'

interface DocProgress {
  title: string; sector: string; percentage: number
  lastAccess: string | null; completed: boolean
}

interface UserDetail {
  name: string; sector: string; lastAccess: string
  totalProgress: number; documents: DocProgress[]
}

interface ReportData {
  isAdmin: boolean; users: UserDetail[]; criticalDocuments: { title: string; sector: string; daysSinceUpdate: number }[]
  popularDocuments: { title: string; count: number }[]; totalDocs: number
}

const emptyReport: ReportData = { isAdmin: false, users: [], criticalDocuments: [], popularDocuments: [], totalDocs: 0 }

export default function Reports() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const isAdmin = user?.role === 'admin'

  const [data, setData] = useState<ReportData>(emptyReport)
  const [filters, setFilters] = useState<FilterState>({
    sector: 'all', person: 'all', period: '30d', status: 'all',
  })

  useEffect(() => {
    api.get('/reports').then(({ data }) => setData(data)).catch(() => addToast('Erro ao carregar relatórios', 'error'))
  }, [])

  const sectors = useMemo(() => {
    const s = new Set<string>()
    for (const u of data.users) s.add(u.sector)
    return Array.from(s).filter(Boolean)
  }, [data.users])

  const people = useMemo(() => data.users.map(u => u.name), [data.users])

  const isPeriodMatch = (iso: string | null, period: string) => {
    if (!iso || period === 'all') return true
    const days: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
    const diff = (Date.now() - new Date(iso).getTime()) / 86400000
    return diff <= (days[period] || Infinity)
  }

  const isStatusMatch = (completed: boolean, percentage: number, status: string): boolean => {
    if (status === 'all') return true
    if (status === 'completed') return completed
    if (status === 'pending') return !completed || percentage < 100
    return true
  }

  const filterDocs = (docs: DocProgress[]) => docs.filter(d =>
    isPeriodMatch(d.lastAccess, filters.period) &&
    isStatusMatch(d.completed, d.percentage, filters.status)
  )

  const filteredUsers = useMemo(() => {
    return data.users
      .filter(u =>
        (filters.sector === 'all' || u.sector === filters.sector) &&
        (filters.person === 'all' || u.name === filters.person)
      )
      .map(u => ({ ...u, documents: filterDocs(u.documents) }))
  }, [data.users, filters.sector, filters.person, filters.period, filters.status])

  const selectedPerson = useMemo(() => filters.person !== 'all'
    ? (() => {
        const p = data.users.find(u => u.name === filters.person)
        return p ? { ...p, documents: filterDocs(p.documents) } : null
      })()
    : null, [data.users, filters.person, filters.period, filters.status])

  const filteredCritical = useMemo(() => data.criticalDocuments.filter(d =>
    filters.sector === 'all' || d.sector === filters.sector
  ), [data.criticalDocuments, filters.sector])

  const filteredPopular = data.popularDocuments

  const totalCompleted = useMemo(() => filteredUsers.reduce((acc, u) => acc + u.documents.filter(d => d.completed).length, 0), [filteredUsers])
  const avgCompletion = useMemo(() => filteredUsers.length > 0
    ? Math.round(filteredUsers.reduce((acc, u) => acc + u.totalProgress, 0) / filteredUsers.length)
    : 0, [filteredUsers])

  const currentUserDetail = !isAdmin
    ? data.users.find(u => u.name === user?.name) || null
    : null

  const formatDateTime = (iso: string | null) => {
    if (!iso) return '-'
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('pt-BR')
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const exportCsvData = useCallback(() => {
    if (selectedPerson) {
      return {
        filename: `relatorio-${selectedPerson.name.toLowerCase().replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}`,
        headers: ['Documento', 'Setor', 'Progresso', 'Último Acesso', 'Concluído'],
        rows: selectedPerson.documents.map(d => [
          d.title, d.sector, `${d.percentage}%`,
          formatDateTime(d.lastAccess), d.completed ? 'Sim' : 'Não',
        ]),
      }
    }
    if (isAdmin) {
      return {
        filename: `relatorio-admin-${new Date().toISOString().split('T')[0]}`,
        headers: ['Usuário', 'Setor', 'Progresso', 'Último Acesso'],
        rows: filteredUsers.map(u => [
          u.name, u.sector, `${u.totalProgress}%`, formatDateTime(u.lastAccess),
        ]),
      }
    }
    return {
      filename: `relatorio-usuario-${new Date().toISOString().split('T')[0]}`,
      headers: ['Documento', 'Setor', 'Progresso', 'Último Acesso', 'Concluído'],
      rows: (currentUserDetail?.documents || []).map(d => [
        d.title, d.sector, `${d.percentage}%`,
        formatDateTime(d.lastAccess), d.completed ? 'Sim' : 'Não',
      ]),
    }
  }, [selectedPerson, isAdmin, filteredUsers, currentUserDetail, formatDateTime])

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Relatórios</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isAdmin ? 'Acompanhe o progresso geral dos treinamentos' : 'Seu histórico e progresso de treinamentos'}
          </p>
        </div>
        <ExportButton csvData={exportCsvData} reportTitle="TI DOCS - Relatório de Treinamentos" />
      </div>

      <ReportFilters
        sectors={sectors}
        people={people}
        isAdmin={isAdmin}
        onFilter={setFilters}
      />

      <div id="report-content" className="space-y-6">
        {isAdmin ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total de Usuários</span>
                <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{filteredUsers.length}</p>
              </div>
              <div className="card">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Docs Concluídos</span>
                <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalCompleted}</p>
              </div>
              <div className="card">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Taxa Média</span>
                <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--health-500)' }}>{avgCompletion}%</p>
              </div>
              <div className="card">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Docs Críticos</span>
                <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--amber-500)' }}>{filteredCritical.length}</p>
              </div>
            </div>

            {selectedPerson ? (
              <div className="card">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedPerson.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedPerson.sector}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>|</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Último acesso: {formatDateTime(selectedPerson.lastAccess)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedPerson.totalProgress}%</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>progresso geral</p>
                  </div>
                </div>
              </div>
            ) : null}

            {selectedPerson ? (
              <div className="card p-0 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--glass-border-strong)' }}>
                      <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Documento</th>
                      <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Setor</th>
                      <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Progresso</th>
                      <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Último Acesso</th>
                      <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPerson.documents.map((doc, i) => (
                      <tr key={i} className="border-b transition-colors"
                        style={{ borderColor: 'var(--glass-border-strong)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-100)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{doc.title}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{doc.sector}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                              <div className={`h-full rounded-full ${
                                doc.percentage === 100 ? 'bg-health-500' : doc.percentage > 50 ? 'bg-clinical-500' : 'bg-amber-500'
                              }`} style={{ width: `${doc.percentage}%` }} />
                            </div>
                            <span className="text-xs font-medium w-10 text-right" style={{ color: 'var(--text-muted)' }}>{doc.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                          {doc.lastAccess ? `${formatDate(doc.lastAccess)} às ${formatTime(doc.lastAccess)}` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {doc.completed ? (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-health-50 text-health-600">Concluído</span>
                          ) : doc.percentage > 0 ? (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Em andamento</span>
                          ) : (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100" style={{ color: 'var(--text-muted)' }}>Não iniciado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Progresso por Usuário</h3>
                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhum usuário encontrado</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredUsers.map(u => (
                        <div key={u.name}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div>
                              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                              <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{u.sector}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(u.lastAccess)}</span>
                              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.totalProgress}%</span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                            <div className={`h-full rounded-full transition-all duration-500 ${
                              u.totalProgress === 100 ? 'bg-health-500' : u.totalProgress > 50 ? 'bg-clinical-500' : 'bg-amber-500'
                            }`} style={{ width: `${u.totalProgress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Documentos mais Lidos</h3>
                  <div className="space-y-3">
                    {filteredPopular.map(doc => (
                      <div key={doc.title} className="flex items-center justify-between py-2 border-b last:border-0"
                        style={{ borderColor: 'var(--glass-border-strong)' }}>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{doc.title}</span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'var(--slate-100)', color: 'var(--text-muted)' }}>
                          {doc.count} leituras
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!selectedPerson && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Documentos Críticos</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--amber-50)', color: 'var(--amber-600)' }}>
                    +90 dias sem atualização
                  </span>
                </div>
                {filteredCritical.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhum documento crítico</p>
                ) : (
                  <div className="space-y-3">
                    {filteredCritical.map(doc => (
                      <div key={doc.title} className="flex items-center justify-between py-3 border-b last:border-0"
                        style={{ borderColor: 'var(--glass-border-strong)' }}>
                        <div className="flex items-center gap-3">
                          <AlertTriangle size={18} style={{ color: 'var(--amber-500)' }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{doc.title}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{doc.sector}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--red-500)' }}>{doc.daysSinceUpdate} dias</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Documentos Lidos</span>
                <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {currentUserDetail?.documents.filter(d => d.completed).length || 0}
                </p>
              </div>
              <div className="card">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Pendentes</span>
                <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {currentUserDetail?.documents.filter(d => !d.completed).length || 0}
                </p>
              </div>
              <div className="card">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Progresso</span>
                <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--health-500)' }}>{currentUserDetail?.totalProgress || 0}%</p>
              </div>
              <div className="card">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Último Acesso</span>
                <p className="mt-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{currentUserDetail ? formatDateTime(currentUserDetail.lastAccess) : '-'}</p>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--glass-border-strong)' }}>
                    <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Documento</th>
                    <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Setor</th>
                    <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Progresso</th>
                    <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Último Acesso</th>
                    <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentUserDetail?.documents || []).map((doc, i) => (
                    <tr key={i} className="border-b transition-colors"
                      style={{ borderColor: 'var(--glass-border-strong)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-100)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{doc.title}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{doc.sector}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                            <div className={`h-full rounded-full ${
                              doc.percentage === 100 ? 'bg-health-500' : doc.percentage > 50 ? 'bg-clinical-500' : 'bg-amber-500'
                            }`} style={{ width: `${doc.percentage}%` }} />
                          </div>
                          <span className="text-xs font-medium w-10 text-right" style={{ color: 'var(--text-muted)' }}>{doc.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        {doc.lastAccess ? `${formatDate(doc.lastAccess)} às ${formatTime(doc.lastAccess)}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {doc.completed ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-health-50 text-health-600">Concluído</span>
                        ) : doc.percentage > 0 ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Em andamento</span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100" style={{ color: 'var(--text-muted)' }}>Não iniciado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Seu Progresso Geral</h3>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                <div className="h-full rounded-full bg-gradient-to-r from-clinical-500 to-health-500 transition-all duration-700"
                  style={{ width: `${currentUserDetail?.totalProgress || 0}%` }} />
              </div>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                {currentUserDetail?.documents.filter(d => d.completed).length || 0} de {data.totalDocs} documentos concluídos
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
