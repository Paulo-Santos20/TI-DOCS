import { useState } from 'react'
import AdminTabs from '../components/admin/AdminTabs'

interface Log {
  id: number; action: string; entityType: string
  entityId: number; details: any; createdAt: string
}

const MOCK_LOGS: Log[] = [
  { id: 1, action: 'create', entityType: 'document', entityId: 1, details: { title: 'POP-023' }, createdAt: new Date().toISOString() },
  { id: 2, action: 'update', entityType: 'document', entityId: 1, details: { title: 'POP-023' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, action: 'login', entityType: 'user', entityId: 1, details: {}, createdAt: new Date(Date.now() - 7200000).toISOString() },
]

export default function AdminAudit() {
  const [logs] = useState<Log[]>(MOCK_LOGS)

  const actionLabel = (action: string) => {
    const labels: Record<string, string> = { create: 'Criação', update: 'Alteração', delete: 'Exclusão', login: 'Login', publish: 'Publicação' }
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
                <td className="px-6 py-4 text-sm text-slate-500">{log.entityType} #{log.entityId}</td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {log.details?.title ? log.details.title : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(log.createdAt).toLocaleDateString('pt-BR')} às {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
