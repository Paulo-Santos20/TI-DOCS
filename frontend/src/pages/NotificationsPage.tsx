import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Notification {
  id: number; type: string; message: string; link: string | null
  read: boolean; createdAt: string
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/notifications').then(({ data }) => setNotifs(data)).catch(() => {})
  }, [])

  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await api.post('/notifications/read-all')
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const typeIcon: Record<string, string> = {
    assignment: '📋', approval: '✅', comment: '💬', system: '🔔',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Notificações</h1>
        {notifs.some(n => !n.read) && (
          <button onClick={markAllRead} className="text-sm text-clinical-600 hover:underline">
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifs.map(n => (
          <div key={n.id}
            className={`card cursor-pointer transition-colors ${!n.read ? 'border-l-4 border-l-clinical-500 bg-clinical-50/20' : ''}`}
            onClick={() => { markRead(n.id); if (n.link) navigate(n.link) }}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{typeIcon[n.type] || '🔔'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleDateString('pt-BR')} às {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-clinical-500 shrink-0 mt-2" />}
            </div>
          </div>
        ))}
        {notifs.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-12">Nenhuma notificação</p>
        )}
      </div>
    </div>
  )
}
