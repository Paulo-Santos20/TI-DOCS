import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import ReportFilters, { FilterState } from '../components/reports/ReportFilters'
import ExportButton from '../components/reports/ExportButton'

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
  const isAdmin = user?.role === 'admin'

  const [data, setData] = useState<ReportData>(emptyReport)
  const [filters, setFilters] = useState<FilterState>({
    sector: 'all', person: 'all', period: '30d', status: 'all',
  })

  useEffect(() => {
    api.get('/reports').then(({ data }) => setData(data)).catch(() => {})
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

  const selectedPerson = filters.person !== 'all'
    ? (() => {
        const p = data.users.find(u => u.name === filters.person)
        return p ? { ...p, documents: filterDocs(p.documents) } : null
      })()
    : null

  const filteredCritical = data.criticalDocuments.filter(d =>
    filters.sector === 'all' || d.sector === filters.sector
  )

  const filteredPopular = data.popularDocuments

  const totalCompleted = filteredUsers.reduce((acc, u) => acc + u.documents.filter(d => d.completed).length, 0)
  const avgCompletion = filteredUsers.length > 0
    ? Math.round(filteredUsers.reduce((acc, u) => acc + u.totalProgress, 0) / filteredUsers.length)
    : 0

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

  const exportCsvData = () => {
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
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-slate-500 mt-1">
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

      <div id="report-content">
        {isAdmin ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <span className="text-sm font-medium text-slate-500">Total de Usuários</span>
                <p className="mt-2 text-3xl font-bold text-slate-800">{filteredUsers.length}</p>
              </div>
              <div className="card">
                <span className="text-sm font-medium text-slate-500">Docs Concluídos</span>
                <p className="mt-2 text-3xl font-bold text-slate-800">{totalCompleted}</p>
              </div>
              <div className="card">
                <span className="text-sm font-medium text-slate-500">Taxa Média</span>
                <p className="mt-2 text-3xl font-bold text-health-600">{avgCompletion}%</p>
              </div>
              <div className="card">
                <span className="text-sm font-medium text-slate-500">Docs Críticos</span>
                <p className="mt-2 text-3xl font-bold text-amber-500">{filteredCritical.length}</p>
              </div>
            </div>

            {selectedPerson ? (
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{selectedPerson.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm text-slate-400">{selectedPerson.sector}</span>
                      <span className="text-xs text-slate-300">|</span>
                      <span className="text-sm text-slate-400">
                        Último acesso: {formatDateTime(selectedPerson.lastAccess)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{selectedPerson.totalProgress}%</p>
                    <p className="text-xs text-slate-400">progresso geral</p>
                  </div>
                </div>
              </div>
            ) : null}

            {selectedPerson ? (
              <div className="card p-0 overflow-hidden mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Documento</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Setor</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Progresso</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Último Acesso</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPerson.documents.map((doc, i) => (
                      <tr key={i} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{doc.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{doc.sector}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  doc.percentage === 100 ? 'bg-health-500' : doc.percentage > 50 ? 'bg-clinical-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${doc.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-500 w-10 text-right">{doc.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {doc.lastAccess ? (
                            <span>{formatDate(doc.lastAccess)} às {formatTime(doc.lastAccess)}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {doc.completed ? (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-health-50 text-health-600">Concluído</span>
                          ) : doc.percentage > 0 ? (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Em andamento</span>
                          ) : (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-400">Não iniciado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <h3 className="font-semibold text-slate-700 mb-4">Progresso por Usuário</h3>
                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Nenhum usuário encontrado</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredUsers.map(u => (
                        <div key={u.name}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div>
                              <span className="text-sm font-medium text-slate-700">{u.name}</span>
                              <span className="text-xs text-slate-400 ml-2">{u.sector}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{formatDateTime(u.lastAccess)}</span>
                              <span className="text-sm font-medium text-slate-600">{u.totalProgress}%</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                u.totalProgress === 100 ? 'bg-health-500' : u.totalProgress > 50 ? 'bg-clinical-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${u.totalProgress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 className="font-semibold text-slate-700 mb-4">Documentos mais Lidos</h3>
                  <div className="space-y-3">
                    {filteredPopular.map(doc => (
                      <div key={doc.title} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                        <span className="text-sm text-slate-700">{doc.title}</span>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
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
                  <h3 className="font-semibold text-slate-700">Documentos Críticos</h3>
                  <span className="text-xs font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                    +90 dias sem atualização
                  </span>
                </div>
                {filteredCritical.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Nenhum documento crítico</p>
                ) : (
                  <div className="space-y-3">
                    {filteredCritical.map(doc => (
                      <div key={doc.title} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-amber-500">⚠️</span>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{doc.title}</p>
                            <p className="text-xs text-slate-400">{doc.sector}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-red-500">{doc.daysSinceUpdate} dias</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <span className="text-sm font-medium text-slate-500">Documentos Lidos</span>
                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {currentUserDetail?.documents.filter(d => d.completed).length || 0}
                </p>
              </div>
              <div className="card">
                <span className="text-sm font-medium text-slate-500">Pendentes</span>
                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {currentUserDetail?.documents.filter(d => !d.completed).length || 0}
                </p>
              </div>
              <div className="card">
                <span className="text-sm font-medium text-slate-500">Progresso</span>
                <p className="mt-2 text-3xl font-bold text-health-600">{currentUserDetail?.totalProgress || 0}%</p>
              </div>
              <div className="card">
                <span className="text-sm font-medium text-slate-500">Último Acesso</span>
                <p className="mt-2 text-lg font-bold text-slate-800">{currentUserDetail ? formatDateTime(currentUserDetail.lastAccess) : '-'}</p>
              </div>
            </div>

            <div className="card p-0 overflow-hidden mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Documento</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Setor</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Progresso</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Último Acesso</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentUserDetail?.documents || []).map((doc, i) => (
                    <tr key={i} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{doc.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{doc.sector}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                doc.percentage === 100 ? 'bg-health-500' : doc.percentage > 50 ? 'bg-clinical-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${doc.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500 w-10 text-right">{doc.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {doc.lastAccess ? (
                          <span>{formatDate(doc.lastAccess)} às {formatTime(doc.lastAccess)}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {doc.completed ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-health-50 text-health-600">Concluído</span>
                        ) : doc.percentage > 0 ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Em andamento</span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-400">Não iniciado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="font-semibold text-slate-700 mb-2">Seu Progresso Geral</h3>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-clinical-500 to-health-500 transition-all duration-700"
                  style={{ width: `${currentUserDetail?.totalProgress || 0}%` }}
                />
              </div>
              <p className="text-sm text-slate-400 mt-2">
                {currentUserDetail?.documents.filter(d => d.completed).length || 0} de {data.totalDocs} documentos concluídos
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
