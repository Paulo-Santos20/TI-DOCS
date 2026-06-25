import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, ClipboardList, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import { getSocket, connectSocket } from '../../lib/socket'
import { useEscape } from '../../hooks/useEscape'

const typeIcon: Record<string, React.ReactNode> = {
  assignment: <ClipboardList size={18} />,
  approval: <CheckCircle size={18} />,
  comment: <MessageSquare size={18} />,
  system: <AlertCircle size={18} />,
}

export default function NotificationBell() {
  const { addToast } = useToast()
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const mountedRef = useRef(true)

  useEscape(() => setOpen(false), open)
  const socketRegistered = useRef(false)

  const load = async () => {
    try {
      const [{ data: cnt }, { data: list }] = await Promise.all([
        api.get('/notifications/unread-count'),
        api.get('/notifications'),
      ])
      console.debug('[NotificationBell] cnt', cnt, 'list', list)
      if (!mountedRef.current) return
      setCount(cnt?.count ?? 0)
      setNotifs(list ?? [])
    } catch (err: any) { console.error('[NotificationBell] load error', err.message); addToast('Erro ao carregar notificações', 'error') }
  }

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    load()
    const token = localStorage.getItem('token')
    if (!token) return

    connectSocket(token)
    const s = getSocket()
    if (s && !socketRegistered.current) {
      s.on('notification:new', load)
      socketRegistered.current = true
    }
    return () => {
      if (s) {
        s.off('notification:new', load)
        socketRegistered.current = false
      }
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      load()
    } catch { addToast('Erro ao marcar notificação', 'error') }
  }

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all')
      load()
    } catch { addToast('Erro ao marcar notificações', 'error') }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 relative"
        aria-label="Notificações"
      >
        <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg"
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 glass-elevated rounded-2xl z-50 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b shrink-0"
              style={{ borderColor: 'var(--glass-border-strong)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notificações
              </h3>
              {count > 0 && (
                <button onClick={markAllRead}
                  className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--clinical-600)' }}>
                  <CheckCheck size={14} />
                  Marcar todas
                </button>
              )}
            </div>
            {notifs.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                Nenhuma notificação
              </p>
            ) : (
              <div>
                {notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); if (n.link) navigate(n.link) }}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 border-b last:border-0 ${
                      !n.read ? '' : ''
                    }`}
                    style={{
                      borderColor: 'var(--glass-border-strong)',
                      background: !n.read ? 'var(--clinical-50)' : 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-100)' }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = !n.read ? 'var(--clinical-50)' : 'transparent'
                    }}
                  >
                    <span className="shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {typeIcon[n.type] || <AlertCircle size={18} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
