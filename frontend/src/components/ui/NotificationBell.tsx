import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { getSocket, connectSocket } from '../../lib/socket'

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const [{ data: cnt }, { data: list }] = await Promise.all([
        api.get('/notifications/unread-count'),
        api.get('/notifications'),
      ])
      setCount(cnt.count)
      setNotifs(list)
    } catch {}
  }

  useEffect(() => {
    load()
    const token = localStorage.getItem('token')
    if (token) {
      connectSocket(token)
      const s = getSocket()
      s?.on('notification:new', (notification: any) => {
        load()
      })
    }
    const i = setInterval(load, 30000)
    return () => { clearInterval(i) }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`)
    load()
  }

  const markAllRead = async () => {
    await api.post('/notifications/read-all')
    load()
  }

  const typeIcon: Record<string, string> = {
    assignment: '📋', approval: '✅', comment: '💬', system: '🔔',
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(!open); if (!open) load() }}
        className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-200/30 transition-all duration-200">
        🔔
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">Notificações</h3>
            {count > 0 && <button onClick={markAllRead} className="text-xs text-clinical-600 hover:underline">Marcar todas como lidas</button>}
          </div>
          {notifs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhuma notificação</p>
          ) : (
            <div>
              {notifs.map(n => (
                <button key={n.id} onClick={() => { markRead(n.id); if (n.link) navigate(n.link) }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 border-b border-slate-200 last:border-0 ${!n.read ? 'bg-clinical-50/50' : ''}`}>
                  <span className="text-lg">{typeIcon[n.type] || '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
