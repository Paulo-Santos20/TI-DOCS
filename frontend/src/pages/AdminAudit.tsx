import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import { TableSkeleton } from '../components/ui/Skeleton'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'

interface Log {
  id: number; userId: number; userName: string | null; userEmail: string | null; action: string; entityType: string
  entityId: number | null; details: any; createdAt: string
}

export default function AdminAudit() {
  const { addToast } = useToast()
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/audit').then(({ data }) => setLogs(data)).catch(() => addToast('Erro ao carregar auditoria', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const entityLabel = (type: string) => {
    const map: Record<string, string> = { user: 'Usuário', document: 'Documento', sector: 'Setor', category: 'Categoria', tag: 'Tag', template: 'Modelo', comment: 'Comentário', assignment: 'Atribuição', notification: 'Notificação', setting: 'Configuração', file: 'Arquivo', training: 'Treinamento' }
    return map[type] || type
  }

  const formatDetails = (log: Log) => {
    const { ip: _ip, userAgent: _ua, ...rest } = log.details || {}
    if (rest.title) return rest.title
    if (rest.email) return rest.email
    if (rest.name) return rest.name
    if (log.action === 'status_change' && rest.status) return `Status: "${rest.status}"`
    if (log.action === 'toggle_active') return rest.isActive ? 'Usuário ativado' : 'Usuário desativado'
    if (log.action === 'add_tag' && rest.tagId) return `Tag #${rest.tagId} adicionada`
    if (log.action === 'remove_tag' && rest.tagId) return `Tag #${rest.tagId} removida`
    if (Object.keys(rest).length === 0) return '-'
    return JSON.stringify(rest)
  }

  const actionLabel = (action: string) => {
    const labels: Record<string, string> = { create: 'Criação', update: 'Alteração', delete: 'Exclusão', login: 'Login', publish: 'Publicação', add_tag: 'Add Tag', remove_tag: 'Remover Tag', status_change: 'Mudou Status', toggle_active: 'Ativar/Desativar' }
    return labels[action] || action
  }

  const actionColor = (action: string) => {
    if (action === 'create') return { bg: 'color-mix(in srgb, var(--health-500) 15%, transparent)', text: 'var(--health-600)' }
    if (action === 'delete') return { bg: 'color-mix(in srgb, var(--red-500) 15%, transparent)', text: 'var(--red-500)' }
    if (action === 'publish') return { bg: 'color-mix(in srgb, var(--blue-600) 15%, transparent)', text: 'var(--blue-600)' }
    return { bg: 'color-mix(in srgb, var(--text-muted) 10%, transparent)', text: 'var(--text-secondary)' }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Administração</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Log de Atividades</h2>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
      <div className="card p-0 overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border-strong)' }}>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Usuário</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Ação</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Entidade</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Detalhes</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>IP</th>
              <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border-strong)' }}
                className="transition-colors"
                onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 30%, transparent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {log.userName || log.userEmail || `#${log.userId}`}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                    background: actionColor(log.action).bg,
                    color: actionColor(log.action).text,
                  }}>
                    {actionLabel(log.action)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{entityLabel(log.entityType)}{log.entityId ? ` #${log.entityId}` : ''}</td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {formatDetails(log)}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {log.details?.ip || '-'}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {new Date(log.createdAt).toLocaleDateString('pt-BR')} às {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Nenhuma atividade registrada
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
