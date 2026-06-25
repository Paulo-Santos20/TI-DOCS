import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, CheckCircle, MessageSquare, Bell, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'

interface Notification {
  id: number; type: string; message: string; link: string | null
  read: boolean; createdAt: string
}

export default function NotificationsPage() {
  const { addToast } = useToast()
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.get('/notifications').then(({ data }) => setNotifs(data)).catch(() => addToast('Erro ao carregar notificações', 'error')).finally(() => setLoading(false))
  }, [])

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { addToast('Erro ao marcar notificação', 'error') }
  }

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all')
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    } catch { addToast('Erro ao marcar notificações', 'error') }
  }

  const typeIcon: Record<string, React.ReactNode> = {
    assignment: <ClipboardList size={20} />,
    approval: <CheckCircle size={20} />,
    comment: <MessageSquare size={20} />,
    system: <Bell size={20} />,
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Notificações
        </h1>
        {notifs.some(n => !n.read) && (
          <button onClick={markAllRead} className="text-sm flex items-center gap-1 transition-colors"
            style={{ color: 'var(--clinical-600)' }}>
            Marcar todas como lidas
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-shimmer" style={{ background: 'var(--glass-clear)' }} />
        )) : notifs.map(n => (
          <div key={n.id}
            className={`card cursor-pointer transition-all duration-200 ${
              !n.read ? '' : 'opacity-70'
            }`}
            style={{
              borderLeft: !n.read ? '3px solid var(--clinical-500)' : undefined,
              background: !n.read ? 'color-mix(in srgb, var(--clinical-50) 40%, transparent)' : undefined,
            }}
            onClick={() => { markRead(n.id); if (n.link) navigate(n.link) }}>
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5" style={{ color: 'var(--clinical-500)' }}>
                {typeIcon[n.type] || <Bell size={20} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {new Date(n.createdAt).toLocaleDateString('pt-BR')} às {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: 'var(--clinical-500)' }} />}
            </div>
          </div>
        ))}
        {notifs.length === 0 && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>Nenhuma notificação</p>
        )}
      </div>
    </div>
  )
}
