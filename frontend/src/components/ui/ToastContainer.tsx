import { useEffect, useRef } from 'react'
import { useToast } from '../../contexts/ToastContext'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const typeConfig: Record<string, { icon: React.ReactNode; borderVar: string }> = {
  success: { icon: <CheckCircle size={18} />, borderVar: 'var(--health-500)' },
  error: { icon: <XCircle size={18} />, borderVar: 'var(--red-500)' },
  info: { icon: <Info size={18} />, borderVar: 'var(--clinical-500)' },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()
  const pausedRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return
      const now = Date.now()
      for (const toast of toasts) {
        if (now - toast.createdAt >= toast.duration) {
          removeToast(toast.id)
        }
      }
    }, 500)
    return () => clearInterval(interval)
  }, [toasts, removeToast])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none max-h-[80vh] overflow-y-auto"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      {toasts.map(toast => {
        const cfg = typeConfig[toast.type]
        return (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in max-w-sm glass-elevated"
          style={{ borderColor: cfg.borderVar, color: 'var(--text-primary)' }}
        >
          <span className="shrink-0 mt-0.5" style={{ color: cfg.borderVar }}>
            {cfg.icon}
          </span>
          <p className="text-sm leading-snug flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-50 hover:opacity-100 transition-opacity shrink-0 leading-none"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>
        )
      })}
    </div>
  )
}
