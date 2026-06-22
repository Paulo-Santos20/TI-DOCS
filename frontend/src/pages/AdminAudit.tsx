import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import api from '../lib/api'

interface Log {
  id: number; userId: number; action: string; entityType: string
  entityId: number | null; details: any; createdAt: string
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    api.get('/audit').then(({ data }) => setLogs(data)).catch(() => {})
  }, [])

  const actionLabel = (action: string) => {
    const labels: Record<string, string> = { create: 'Criação', update: 'Alteração', delete: 'Exclusão', login: 'Login', publish: 'Publicação', add_tag: 'Add Tag', remove_tag: 'Remover Tag', status_change: 'Mudou Status', toggle_active: 'Ativar/Desativar' }
    return labels[action] || action
  }

  const actionColor = (action: string) => {
    if (action === 'create') return 'bg-health-50 text-health-600'
    if (action === 'delete') return 'bg-red-50 text-red-500'
    if (action === 'publish') return 'bg-blue-50 text-blue-600'
    return 'bg-slate-100 text-slate-500'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Administração</h1>
        <p className="text-slate-500 mt-1">Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <h2 className="text-lg font-semibold text-slate-700 mb-4">Log de Atividades</h2>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Ação</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Entidade</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Detalhes</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Data</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${actionColor(log.action)}`}>
                    {actionLabel(log.action)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{log.entityType}{log.entityId ? ` #${log.entityId}` : ''}</td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {log.details?.title || JSON.stringify(log.details) || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(log.createdAt).toLocaleDateString('pt-BR')} às {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                Nenhuma atividade registrada
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
